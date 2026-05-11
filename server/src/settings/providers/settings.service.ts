import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentGateway } from '../payment-gateway.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoService } from 'src/common/crypto/providers/crypto.service';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { UpsertPaymentGatewayDto } from '../dtos/upsert-payment-gateway.dto';
import { AppSetting } from '../app-setting.entity';
import { UpsertSiteSettingsDto } from '../dtos/upsert-site-settings.dto';
import { UpsertEmailSettingsDto } from '../dtos/upsert-email-settings.dto';
import { UpsertSocialAuthSettingsDto } from '../dtos/upsert-social-auth-settings.dto';
import { SocialProvider } from '../enums/social-provider.enum';
import { UpsertAwsStorageSettingsDto } from '../dtos/upsert-aws-storage-settings.dto';
import { UpsertBbbSettingsDto } from '../dtos/upsert-bbb-settings.dto';
import { UpsertPushNotificationSettingsDto } from '../dtos/upsert-push-notification-settings.dto';
import webPush from 'web-push';

const SITE_SETTINGS_KEY = 'site_settings';
const EMAIL_SETTINGS_KEY = 'email_settings';
const SOCIAL_AUTH_SETTINGS_KEY = 'social_auth_settings';
const AWS_STORAGE_SETTINGS_KEY = 'aws_storage_settings';
const BBB_SETTINGS_KEY = 'bbb_settings';
const PUSH_NOTIFICATION_SETTINGS_KEY = 'push_notification_settings';

type SiteSettings = ReturnType<SettingsService['getDefaultSiteSettings']>;
type EmailSettings = ReturnType<SettingsService['getDefaultEmailSettings']>;
type AwsStorageSettings = ReturnType<
  SettingsService['getDefaultAwsStorageSettings']
>;
type BbbSettings = ReturnType<SettingsService['getDefaultBbbSettings']>;
type PushNotificationSettings = ReturnType<
  SettingsService['getDefaultPushNotificationSettings']
