import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import { CryptoService } from 'src/common/crypto/providers/crypto.service';
import { Course } from 'src/courses/course.entity';
import { AppSetting } from 'src/settings/app-setting.entity';
import { User } from 'src/users/user.entity';
import { IsNull, Repository } from 'typeorm';
import { ActivateLicenseDto } from '../dtos/activate-license.dto';
import { LicensePlan } from '../enums/license-plan.enum';
import { LicenseStatus } from '../enums/license-status.enum';
import { License } from '../license.entity';
import {
  getPlanFromLicenseKey,
  LICENSE_PLANS,
  CertificateRule,
  LicenseFeatureKey,
  LicenseLimitKey,
  normalizeLicensePlan,
} from '../license-plans';

const LEGACY_LICENSE_SETTINGS_KEY = 'license_settings';
const LICENSE_INSTANCE_KEY = 'license_instance_settings';
const DEFAULT_PORTAL_CHECK_INTERVAL_MS = 10_000;
const DEFAULT_PORTAL_GRACE_DAYS = 7;

export type LicensePortalActivation = {
  license: {
    product?: string | null;
    plan: string;
    expiresAt?: string | null;
    maxActivations?: number | null;
    activeActivations?: number | null;
    limits?: Partial<Record<LicenseLimitKey, number | null>>;
  };
  activation?: {
    id?: string | null;
    status?: string | null;
  };
  signature?: string | null;
};

