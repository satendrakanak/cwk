import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { runtimeDatabaseConfigPath } from 'src/config/runtime-database.config';
import { seedEmailTemplates } from 'src/database/seeds/email-template.seed';
import { seedLocation } from 'src/database/seeds/location.seed';
import { seedPermissions } from 'src/database/seeds/permission.seed';
import { seedProductionDemoContent } from 'src/database/seeds/production-demo-content.seed';
import { seedRoles } from 'src/database/seeds/role.seed';
import { Role } from 'src/roles-permissions/role.entity';
import { AppSetting } from 'src/settings/app-setting.entity';
import { SettingsService } from 'src/settings/providers/settings.service';
import { User } from 'src/users/user.entity';
import { ensureStudentRole } from 'src/users/utils/ensure-student-role';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CompleteInstallationDto } from './dtos/complete-installation.dto';
import { DatabaseSetupDto } from './dtos/database-setup.dto';
import { ValidateLicenseDto } from './dtos/validate-license.dto';
import { LicensesService } from 'src/licenses/providers/licenses.service';

const INSTALLATION_STATUS_KEY = 'installation_status';
const LICENSE_SETTINGS_KEY = 'license_settings';
const LICENSE_INSTANCE_KEY = 'license_instance_settings';
const LOCATION_BACKGROUND_STATUS_KEY = 'location_background_import_status';

type InstallationJobStatus = 'queued' | 'running' | 'completed' | 'failed';

type InstallationJob = {
  id: string;
  status: InstallationJobStatus;
  progress: number;
  label: string;
  error: string | null;
  redirectTo: string | null;
  createdAt: string;
  updatedAt: string;
};

