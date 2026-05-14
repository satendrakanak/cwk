import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
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
  LicenseFeatureKey,
  LicenseLimitKey,
  normalizeLicensePlan,
} from '../license-plans';

const LEGACY_LICENSE_SETTINGS_KEY = 'license_settings';

export type LicensePortalActivation = {
  license: {
    product?: string | null;
    plan: string;
    expiresAt?: string | null;
    maxActivations?: number | null;
    activeActivations?: number | null;
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
  ) {}

  async activate(dto: ActivateLicenseDto) {
    const key = dto.key.trim().toUpperCase();
    const plan = getPlanFromLicenseKey(key);

    if (!plan) {
      throw new BadRequestException(
        'Invalid license key. Use a KASA Starter, Plus, or Enterprise key.',
      );
    }

    await this.saveActivatedLicense({
      licenseKey: key,
      plan,
      purchaserEmail: dto.purchaserEmail,
      activatedAt: new Date(),
    });

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
        signature: activation.signature,
      },
      activatedAt: new Date(),
    });
  }

  async getCurrent() {
    const license = await this.getActiveLicense();
    const effectivePlan = license?.plan ?? null;
    const plan = effectivePlan ? LICENSE_PLANS[effectivePlan] : null;
    const usage = await this.getUsage();

    return {
      license,
      plan,
      usage,
      locked: plan
        ? this.getLockedState(plan.plan, usage)
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

    return license;
  }

  async getEffectivePlan() {
    const license = await this.assertActiveLicense();
    const plan = LICENSE_PLANS[license.plan];

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
    plan: LicensePlan,
    usage: Record<LicenseLimitKey, number>,
  ) {
    const definition = LICENSE_PLANS[plan];

    return Object.entries(definition.limits).reduce(
      (result, [key, limit]) => ({
        ...result,
        [key]: limit !== null && usage[key as LicenseLimitKey] >= limit,
      }),
      {} as Record<LicenseLimitKey, boolean>,
    );
  }
}