@Injectable()
export class LicensesService {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(AppSetting)
    private readonly appSettingRepository: Repository<AppSetting>,

    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService,
  ) {}

  async activate(dto: ActivateLicenseDto) {
    const key = dto.key.trim();
    const portalActivation = await this.activateAgainstPortal(key);
    await this.savePortalActivation(key, portalActivation);

    return this.getCurrent();
  }

  async savePortalActivation(
    licenseKey: string,
    activation: LicensePortalActivation,
  ) {
    const plan = normalizeLicensePlan(activation.license.plan);

    if (!plan) {
      throw new BadRequestException(
        `Unsupported license plan: ${activation.license.plan}`,
      );
    }

    return this.saveActivatedLicense({
      licenseKey,
      plan,
      productSlug: activation.license.product,
      activationId: activation.activation?.id,
      activationStatus: activation.activation?.status,
      expiresAt: activation.license.expiresAt
        ? new Date(activation.license.expiresAt)
        : null,
      metadata: {
        maxActivations: activation.license.maxActivations,
        activeActivations: activation.license.activeActivations,
        limits: activation.license.limits,
        signature: activation.signature,
      },
      activatedAt: new Date(),
    });
  }

  async getCurrent() {
    const currentLicense = await this.getActiveLicense();
    const license = currentLicense
      ? await this.revalidateActiveLicense(currentLicense)
      : null;
    const plan = license ? this.getPlanDefinition(license) : null;
    const usage = await this.getUsage();

    return {
      license,
      plan,
      usage,
      locked: plan
        ? this.getLockedState(plan.limits, usage)
        : {
            users: true,
            courses: true,
            faculty: true,
          },
    };
  }

  async assertActiveLicense() {
    const license = await this.getActiveLicense();

    if (!license) {
      throw new UnauthorizedException(
        'KASA is not activated. Please activate a license during installation.',
      );
    }

    const revalidatedLicense = await this.revalidateActiveLicense(license);

    if (!revalidatedLicense) {
      throw new UnauthorizedException(
        'KASA license is no longer active. Please activate a valid license.',
      );
    }

    return revalidatedLicense;
  }

  async getEffectivePlan() {
    const license = await this.assertActiveLicense();
    const plan = this.getPlanDefinition(license);

    return plan;
  }

  async assertFeature(feature: LicenseFeatureKey) {
    const plan = await this.getEffectivePlan();

    if (!plan.features[feature]) {
      throw new HttpException(
        `${plan.label} does not include this feature. Please upgrade to unlock it.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  async getCertificateRule(): Promise<CertificateRule> {
    const plan = await this.getEffectivePlan();

    await this.assertFeature('certificates');

    return plan.rules.certificateRule;
  }

  async assertCanCreateUser() {
    await this.assertWithinLimit('users');
  }

  async assertCanCreateCourse() {
    await this.assertFeature('courses');
    await this.assertWithinLimit('courses');
  }

  async assertCanCreateFaculty() {
    await this.assertFeature('faculty');
    await this.assertWithinLimit('faculty');
  }

  private async assertWithinLimit(limitKey: LicenseLimitKey) {
    const plan = await this.getEffectivePlan();
    const limit = plan.limits[limitKey];

    if (limit === null) return;

    const usage = await this.getUsage();

    if (usage[limitKey] >= limit) {
      throw new HttpException(
        `${plan.label} allows up to ${limit} ${limitKey}. Please upgrade to add more.`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }

  private async getActiveLicense() {
    const now = new Date();
    let license = await this.licenseRepository.findOne({
      where: { status: LicenseStatus.ACTIVE },
      order: { activatedAt: 'DESC', createdAt: 'DESC' },
    });

    if (!license) {
      license = await this.importLegacyInstallerLicense();
    }

    if (!license) return null;

    if (license.expiresAt && license.expiresAt <= now) {
      license.status = LicenseStatus.EXPIRED;
      await this.licenseRepository.save(license);
      return null;
    }

    return license;
  }

  private async saveActivatedLicense(payload: {
    licenseKey: string;
    plan: LicensePlan;
    purchaserEmail?: string | null;
    productSlug?: string | null;
    activationId?: string | null;
    activationStatus?: string | null;
    expiresAt?: Date | null;
    metadata?: Record<string, unknown>;
    activatedAt: Date;
  }) {
    const normalizedKey = payload.licenseKey.trim();
    const identity = this.getKeyIdentity(normalizedKey);

    await this.licenseRepository.update(
      { status: LicenseStatus.ACTIVE },
      { status: LicenseStatus.REVOKED },
    );

    let license = await this.licenseRepository.findOne({
      where: { keyHash: identity.keyHash },
    });

    if (!license) {
      license = this.licenseRepository.create({
        keyHash: identity.keyHash,
        keyFingerprint: identity.keyFingerprint,
        keyLast4: identity.keyLast4,
      });
    }

    license.plan = payload.plan;
    license.status = LicenseStatus.ACTIVE;
    license.purchaserEmail = payload.purchaserEmail ?? license.purchaserEmail;
    license.productSlug = payload.productSlug ?? license.productSlug;
    license.activationId = payload.activationId ?? license.activationId;
    license.activationStatus =
      payload.activationStatus ?? license.activationStatus;
    license.expiresAt = payload.expiresAt ?? null;
    license.activatedAt = payload.activatedAt;
    license.metadata = {
      ...(license.metadata ?? {}),
      ...(payload.metadata ?? {}),
      licenseKeyEnc: this.cryptoService.encrypt(normalizedKey),
      portalLastCheckedAt: new Date().toISOString(),
      portalLastVerifiedAt: new Date().toISOString(),
      portalLastCheckError: null,
    };

    return this.licenseRepository.save(license);
  }

  private async importLegacyInstallerLicense() {
    const legacy = await this.appSettingRepository.findOne({
      where: { key: LEGACY_LICENSE_SETTINGS_KEY },
    });
    const value = legacy?.valueJson;

    if (!value?.plan || !value?.fingerprint) return null;

    const plan = normalizeLicensePlan(String(value.plan));

    if (!plan) return null;

    return this.saveActivatedLicense({
      licenseKey: `legacy-${String(value.fingerprint)}`,
      plan,
      productSlug:
        typeof value.productSlug === 'string' ? value.productSlug : null,
      activationId:
        typeof value.activationId === 'string' ? value.activationId : null,
      activationStatus:
        typeof value.activationStatus === 'string'
          ? value.activationStatus
          : null,
      expiresAt: value.expiresAt ? new Date(String(value.expiresAt)) : null,
      metadata: {
        importedFrom: LEGACY_LICENSE_SETTINGS_KEY,
        signature: value.signature,
        maxActivations: value.maxActivations,
        activeActivations: value.activeActivations,
        portalUrl: value.portalUrl,
      },
      activatedAt: value.activatedAt
        ? new Date(String(value.activatedAt))
        : new Date(),
    });
  }

  private getKeyIdentity(key: string) {
    const keyHash = createHash('sha256').update(key).digest('hex');
    const keyFingerprint = keyHash.slice(-12).toUpperCase();
    const keyLast4 = key.slice(-4).toUpperCase();

    return {
      keyHash,
      keyFingerprint,
      keyLast4,
    };
  }

  private async getUsage() {
    const [users, courses, faculty] = await Promise.all([
      this.userRepository.count({ where: { deletedAt: IsNull() } }),
      this.courseRepository.count({ where: { deletedAt: IsNull() } }),
      this.userRepository
        .createQueryBuilder('user')
        .innerJoin('user.roles', 'role', 'role.name = :roleName', {
          roleName: 'faculty',
        })
        .where('user.deletedAt IS NULL')
        .getCount(),
    ]);

    return {
      users,
      courses,
      faculty,
    };
  }

  private getLockedState(
    limits: Record<LicenseLimitKey, number | null>,
    usage: Record<LicenseLimitKey, number>,
  ) {
    return Object.entries(limits).reduce(
      (result, [key, limit]) => ({
        ...result,
        [key]: limit !== null && usage[key as LicenseLimitKey] >= limit,
      }),
      {} as Record<LicenseLimitKey, boolean>,
    );
  }

  private getPlanDefinition(license: License) {
    const base = LICENSE_PLANS[license.plan];

    return {
      ...base,
      limits: {
        ...base.limits,
        ...this.getCustomLimits(license),
      },
    };
  }

  private getCustomLimits(license: License) {
    const limits = license.metadata?.limits;
    if (!limits || typeof limits !== 'object' || Array.isArray(limits)) {
      return {};
    }

    return (['users', 'courses', 'faculty'] as const).reduce(
      (result, key) => {
        const value = (limits as Record<string, unknown>)[key];
        if (typeof value === 'number' || value === null) {
          return { ...result, [key]: value };
        }

        return result;
      },
      {} as Partial<Record<LicenseLimitKey, number | null>>,
    );
  }

  private async activateAgainstPortal(
    licenseKey: string,
    options: {
      allowLocalFallback?: boolean;
      instanceLabel?: string;
      source?: string;
    } = {},
  ) {
    const normalizedKey = licenseKey.trim();

    if (!normalizedKey) {
      throw new BadRequestException('License key is required');
    }

    const portalUrl = this.getLicensePortalUrl();
    const instanceId = await this.getOrCreateLicenseInstanceId();
    const productSlugs = this.getLicenseProductSlugs();
    let lastMessage =
      'License could not be activated. Please check the key and try again.';

    for (const productSlug of productSlugs) {
      let response: Response;

      try {
        response = await fetch(`${portalUrl}/api/v1/licenses/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            licenseKey: normalizedKey,
            productSlug,
            instanceId,
            instanceLabel:
              options.instanceLabel || 'KASA admin license upgrade',
            productVersion:
              this.configService.get<string>('appConfig.apiVersion') || '0.1.1',
            metadata: {
              source: options.source || 'admin-license-page',
              appUrl: this.configService.get<string>('appConfig.appUrl'),
              frontEndUrl: this.configService.get<string>('appConfig.fronEndUrl'),
              environment: this.configService.get<string>('appConfig.environment'),
            },
          }),
          signal: AbortSignal.timeout(15000),
        });
      } catch (error) {
        throw new ServiceUnavailableException(
          error instanceof Error
            ? `Activation service is unreachable: ${error.message}`
            : 'Activation service is unreachable',
        );
      }

      const result = (await response.json().catch(() => null)) as
        | (LicensePortalActivation & { ok: true })
        | { ok: false; code?: string; message?: string }
        | null;

      if (result?.ok) {
        return result;
      }

      lastMessage = result?.message || lastMessage;

      if (
        response.ok ||
        !result ||
        result.code !== 'LICENSE_NOT_FOUND' ||
        productSlug === productSlugs[productSlugs.length - 1]
      ) {
        break;
      }
    }

    const localPlan = getPlanFromLicenseKey(normalizedKey);
    if (
      localPlan &&
      options.allowLocalFallback !== false &&
      this.isLocalLicenseFallbackAllowed()
    ) {
      return {
        license: {
          product: this.getLicenseProductSlugs()[0],
          plan: localPlan,
          expiresAt: null,
          maxActivations: 1,
          activeActivations: 1,
        },
        activation: {
          id: `local-${randomUUID()}`,
          status: 'ACTIVE',
        },
        signature: null,
      };
    }

    throw new BadRequestException(lastMessage);
  }

  private async revalidateActiveLicense(license: License) {
    if (!this.shouldCheckPortal(license)) {
      return license;
    }

    const encryptedKey = license.metadata?.licenseKeyEnc;
    if (typeof encryptedKey !== 'string' || encryptedKey.length === 0) {
      license.status = LicenseStatus.REVOKED;
      license.activationStatus = 'REACTIVATION_REQUIRED';
      license.metadata = {
        ...(license.metadata ?? {}),
        portalLastCheckedAt: new Date().toISOString(),
        portalLastCheckError:
          'Stored license key is unavailable. Reactivate this installation with a valid key.',
      };
      await this.licenseRepository.save(license);
      return null;
    }

    let licenseKey: string;

    try {
      licenseKey = this.cryptoService.decrypt(encryptedKey);
    } catch {
      license.metadata = {
        ...(license.metadata ?? {}),
        portalLastCheckError: 'Stored license key could not be decrypted.',
        portalLastCheckedAt: new Date().toISOString(),
      };
      await this.licenseRepository.save(license);
      return license;
    }

    try {
      const activation = await this.activateAgainstPortal(licenseKey, {
        allowLocalFallback: false,
        instanceLabel: 'KASA license health check',
        source: 'license-health-check',
      });
      const plan = normalizeLicensePlan(activation.license.plan);

      license.status = LicenseStatus.ACTIVE;
      license.activationId = activation.activation?.id ?? license.activationId;
      license.activationStatus =
        activation.activation?.status ?? license.activationStatus;
      license.expiresAt = activation.license.expiresAt
        ? new Date(activation.license.expiresAt)
        : null;
      license.metadata = {
        ...(license.metadata ?? {}),
        maxActivations: activation.license.maxActivations,
        activeActivations: activation.license.activeActivations,
        limits:
          'limits' in activation.license
            ? (activation.license.limits ?? {})
            : {},
        signature: activation.signature,
        portalLastCheckedAt: new Date().toISOString(),
        portalLastVerifiedAt: new Date().toISOString(),
        portalLastCheckError: null,
      };

      if (plan) {
        license.plan = plan;
      }

      return this.licenseRepository.save(license);
    } catch (error) {
      if (error instanceof ServiceUnavailableException) {
        const graceExpired = this.hasPortalGraceExpired(license);
        license.metadata = {
          ...(license.metadata ?? {}),
          portalLastCheckedAt: new Date().toISOString(),
          portalLastCheckError:
            error.message || 'Activation service is temporarily unreachable.',
        };

        if (graceExpired) {
          license.activationStatus = 'PENDING_VERIFICATION';
          await this.licenseRepository.save(license);
          return null;
        }

        await this.licenseRepository.save(license);
        return license;
      }

      const message =
        error instanceof Error ? error.message : 'License is no longer valid.';
      license.status = message.toLowerCase().includes('expired')
        ? LicenseStatus.EXPIRED
        : LicenseStatus.REVOKED;
      license.activationStatus = 'DEACTIVATED';
      license.metadata = {
        ...(license.metadata ?? {}),
        portalLastCheckedAt: new Date().toISOString(),
        portalLastCheckError: message,
      };
      await this.licenseRepository.save(license);
      return null;
    }
  }

  private shouldCheckPortal(license: License) {
    if (!this.configService.get<string>('LICENSE_PORTAL_URL')?.trim()) {
      return false;
    }

    const lastCheckedAt = license.metadata?.portalLastCheckedAt;
    if (typeof lastCheckedAt !== 'string') {
      return true;
    }

    const lastCheckedTime = new Date(lastCheckedAt).getTime();
    if (!Number.isFinite(lastCheckedTime)) {
      return true;
    }

    return Date.now() - lastCheckedTime >= this.getPortalCheckIntervalMs();
  }

  private getPortalCheckIntervalMs() {
    const seconds = Number(
      this.configService.get<string>('LICENSE_PORTAL_CHECK_INTERVAL_SECONDS') ||
        '',
    );

    if (!Number.isFinite(seconds) || seconds <= 0) {
      return DEFAULT_PORTAL_CHECK_INTERVAL_MS;
    }

    return Math.max(seconds * 1000, 5000);
  }

  private hasPortalGraceExpired(license: License) {
    const lastVerifiedAt = license.metadata?.portalLastVerifiedAt;

    if (typeof lastVerifiedAt !== 'string') {
      return false;
    }

    const lastVerifiedTime = new Date(lastVerifiedAt).getTime();
    if (!Number.isFinite(lastVerifiedTime)) {
      return false;
    }

    return Date.now() - lastVerifiedTime > this.getPortalGraceMs();
  }

  private getPortalGraceMs() {
    const days = Number(
      this.configService.get<string>('LICENSE_PORTAL_GRACE_DAYS') || '',
    );
    const graceDays =
      Number.isFinite(days) && days > 0 ? days : DEFAULT_PORTAL_GRACE_DAYS;

    return graceDays * 24 * 60 * 60 * 1000;
  }

  private getLicensePortalUrl() {
    const url = this.configService.get<string>('LICENSE_PORTAL_URL')?.trim();

    if (!url) {
      throw new ServiceUnavailableException(
        'Activation service is not configured. Set LICENSE_PORTAL_URL before activation.',
      );
    }

    try {
      const parsedUrl = new URL(url);
      const isLocalHost =
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === '127.0.0.1' ||
        parsedUrl.hostname === '::1';

      if (isLocalHost) {
        parsedUrl.hostname = 'host.docker.internal';
      }

      return parsedUrl.toString().replace(/\/+$/, '');
    } catch {
      return url.replace(/\/+$/, '');
    }
  }

  private getLicenseProductSlugs() {
    const primary =
      this.configService.get<string>('LICENSE_PRODUCT_SLUG')?.trim() ||
      'codewithkasa';
    const configuredAliases =
      this.configService
        .get<string>('LICENSE_PRODUCT_SLUG_ALIASES')
        ?.split(',')
        .map((slug) => slug.trim())
        .filter(Boolean) || [];
    const legacyAliases =
      primary === 'codewithkasa'
        ? ['kasa-enterprise', 'kasa-plus', 'kasa-starter-kit']
        : [];

    return Array.from(
      new Set(
        [primary, ...configuredAliases, ...legacyAliases].filter(
          (slug) => slug.length > 0,
        ),
      ),
    );
  }

  private async getOrCreateLicenseInstanceId() {
    const existing = await this.appSettingRepository.findOne({
      where: { key: LICENSE_INSTANCE_KEY },
    });
    const existingInstanceId = existing?.valueJson?.instanceId;

    if (typeof existingInstanceId === 'string' && existingInstanceId.length >= 12) {
      return existingInstanceId;
    }

    const instanceId = `kasa-${randomUUID()}`;
    await this.appSettingRepository.save({
      key: LICENSE_INSTANCE_KEY,
      valueJson: {
        instanceId,
        createdAt: new Date().toISOString(),
      },
    });

    return instanceId;
  }

  private isLocalLicenseFallbackAllowed() {
    return (
      this.configService.get<string>('NODE_ENV') !== 'production' &&
      this.configService.get<string>('ALLOW_LOCAL_LICENSE_KEYS') === 'true'
    );
  }
}