type LicensePortalActivationResponse =
  | {
      ok: true;
      license: {
        id: string;
        product: string;
        plan: string;
        expiresAt: string | null;
        maxActivations: number;
        activeActivations: number;
      };
      activation: {
        id: string;
        status: string;
      };
      signature: string;
      marketplace?: {
        name?: string;
        reused?: boolean;
        itemId?: string;
        purchaseId?: string;
      };
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

type InstallerActivationPayload = {
  activationMode?: 'kasa' | 'envato';
  licenseKey?: string;
  envatoPurchaseCode?: string;
  envatoBuyerName?: string;
  envatoBuyerEmail?: string;
  siteName?: string;
};

@Injectable()
export class InstallerService implements OnModuleInit {
  private readonly installationJobs = new Map<string, InstallationJob>();

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,

    @InjectRepository(AppSetting)
    private readonly appSettingRepository: Repository<AppSetting>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly licensesService: LicensesService,
  ) {}

  async onModuleInit() {
    const installation = await this.getInstallationRecord().catch(() => null);
    const backgroundStatus = await this.appSettingRepository
      .findOne({ where: { key: LOCATION_BACKGROUND_STATUS_KEY } })
      .catch(() => null);

    if (
      installation?.valueJson?.isInstalled &&
      backgroundStatus?.valueJson?.status !== 'completed'
    ) {
      this.startBackgroundLocationImport(5000);
    }
  }

  async getStatus() {
    const installation = await this.getInstallationRecord();
    const adminCount = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.roles', 'role', 'role.name = :role', { role: 'admin' })
      .getCount()
      .catch(() => 0);

    const explicitInstalled = Boolean(installation?.valueJson?.isInstalled);
    const isInstalled = explicitInstalled || adminCount > 0;

    return {
      isInstalled,
      installedAt: installation?.valueJson?.installedAt || null,
      hasAdmin: adminCount > 0,
      licenseRequired: true,
      database: {
        mode: this.configService.get<string>('database.source') || 'bundled',
        host: this.configService.get<string>('database.host'),
        port: this.configService.get<number>('database.port'),
        name: this.configService.get<string>('database.name'),
        user: this.configService.get<string>('database.user'),
        ssl: Boolean(this.configService.get<boolean>('database.ssl')),
        runtimeConfigPath: runtimeDatabaseConfigPath,
        connected: this.dataSource.isInitialized,
      },
    };
  }

  async testDatabaseConnection(payload: DatabaseSetupDto) {
    const connectionPayload = this.normalizeDatabasePayload(payload);
    const probe = new DataSource({
      type: 'postgres',
      host: connectionPayload.host,
      port: Number(connectionPayload.port || 5432),
      username: connectionPayload.user,
      password:
        connectionPayload.password ||
        this.getActiveDatabasePassword(connectionPayload),
      database: connectionPayload.name,
      ssl: connectionPayload.ssl
        ? { rejectUnauthorized: connectionPayload.rejectUnauthorized !== false }
        : false,
    });

    try {
      await probe.initialize();
      await probe.query('select 1');
      await this.assertExternalPasswordIsEnforced(connectionPayload);
      return {
        connected: true,
        host: connectionPayload.host,
        message:
          connectionPayload.host !== payload.host
            ? `Database connection verified through ${connectionPayload.host}`
            : 'Database connection verified',
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? `Database connection failed: ${error.message}`
          : 'Database connection failed',
      );
    } finally {
      if (probe.isInitialized) {
        await probe.destroy();
      }
    }
  }

  async saveDatabaseConfiguration(payload: DatabaseSetupDto) {
    if (payload.mode === 'bundled') {
      this.ensureRuntimeConfigDirectory();
      fs.writeFileSync(
        runtimeDatabaseConfigPath,
        `${JSON.stringify({ mode: 'bundled' }, null, 2)}\n`,
      );
      const restartRequired =
        this.configService.get<string>('database.source') !== 'bundled';
      if (restartRequired) {
        this.scheduleDockerRestart();
      }
      return {
        saved: true,
        restartRequired,
        autoRestart: restartRequired && this.isRunningInsideDocker(),
        message: restartRequired
          ? 'Bundled database selected. Kasa is restarting the API and will reconnect shortly.'
          : 'Bundled database selected and ready.',
      };
    }

    const connectionPayload = this.normalizeDatabasePayload(payload);

    if (!connectionPayload.password) {
      throw new BadRequestException('Database password is required');
    }

    await this.testDatabaseConnection(connectionPayload);
    this.ensureRuntimeConfigDirectory();
    fs.writeFileSync(
      runtimeDatabaseConfigPath,
      `${JSON.stringify(
        {
          mode: 'external',
          host: connectionPayload.host,
          port: Number(connectionPayload.port || 5432),
          name: connectionPayload.name,
          user: connectionPayload.user,
          password: connectionPayload.password,
          ssl: Boolean(connectionPayload.ssl),
          rejectUnauthorized: connectionPayload.rejectUnauthorized !== false,
        },
        null,
        2,
      )}\n`,
    );
    this.scheduleDockerRestart();

    return {
      saved: true,
      restartRequired: true,
      autoRestart: this.isRunningInsideDocker(),
      host: connectionPayload.host,
      message:
        'External database verified and saved. Kasa is restarting the API and will reconnect shortly.',
    };
  }

  async validateLicense(payload: ValidateLicenseDto) {
    const activation = await this.activateLicenseFromPayload(payload, {
      instanceLabel: 'CodeWithKasa installer',
    });

    return {
      valid: true,
      fingerprint: this.getLicenseFingerprint(activation.signature),
      plan: activation.license.plan,
      expiresAt: activation.license.expiresAt,
      activeActivations: activation.license.activeActivations,
      maxActivations: activation.license.maxActivations,
      source: payload.activationMode === 'envato' ? 'envato' : 'kasa',
      marketplace: activation.marketplace ?? null,
    };
  }

  async completeInstallation(payload: CompleteInstallationDto) {
    const status = await this.getStatus();

    if (status.isInstalled) {
      throw new ConflictException('Installation is already completed');
    }

    await this.activateLicenseFromPayload(payload, {
      instanceLabel: `${payload.siteName} installation`,
    });

    await this.runInstallationSteps(payload);

    return {
      isInstalled: true,
      redirectTo: '/auth/sign-in',
    };
  }

  async startInstallation(payload: CompleteInstallationDto) {
    const status = await this.getStatus();

    if (status.isInstalled) {
      throw new ConflictException('Installation is already completed');
    }

    await this.activateLicenseFromPayload(payload, {
      instanceLabel: `${payload.siteName} installation`,
    });

    const jobId = randomUUID();
    this.updateJob(jobId, {
      status: 'queued',
      progress: 1,
      label: 'Installation queued...',
      error: null,
      redirectTo: null,
      createdAt: new Date().toISOString(),
    });

    void this.runInstallationJob(jobId, payload);

    return {
      jobId,
    };
  }

  getInstallationProgress(jobId: string) {
    const job = this.installationJobs.get(jobId);

    if (!job) {
      throw new NotFoundException('Installation job not found');
    }

    return job;
  }

  private async runInstallationJob(jobId: string, payload: CompleteInstallationDto) {
    try {
      await this.runInstallationSteps(payload, (progress, label) =>
        this.updateJob(jobId, {
          status: 'running',
          progress,
          label,
        }),
      );
      this.updateJob(jobId, {
        status: 'completed',
        progress: 100,
        label: 'Installation completed. Redirecting...',
        redirectTo: '/auth/sign-in',
      });
    } catch (error) {
      this.updateJob(jobId, {
        status: 'failed',
        progress: 100,
        label: 'Installation failed',
        error:
          error instanceof Error
            ? error.message
            : 'Installation could not be completed',
      });
    }
  }

  private async runInstallationSteps(
    payload: CompleteInstallationDto,
    onProgress?: (progress: number, label: string) => void,
  ) {
    onProgress?.(5, 'Preparing permissions...');
    this.assertDatabaseSelection(payload);
    await seedPermissions(this.dataSource);
    onProgress?.(14, 'Preparing roles...');
    await seedRoles(this.dataSource);
    onProgress?.(24, 'Preparing email templates...');
    await seedEmailTemplates(this.dataSource);
    onProgress?.(34, 'Preparing countries, states, and India cities...');
    await seedLocation(this.dataSource, {
      cityCountryCodes: ['IN'],
      cityChunkSize: 1000,
      onProgress: (locationProgress) => {
        const mappedProgress =
          34 + Math.floor((locationProgress.progress / 100) * 13);
        onProgress?.(
          Math.min(47, mappedProgress),
          locationProgress.label,
        );
      },
    });
    onProgress?.(48, 'Creating the first admin account...');
    await this.createAdminUser(payload);
    onProgress?.(60, 'Saving academy settings...');
    await this.settingsService.upsertSiteSettings({
      siteName: payload.siteName,
      siteTagline:
        payload.siteTagline ||
        'Practical courses, live classes, and certificates in one platform.',
      siteDescription:
        'Practical courses, live classes, learner dashboards, faculty tools, certificates, and engagement workflows.',
      supportEmail: payload.supportEmail || payload.adminEmail,
      supportPhone: payload.supportPhone,
      footerCopyright: `© ${new Date().getFullYear()} ${payload.siteName}. All Rights Reserved`,
    });

    if (payload.importDemoData) {
      onProgress?.(70, 'Importing marketplace demo data...');
      await seedProductionDemoContent(this.dataSource);
    } else {
      onProgress?.(82, 'Skipping demo data import...');
    }

    onProgress?.(88, 'Activating license...');
    const activation = await this.activateLicenseFromPayload(payload, {
      instanceLabel: `${payload.siteName} production installation`,
    });
    const localLicenseKey = this.getLocalLicenseIdentity(payload, activation);
    await this.saveSetting(LICENSE_SETTINGS_KEY, {
      activatedAt: new Date().toISOString(),
      activationMode: payload.activationMode === 'envato' ? 'envato' : 'kasa',
      fingerprint: this.getLicenseFingerprint(activation.signature),
      productSlug: activation.license.product,
      plan: activation.license.plan,
      expiresAt: activation.license.expiresAt,
      maxActivations: activation.license.maxActivations,
      activeActivations: activation.license.activeActivations,
      activationId: activation.activation.id,
      activationStatus: activation.activation.status,
      signature: activation.signature,
      marketplace: activation.marketplace ?? null,
      portalUrl: this.getLicensePortalUrl(),
    });
    await this.licensesService.savePortalActivation(
      localLicenseKey,
      activation,
    );
    onProgress?.(95, 'Finalizing installation...');
    await this.saveSetting(INSTALLATION_STATUS_KEY, {
      isInstalled: true,
      installedAt: new Date().toISOString(),
      version: this.configService.get<string>('appConfig.apiVersion') || '0.1.1',
      demoDataImported: Boolean(payload.importDemoData),
    });
    this.startBackgroundLocationImport();
  }

  private startBackgroundLocationImport(delayMs = 1000) {
    setTimeout(() => {
      void this.runBackgroundLocationImport();
    }, delayMs);
  }

  private async runBackgroundLocationImport() {
    let lastSavedProgress = -1;

    try {
      await this.saveSetting(LOCATION_BACKGROUND_STATUS_KEY, {
        status: 'running',
        progress: 0,
        label: 'Preparing complete city directory...',
        startedAt: new Date().toISOString(),
      });

      await seedLocation(this.dataSource, {
        skipCountryStateSeed: true,
        cityChunkSize: 2000,
        onProgress: (progress) => {
          const shouldPersist =
            progress.progress === 100 ||
            progress.progress >= lastSavedProgress + 5;

          if (!shouldPersist) {
            return;
          }

          lastSavedProgress = progress.progress;
          void this.saveSetting(LOCATION_BACKGROUND_STATUS_KEY, {
            status: progress.progress === 100 ? 'completed' : 'running',
            progress: progress.progress,
            label: progress.label,
            updatedAt: new Date().toISOString(),
          }).catch(() => undefined);
        },
      });

      await this.saveSetting(LOCATION_BACKGROUND_STATUS_KEY, {
        status: 'completed',
        progress: 100,
        label: 'Complete city directory is ready',
        completedAt: new Date().toISOString(),
      });
    } catch (error) {
      await this.saveSetting(LOCATION_BACKGROUND_STATUS_KEY, {
        status: 'failed',
        progress: lastSavedProgress > -1 ? lastSavedProgress : 0,
        label: 'Complete city directory import failed',
        error:
          error instanceof Error
            ? error.message
            : 'Background city import failed',
        failedAt: new Date().toISOString(),
      }).catch(() => undefined);
    }
  }

  private assertDatabaseSelection(payload: CompleteInstallationDto) {
    if (!payload.database) return;

    const activeDatabase = {
      host: String(this.configService.get<string>('database.host') || ''),
      port: Number(this.configService.get<number>('database.port') || 5432),
      name: String(this.configService.get<string>('database.name') || ''),
      user: String(this.configService.get<string>('database.user') || ''),
    };

    const requestedPayload = this.normalizeDatabasePayload({
      mode: payload.database.mode || 'bundled',
      host: String(payload.database.host || ''),
      port: Number(payload.database.port || 5432),
      name: String(payload.database.name || ''),
      user: String(payload.database.user || ''),
      password: payload.database.password,
      ssl: payload.database.ssl,
      rejectUnauthorized: payload.database.rejectUnauthorized,
    });

    const requestedDatabase = {
      host: requestedPayload.host,
      port: Number(requestedPayload.port || 5432),
      name: requestedPayload.name,
      user: requestedPayload.user,
    };

    const matchesActiveConnection =
      activeDatabase.host === requestedDatabase.host &&
      activeDatabase.port === requestedDatabase.port &&
      activeDatabase.name === requestedDatabase.name &&
      activeDatabase.user === requestedDatabase.user;

    if (!matchesActiveConnection) {
      throw new BadRequestException(
        'Database details do not match the running application connection. Update the Docker/env database values, restart the stack, and run the installer again.',
      );
    }
  }

  private getActiveDatabasePassword(payload: DatabaseSetupDto) {
    const activeDatabase = {
      host: String(this.configService.get<string>('database.host') || ''),
      port: Number(this.configService.get<number>('database.port') || 5432),
      name: String(this.configService.get<string>('database.name') || ''),
      user: String(this.configService.get<string>('database.user') || ''),
    };

    if (
      payload.mode === 'bundled' &&
      payload.host === activeDatabase.host &&
      Number(payload.port) === activeDatabase.port &&
      payload.name === activeDatabase.name &&
      payload.user === activeDatabase.user
    ) {
      return String(this.configService.get<string>('database.password') || '');
    }

    return '';
  }

  private normalizeDatabasePayload(payload: DatabaseSetupDto): DatabaseSetupDto {
    if (payload.mode !== 'external') {
      return payload;
    }

    const host = payload.host?.trim();
    const isLocalHost =
      host === 'localhost' || host === '127.0.0.1' || host === '::1';

    if (!isLocalHost || !this.isRunningInsideDocker()) {
      return {
        ...payload,
        host,
      };
    }

    return {
      ...payload,
      host: 'host.docker.internal',
    };
  }

  private isRunningInsideDocker() {
    return fs.existsSync('/.dockerenv') || process.env.KASA_DOCKER === 'true';
  }

  private async assertExternalPasswordIsEnforced(payload: DatabaseSetupDto) {
    if (payload.mode !== 'external' || !payload.password) return;

    const probe = new DataSource({
      type: 'postgres',
      host: payload.host,
      port: Number(payload.port || 5432),
      username: payload.user,
      password: `kasa-invalid-${randomUUID()}`,
      database: payload.name,
      ssl: payload.ssl
        ? { rejectUnauthorized: payload.rejectUnauthorized !== false }
        : false,
    });

    try {
      await probe.initialize();
      await probe.query('select 1');
      throw new BadRequestException(
        'PostgreSQL accepted an incorrect password. Please disable trust authentication for this database/user, then test again.',
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
    } finally {
      if (probe.isInitialized) {
        await probe.destroy();
      }
    }
  }

  private scheduleDockerRestart() {
    if (!this.isRunningInsideDocker()) return;

    setTimeout(() => {
      process.exit(0);
    }, 750);
  }

  private ensureRuntimeConfigDirectory() {
    fs.mkdirSync(path.dirname(runtimeDatabaseConfigPath), { recursive: true });
  }

  private async createAdminUser(payload: CompleteInstallationDto) {
    const ownerRole = await this.roleRepository.findOne({
      where: { name: 'super_admin' },
      relations: { permissions: true },
    });

    const studentRole = await this.roleRepository.findOne({
      where: { name: 'student' },
    });

    if (!ownerRole || !studentRole) {
      throw new ServiceUnavailableException('Admin role could not be prepared');
    }
    const adminRoles = ensureStudentRole([ownerRole], studentRole);

    const existingUser = await this.userRepository.findOne({
      where: { email: payload.adminEmail.toLowerCase() },
      relations: { roles: true },
    });
    const password = await bcrypt.hash(payload.adminPassword, 10);
    const usernameBase = payload.adminEmail
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    if (existingUser) {
      existingUser.firstName = payload.adminFirstName;
      existingUser.lastName = payload.adminLastName;
      existingUser.username = existingUser.username || usernameBase;
      existingUser.password = password;
      existingUser.emailVerified = existingUser.emailVerified || new Date();
      existingUser.roles = adminRoles;
      await this.userRepository.save(existingUser);
      return;
    }

    await this.userRepository.save(
      this.userRepository.create({
        firstName: payload.adminFirstName,
        lastName: payload.adminLastName,
        username: await this.getAvailableUsername(usernameBase),
        email: payload.adminEmail.toLowerCase(),
        password,
        emailVerified: new Date(),
        roles: adminRoles,
      }),
    );
  }

  private async activateLicense(
    licenseKey: string,
    options?: { instanceLabel?: string },
  ) {
    const normalizedKey = licenseKey.trim();
    if (!normalizedKey) {
      throw new BadRequestException('License key is required');
    }

    const portalUrl = this.getLicensePortalUrl();
    const instanceId = await this.getOrCreateLicenseInstanceId();
    const productSlugs = this.getLicenseProductSlugs();

    let response: Response;
    let result: LicensePortalActivationResponse | null = null;
    let lastMessage =
      'License could not be activated. Please check the key and try again.';

    for (const productSlug of productSlugs) {
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
            instanceLabel: options?.instanceLabel || 'CodeWithKasa installation',
            productVersion:
              this.configService.get<string>('appConfig.apiVersion') || '0.1.1',
            metadata: {
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
            ? `License portal is unreachable: ${error.message}`
            : 'License portal is unreachable',
        );
      }

      result = (await response.json().catch(() => null)) as
        | LicensePortalActivationResponse
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

    throw new BadRequestException(lastMessage);
  }

  private async activateLicenseFromPayload(
    payload: InstallerActivationPayload,
    options?: { instanceLabel?: string },
  ) {
    if (payload.activationMode === 'envato') {
      return this.activateEnvatoPurchase(payload, options);
    }

    if (!payload.licenseKey?.trim()) {
      throw new BadRequestException('License key is required');
    }

    return this.activateLicense(payload.licenseKey, options);
  }

  private async activateEnvatoPurchase(
    payload: InstallerActivationPayload,
    options?: { instanceLabel?: string },
  ) {
    const purchaseCode = payload.envatoPurchaseCode?.trim();
    const buyerEmail = payload.envatoBuyerEmail?.trim().toLowerCase();

    if (!purchaseCode) {
      throw new BadRequestException('Envato purchase code is required');
    }

    if (!buyerEmail) {
      throw new BadRequestException('Buyer email is required for Envato activation');
    }

    const portalUrl = this.getLicensePortalUrl();
    const instanceId = await this.getOrCreateLicenseInstanceId();

    let response: Response;
    try {
      response = await fetch(`${portalUrl}/api/v1/envato/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purchaseCode,
          buyerName: payload.envatoBuyerName || payload.siteName,
          buyerEmail,
          instanceId,
          instanceLabel: options?.instanceLabel || 'CodeWithKasa installation',
          productVersion:
            this.configService.get<string>('appConfig.apiVersion') || '0.1.1',
          metadata: {
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
          ? `License portal is unreachable: ${error.message}`
          : 'License portal is unreachable',
      );
    }

    const result = (await response.json().catch(() => null)) as
      | LicensePortalActivationResponse
      | null;

    if (result?.ok) {
      return result;
    }

    throw new BadRequestException(
      result?.message ||
        'Envato purchase code could not be activated. Please check the code and try again.',
    );
  }

  private getLocalLicenseIdentity(
    payload: InstallerActivationPayload,
    activation: Extract<LicensePortalActivationResponse, { ok: true }>,
  ) {
    if (payload.activationMode === 'envato') {
      const source =
        payload.envatoPurchaseCode?.trim() ||
        activation.marketplace?.purchaseId ||
        activation.signature;
      return `envato-${createHash('sha256').update(source).digest('hex')}`;
    }

    if (!payload.licenseKey?.trim()) {
      throw new BadRequestException('License key is required');
    }

    return payload.licenseKey;
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
      primary === 'codewithkasa' ? ['kasa-enterprise'] : [];

    return Array.from(
      new Set(
        [primary, ...configuredAliases, ...legacyAliases].filter(
          (slug) => slug.length > 0,
        ),
      ),
    );
  }

  private getLicensePortalUrl() {
    const url = this.configService.get<string>('LICENSE_PORTAL_URL')?.trim();

    if (!url) {
      throw new ServiceUnavailableException(
        'License portal is not configured. Set LICENSE_PORTAL_URL before installation.',
      );
    }

    try {
      const parsedUrl = new URL(url);
      const isLocalHost =
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === '127.0.0.1' ||
        parsedUrl.hostname === '::1';

      if (isLocalHost && this.isRunningInsideDocker()) {
        parsedUrl.hostname = 'host.docker.internal';
      }

      return parsedUrl.toString().replace(/\/+$/, '');
    } catch {
      return url.replace(/\/+$/, '');
    }
  }

  private getLicenseFingerprint(signature: string) {
    return signature.slice(-12).toUpperCase();
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
    await this.saveSetting(LICENSE_INSTANCE_KEY, {
      instanceId,
      createdAt: new Date().toISOString(),
    });

    return instanceId;
  }

  private getInstallationRecord() {
    return this.appSettingRepository.findOne({
      where: { key: INSTALLATION_STATUS_KEY },
    });
  }

  private async getAvailableUsername(baseUsername: string) {
    const normalizedBase = baseUsername || 'admin';
    let candidate = normalizedBase;
    let suffix = 1;

    while (await this.userRepository.exists({ where: { username: candidate } })) {
      suffix += 1;
      candidate = `${normalizedBase}-${suffix}`;
    }

    return candidate;
  }

  private async saveSetting(key: string, valueJson: Record<string, unknown>) {
    const existing = await this.appSettingRepository.findOne({ where: { key } });
    const setting =
      existing ||
      this.appSettingRepository.create({
        key,
      });

    setting.valueJson = valueJson;
    setting.valueEnc = null;
    setting.isEncrypted = false;

    await this.appSettingRepository.save(setting);
  }

  private updateJob(
    jobId: string,
    patch: Partial<Omit<InstallationJob, 'id' | 'updatedAt'>>,
  ) {
    const existing = this.installationJobs.get(jobId);
    const now = new Date().toISOString();
    const next: InstallationJob = {
      id: jobId,
      status: existing?.status || 'queued',
      progress: existing?.progress || 0,
      label: existing?.label || 'Preparing installation...',
      error: existing?.error || null,
      redirectTo: existing?.redirectTo || null,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      ...patch,
    };

    this.installationJobs.set(jobId, next);
  }
}