>;
type SocialProviderSettings = {
  provider: SocialProvider;
  label: string;
  isEnabled: boolean;
  clientId?: string | null;
  clientSecret?: string | null;
  redirectUrl?: string | null;
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(PaymentGateway)
    private readonly paymentGatewayRepository: Repository<PaymentGateway>,

    @InjectRepository(AppSetting)
    private readonly appSettingRepository: Repository<AppSetting>,

    private readonly cryptoService: CryptoService,
  ) {}

  async getAllGateways() {
    const result = await this.paymentGatewayRepository.find({
      order: { provider: 'ASC', mode: 'ASC' },
    });

    return result.map((gateway) => this.toAdminGateway(gateway));
  }

  async getAllActiveGateways() {
    const gateways = await this.paymentGatewayRepository.find({
      where: { isActive: true },
    });

    return gateways.map((gateway) => ({
      provider: gateway.provider,
      displayName: this.getDisplayName(gateway.provider),
    }));
  }

  async upsertGateway(upsertPaymentGatewayDto: UpsertPaymentGatewayDto) {
    let entity = await this.paymentGatewayRepository.findOne({
      where: {
        provider: upsertPaymentGatewayDto.provider,
        mode: upsertPaymentGatewayDto.mode,
      },
    });

    const isNewGateway = !entity;

    if (!entity) {
      entity = this.paymentGatewayRepository.create({
        provider: upsertPaymentGatewayDto.provider,
        mode: upsertPaymentGatewayDto.mode,
      });
    }

    if (
      isNewGateway &&
      (!upsertPaymentGatewayDto.keyId || !upsertPaymentGatewayDto.keySecret)
    ) {
      throw new BadRequestException(
        'Key ID and key secret are required for a new payment gateway',
      );
    }

    if (upsertPaymentGatewayDto.keyId) {
      entity.keyIdEnc = this.cryptoService.encrypt(
        upsertPaymentGatewayDto.keyId,
      );
    }

    if (upsertPaymentGatewayDto.keySecret) {
      entity.keySecretEnc = this.cryptoService.encrypt(
        upsertPaymentGatewayDto.keySecret,
      );
    }

    if (upsertPaymentGatewayDto.webhookSecret) {
      entity.webhookSecretEnc = this.cryptoService.encrypt(
        upsertPaymentGatewayDto.webhookSecret,
      );
    }

    if (upsertPaymentGatewayDto.webhookUrl !== undefined) {
      entity.webhookUrl = upsertPaymentGatewayDto.webhookUrl;
    }

    if (upsertPaymentGatewayDto.isActive) {
      await this.paymentGatewayRepository.update(
        { provider: upsertPaymentGatewayDto.provider },
        { isActive: false },
      );
      entity.isActive = true;
    } else {
      entity.isActive = false;
    }

    const savedGateway = await this.paymentGatewayRepository.save(entity);
    return this.toAdminGateway(savedGateway);
  }

  async getActiveGateway(provider: PaymentProvider) {
    const config = await this.paymentGatewayRepository.findOne({
      where: { provider, isActive: true },
    });
    if (!config) throw new NotFoundException('Payment gateway not configured');

    return {
      keyId: this.decryptGatewaySecret(config.keyIdEnc),
      keySecret: this.decryptGatewaySecret(config.keySecretEnc),
      webhookSecret: config.webhookSecretEnc
        ? this.decryptGatewaySecret(config.webhookSecretEnc)
        : null,
      webhookUrl: config.webhookUrl || null,
      mode: config.mode,
    };
  }

  async getWebhookSecret() {
    const config = await this.paymentGatewayRepository.findOne({
      where: { isActive: true },
    });

    return config?.webhookSecretEnc
      ? this.decryptGatewaySecret(config.webhookSecretEnc)
      : null;
  }

  async getPublicConfig() {
    const config = await this.paymentGatewayRepository.findOne({
      where: {
        provider: PaymentProvider.RAZORPAY,
        isActive: true,
      },
    });

    if (!config) {
      throw new Error('No active payment config');
    }

    return {
      keyId: this.decryptGatewaySecret(config.keyIdEnc),
    };
  }

  async getSiteSettings() {
    return this.getSetting<SiteSettings>(
      SITE_SETTINGS_KEY,
      this.getDefaultSiteSettings(),
    );
  }

  async upsertSiteSettings(payload: UpsertSiteSettingsDto) {
    const current = await this.getSiteSettings();
    const nextValue = {
      ...current,
      ...this.compactObject(payload),
    };

    await this.saveSetting(SITE_SETTINGS_KEY, nextValue);
    return nextValue;
  }

  async getEmailSettings() {
    const value = await this.getSetting<EmailSettings>(
      EMAIL_SETTINGS_KEY,
      this.getDefaultEmailSettings(),
      true,
    );

    return {
      ...value,
      smtpPassword: value.smtpPassword ? '********' : '',
      hasPassword: Boolean(value.smtpPassword),
    };
  }

  async getEmailSettingsForSending() {
    return this.getSetting<EmailSettings>(
      EMAIL_SETTINGS_KEY,
      this.getDefaultEmailSettings(),
      true,
    );
  }

  async upsertEmailSettings(payload: UpsertEmailSettingsDto) {
    const current = await this.getSetting<EmailSettings>(
      EMAIL_SETTINGS_KEY,
      this.getDefaultEmailSettings(),
      true,
    );

    const nextValue = {
      ...current,
      ...this.compactObject(payload),
      smtpPassword:
        payload.smtpPassword !== undefined && payload.smtpPassword !== ''
          ? payload.smtpPassword
          : current.smtpPassword,
    };

    await this.saveSetting(EMAIL_SETTINGS_KEY, nextValue, true);
    return this.getEmailSettings();
  }

  async getSocialAuthSettings() {
    const value = await this.getSetting<{
      providers: SocialProviderSettings[];
    }>(
      SOCIAL_AUTH_SETTINGS_KEY,
      { providers: this.getDefaultSocialProviders() },
      true,
    );

    return {
      providers: value.providers.map((provider) => ({
        provider: provider.provider,
        label: provider.label,
        isEnabled: provider.isEnabled,
        redirectUrl: provider.redirectUrl || '',
        clientIdPreview: provider.clientId
          ? this.maskSecret(provider.clientId)
          : null,
        hasClientSecret: Boolean(provider.clientSecret),
      })),
    };
  }

  async getActiveSocialProviders() {
    const value = await this.getSetting<{
      providers: SocialProviderSettings[];
    }>(
      SOCIAL_AUTH_SETTINGS_KEY,
      { providers: this.getDefaultSocialProviders() },
      true,
    );

    return value.providers
      .filter((provider) => provider.isEnabled)
      .map((provider) => ({
        provider: provider.provider,
        label: provider.label,
        redirectUrl: provider.redirectUrl || null,
      }));
  }

  async getSocialAuthProviderConfig(provider: SocialProvider) {
    const value = await this.getSetting<{
      providers: SocialProviderSettings[];
    }>(
      SOCIAL_AUTH_SETTINGS_KEY,
      { providers: this.getDefaultSocialProviders() },
      true,
    );

    const providerConfig = value.providers.find(
      (item) => item.provider === provider,
    );

    if (!providerConfig) {
      throw new NotFoundException('Social auth provider not configured');
    }

    return providerConfig;
  }

  async upsertSocialAuthSettings(payload: UpsertSocialAuthSettingsDto) {
    const current = await this.getSetting<{
      providers: SocialProviderSettings[];
    }>(
      SOCIAL_AUTH_SETTINGS_KEY,
      { providers: this.getDefaultSocialProviders() },
      true,
    );

    const providerMap = new Map(
      current.providers.map((provider) => [provider.provider, provider]),
    );

    for (const item of payload.providers) {
      const existing = providerMap.get(item.provider) || {
        provider: item.provider,
        label: item.provider,
        isEnabled: false,
        clientId: null,
        clientSecret: null,
        redirectUrl: null,
      };

      providerMap.set(item.provider, {
        ...existing,
        label: item.label || existing.label,
        isEnabled: item.isEnabled ?? existing.isEnabled,
        clientId:
          item.clientId !== undefined && item.clientId !== ''
            ? item.clientId
            : existing.clientId || null,
        clientSecret:
          item.clientSecret !== undefined && item.clientSecret !== ''
            ? item.clientSecret
            : existing.clientSecret || null,
        redirectUrl:
          item.redirectUrl !== undefined
            ? item.redirectUrl
            : existing.redirectUrl || null,
      });
    }

    const nextValue = {
      providers: Array.from(providerMap.values()),
    };

    await this.saveSetting(SOCIAL_AUTH_SETTINGS_KEY, nextValue, true);
    return this.getSocialAuthSettings();
  }

  async getPublicSettingsBundle() {
    const [site, socialProviders] = await Promise.all([
      this.getSiteSettings(),
      this.getActiveSocialProviders(),
    ]);

    return {
      site,
      socialProviders,
    };
  }

  async getAwsStorageSettings() {
    const value = await this.getSetting<AwsStorageSettings>(
      AWS_STORAGE_SETTINGS_KEY,
      this.getDefaultAwsStorageSettings(),
      true,
    );

    return {
      ...value,
      accessKeyId: value.accessKeyId ? this.maskSecret(value.accessKeyId) : '',
      accessKeySecret: value.accessKeySecret ? '********' : '',
      hasAccessKeySecret: Boolean(value.accessKeySecret),
    };
  }

  async getAwsStorageSettingsForRuntime() {
    return this.getSetting<AwsStorageSettings>(
      AWS_STORAGE_SETTINGS_KEY,
      this.getDefaultAwsStorageSettings(),
      true,
    );
  }

  async upsertAwsStorageSettings(payload: UpsertAwsStorageSettingsDto) {
    const current = await this.getSetting<AwsStorageSettings>(
      AWS_STORAGE_SETTINGS_KEY,
      this.getDefaultAwsStorageSettings(),
      true,
    );
    const { hasAccessKeySecret: _hasAccessKeySecret, ...storagePayload } =
      payload;

    const nextValue = {
      ...current,
      ...this.compactObject(storagePayload),
      accessKeyId:
        storagePayload.accessKeyId !== undefined &&
        storagePayload.accessKeyId !== ''
          ? storagePayload.accessKeyId
          : current.accessKeyId,
      accessKeySecret:
        storagePayload.accessKeySecret !== undefined &&
        storagePayload.accessKeySecret !== ''
          ? storagePayload.accessKeySecret
          : current.accessKeySecret,
    };

    await this.saveSetting(AWS_STORAGE_SETTINGS_KEY, nextValue, true);
    return this.getAwsStorageSettings();
  }

  async getBbbSettings() {
    const value = await this.getSetting<BbbSettings>(
      BBB_SETTINGS_KEY,
      this.getDefaultBbbSettings(),
      true,
    );

    return {
      ...value,
      sharedSecret: value.sharedSecret ? '********' : '',
      hasSharedSecret: Boolean(value.sharedSecret),
    };
  }

  async getBbbSettingsForRuntime() {
    return this.getSetting<BbbSettings>(
      BBB_SETTINGS_KEY,
      this.getDefaultBbbSettings(),
      true,
    );
  }

  async upsertBbbSettings(payload: UpsertBbbSettingsDto) {
    const current = await this.getSetting<BbbSettings>(
      BBB_SETTINGS_KEY,
      this.getDefaultBbbSettings(),
      true,
    );

    const nextValue = {
      ...current,
      ...this.compactObject(payload),
      sharedSecret:
        payload.sharedSecret !== undefined && payload.sharedSecret !== ''
          ? payload.sharedSecret
          : current.sharedSecret,
    };

    await this.saveSetting(BBB_SETTINGS_KEY, nextValue, true);
    return this.getBbbSettings();
  }

  async getPushNotificationSettings() {
    const value = await this.getSetting<PushNotificationSettings>(
      PUSH_NOTIFICATION_SETTINGS_KEY,
      this.getDefaultPushNotificationSettings(),
      true,
    );

    return {
      ...value,
      privateKey: value.privateKey ? '********' : '',
      hasPrivateKey: Boolean(value.privateKey),
    };
  }

  async getPushNotificationSettingsForRuntime() {
    return this.getSetting<PushNotificationSettings>(
      PUSH_NOTIFICATION_SETTINGS_KEY,
      this.getDefaultPushNotificationSettings(),
      true,
    );
  }

  async upsertPushNotificationSettings(
    payload: UpsertPushNotificationSettingsDto,
  ) {
    const current = await this.getSetting<PushNotificationSettings>(
      PUSH_NOTIFICATION_SETTINGS_KEY,
      this.getDefaultPushNotificationSettings(),
      true,
    );

    const nextValue = {
      ...current,
      ...this.compactObject(payload),
      subject:
        payload.subject !== undefined
          ? this.normalizePushSubject(payload.subject)
          : current.subject,
      publicKey:
        payload.publicKey !== undefined
          ? this.normalizeVapidKey(payload.publicKey, 'public key')
          : current.publicKey,
      privateKey:
        payload.privateKey !== undefined && payload.privateKey !== ''
          ? this.normalizeVapidKey(payload.privateKey, 'private key')
          : current.privateKey,
    };

    this.validatePushSettings(nextValue);

    await this.saveSetting(PUSH_NOTIFICATION_SETTINGS_KEY, nextValue, true);
    return this.getPushNotificationSettings();
  }

  async generatePushNotificationKeys() {
    const keys = webPush.generateVAPIDKeys();
    const current = await this.getSetting<PushNotificationSettings>(
      PUSH_NOTIFICATION_SETTINGS_KEY,
      this.getDefaultPushNotificationSettings(),
      true,
    );

    await this.saveSetting(
      PUSH_NOTIFICATION_SETTINGS_KEY,
      {
        ...current,
        isEnabled: true,
        subject: this.normalizePushSubject(current.subject),
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
      },
      true,
    );

    return this.getPushNotificationSettings();
  }

  private async getSetting<T>(
    key: string,
    fallback: T,
    encrypted = false,
  ): Promise<T> {
    const record = await this.appSettingRepository.findOne({ where: { key } });

    if (!record) {
      return fallback;
    }

    try {
      if (encrypted) {
        if (!record.valueEnc) return fallback;
        return JSON.parse(this.cryptoService.decrypt(record.valueEnc)) as T;
      }

      return (record.valueJson as T) || fallback;
    } catch {
      return fallback;
    }
  }

  private async saveSetting(
    key: string,
    value: Record<string, any>,
    encrypted = false,
  ) {
    let record = await this.appSettingRepository.findOne({ where: { key } });

    if (!record) {
      record = this.appSettingRepository.create({ key });
    }

    record.isEncrypted = encrypted;
    record.valueJson = encrypted ? null : value;
    record.valueEnc = encrypted
      ? this.cryptoService.encrypt(JSON.stringify(value))
      : null;

    return this.appSettingRepository.save(record);
  }

  private compactObject<T extends Record<string, any>>(value: T) {
    return Object.fromEntries(
      Object.entries(value).filter(([, entry]) => entry !== undefined),
    ) as Partial<T>;
  }

  private getDisplayName(provider: PaymentProvider): string {
    switch (provider) {
      case PaymentProvider.RAZORPAY:
        return 'Razorpay';
      case PaymentProvider.STRIPE:
        return 'Stripe';
      case PaymentProvider.PAYPAL:
        return 'PayPal';
      case PaymentProvider.PAYU:
        return 'PayU';
      case PaymentProvider.COD:
        return 'Cash on Delivery';
      default:
        return provider;
    }
  }

  private toAdminGateway(gateway: PaymentGateway) {
    return {
      id: gateway.id,
      provider: gateway.provider,
      displayName: this.getDisplayName(gateway.provider),
      mode: gateway.mode,
      isActive: gateway.isActive,
      keyIdPreview: this.maskSecret(
        gateway.keyIdEnc
          ? this.decryptGatewaySecret(gateway.keyIdEnc)
          : undefined,
      ),
      hasKeySecret: Boolean(gateway.keySecretEnc),
      hasWebhookSecret: Boolean(gateway.webhookSecretEnc),
      webhookUrl: gateway.webhookUrl || null,
      createdAt: gateway.createdAt,
      updatedAt: gateway.updatedAt,
    };
  }

  private maskSecret(value?: string | null) {
    if (!value) return null;
    if (value.length <= 6) return '******';
    return `${value.slice(0, 6)}****${value.slice(-4)}`;
  }

  private decryptGatewaySecret(payload: string) {
    try {
      return this.cryptoService.decrypt(payload);
    } catch {
      throw new BadRequestException(
        'Payment gateway credentials could not be decrypted. Please verify APP_ENCRYPTION_KEY or re-save the payment gateway credentials from admin settings.',
      );
    }
  }

  private getDefaultSiteSettings() {
    return {
      siteName: 'CodeWithKasa',
      siteTagline: 'Coding tutorials for you',
      siteDescription:
        'Practical coding education for learners who want clarity, mentorship, and real-world application.',
      logoUrl: '/assets/cwk-logo.png',
      footerLogoUrl: '/assets/cwk-logo.png',
      faviconUrl: '/favicon.png',
      adminPanelName: 'CWK',
      adminPanelIconUrl: '/assets/pwa-icon-192.png',
      supportEmail: 'info@codewithkasa.com',
      supportPhone: '+91-9809-XXXXXX',
      supportAddress: 'India',
      footerAbout:
        'Practical coding education for learners who want clarity, mentorship, and real-world application.',
      footerCopyright: `© ${new Date().getFullYear()} CodeWithKasa. All Rights Reserved`,
      footerCtaEyebrow: 'Start Your Learning Journey',
      footerCtaHeading:
        'Build practical coding expertise with a learning system that actually supports you.',
      footerCtaDescription:
        'Explore guided programs, thoughtful faculty, and a curriculum designed to help you learn clearly and apply with confidence.',
      footerPrimaryCtaLabel: 'Explore Courses',
      footerPrimaryCtaHref: '/courses',
      footerSecondaryCtaLabel: 'Talk to Us',
      footerSecondaryCtaHref: '/contact',
      facebookUrl: '',
      instagramUrl: '',
      youtubeUrl: '',
      linkedinUrl: '',
      twitterUrl: '',
    };
  }

  private getDefaultEmailSettings() {
    return {
      isEnabled: false,
      smtpHost: '',
      smtpPort: 587,
      secure: false,
      smtpUser: '',
      smtpPassword: '',
      fromName: 'CodeWithKasa',
      fromEmail: 'info@codewithkasa.com',
      replyToEmail: '',
    };
  }

  private getDefaultAwsStorageSettings() {
    return {
      isEnabled: false,
      region: '',
      bucketName: '',
      cloudfrontUrl: '',
      accessKeyId: '',
      accessKeySecret: '',
    };
  }

  private getDefaultBbbSettings() {
    return {
      isEnabled: false,
      apiUrl: process.env.BBB_API_URL || '',
      sharedSecret: process.env.BBB_SHARED_SECRET || '',
      defaultRecord: false,
      autoStartRecording: false,
      allowStartStopRecording: true,
      meetingExpireIfNoUserJoinedInMinutes: 60,
    };
  }

  private getDefaultPushNotificationSettings() {
    return {
      isEnabled: false,
      subject:
        process.env.WEB_PUSH_SUBJECT ||
        this.getValidPushSubject(process.env.APP_URL) ||
        'mailto:info@codewithkasa.com',
      publicKey: process.env.WEB_PUSH_PUBLIC_KEY || '',
      privateKey: process.env.WEB_PUSH_PRIVATE_KEY || '',
    };
  }

  private normalizePushSubject(subject?: string | null) {
    const value = subject?.trim();

    if (!value) return 'mailto:info@codewithkasa.com';

    if (value.startsWith('mailto:') || value.startsWith('https://')) {
      return value;
    }

    if (value.startsWith('http://localhost')) {
      return 'mailto:info@codewithkasa.com';
    }

    throw new BadRequestException(
      'VAPID subject must start with https:// or mailto:',
    );
  }

  private getValidPushSubject(value?: string | null) {
    if (!value) return null;
    return value.startsWith('https://') || value.startsWith('mailto:')
      ? value
      : null;
  }

  private normalizeVapidKey(value: string, label: string) {
    const normalized = value.trim().replace(/=+$/g, '');

    if (!/^[A-Za-z0-9_-]+$/.test(normalized)) {
      throw new BadRequestException(
        `VAPID ${label} must be URL-safe base64. Use Generate VAPID keys.`,
      );
    }

    return normalized;
  }

  private validatePushSettings(settings: PushNotificationSettings) {
    if (!settings.isEnabled) return;

    this.normalizePushSubject(settings.subject);

    if (!settings.publicKey || !settings.privateKey) {
      throw new BadRequestException(
        'Generate VAPID keys before enabling push notifications',
      );
    }

    this.normalizeVapidKey(settings.publicKey, 'public key');
    this.normalizeVapidKey(settings.privateKey, 'private key');
  }

  private getDefaultSocialProviders(): SocialProviderSettings[] {
    return [
      {
        provider: SocialProvider.GOOGLE,
        label: 'Continue with Google',
        isEnabled: false,
        clientId: null,
        clientSecret: null,
        redirectUrl: null,
      },
      {
        provider: SocialProvider.APPLE,
        label: 'Continue with Apple',
        isEnabled: false,
        clientId: null,
        clientSecret: null,
        redirectUrl: null,
      },
      {
        provider: SocialProvider.META,
        label: 'Continue with Meta',
        isEnabled: false,
        clientId: null,
        clientSecret: null,
        redirectUrl: null,
      },
    ];
  }
}
