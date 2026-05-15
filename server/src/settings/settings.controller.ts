import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { SettingsService } from './providers/settings.service';
import { UpsertPaymentGatewayDto } from './dtos/upsert-payment-gateway.dto';
import { PaymentProvider } from './enums/payment-provider.enum';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-type.enum';
import { UpsertSiteSettingsDto } from './dtos/upsert-site-settings.dto';
import { UpsertEmailSettingsDto } from './dtos/upsert-email-settings.dto';
import { UpsertSocialAuthSettingsDto } from './dtos/upsert-social-auth-settings.dto';
import { UpsertAwsStorageSettingsDto } from './dtos/upsert-aws-storage-settings.dto';
import { UpsertBbbSettingsDto } from './dtos/upsert-bbb-settings.dto';
import { UpsertPushNotificationSettingsDto } from './dtos/upsert-push-notification-settings.dto';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import type { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';

const DEMO_CONFIGURATION_LOCK_MESSAGE =
  'Demo users cannot change these settings. Purchase KASA to unlock configuration changes.';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('gateway')
  async createOrUpdate(
    @Body() upsertPaymentGatewayDto: UpsertPaymentGatewayDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertNotDemoUser(user);
    return this.settingsService.upsertGateway(upsertPaymentGatewayDto);
  }

  @Get('gateway')
  async getActiveGateway(@Query('provider') provider: PaymentProvider) {
    return this.settingsService.getActiveGateway(provider);
  }

  @Get('gateways')
  async getAllGateways() {
    return this.settingsService.getAllGateways();
  }

  @Auth(AuthType.None)
  @Get('gateways/active')
  async getAllActiveGateways() {
    return this.settingsService.getAllActiveGateways();
  }

  @Auth(AuthType.None)
  @Get('payment-config')
  getPaymentConfig() {
    return this.settingsService.getPublicConfig();
  }

  @Get('site')
  getSiteSettings() {
    return this.settingsService.getSiteSettings();
  }

  @Post('site')
  upsertSiteSettings(
    @Body() payload: UpsertSiteSettingsDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertNotDemoUser(user);
    return this.settingsService.upsertSiteSettings(payload);
  }

  @Get('email')
  getEmailSettings() {
    return this.settingsService.getEmailSettings();
  }

  @Post('email')
  upsertEmailSettings(
    @Body() payload: UpsertEmailSettingsDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertNotDemoUser(user);
    return this.settingsService.upsertEmailSettings(payload);
  }

  @Get('social-auth')
  getSocialAuthSettings() {
    return this.settingsService.getSocialAuthSettings();
  }

  @Post('social-auth')
  upsertSocialAuthSettings(
    @Body() payload: UpsertSocialAuthSettingsDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertNotDemoUser(user);
    return this.settingsService.upsertSocialAuthSettings(payload);
  }

  @Auth(AuthType.None)
  @Get('social-auth/active')
  getActiveSocialAuthSettings() {
    return this.settingsService.getActiveSocialProviders();
  }

  @Auth(AuthType.None)
  @Get('public')
  getPublicSettingsBundle() {
    return this.settingsService.getPublicSettingsBundle();
  }

  @Get('aws-storage')
  getAwsStorageSettings() {
    return this.settingsService.getAwsStorageSettings();
  }

  @Post('aws-storage')
  upsertAwsStorageSettings(
    @Body() payload: UpsertAwsStorageSettingsDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertNotDemoUser(user);
    return this.settingsService.upsertAwsStorageSettings(payload);
  }

  @Get('bbb')
  getBbbSettings() {
    return this.settingsService.getBbbSettings();
  }

  @Post('bbb')
  upsertBbbSettings(
    @Body() payload: UpsertBbbSettingsDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertNotDemoUser(user);
    return this.settingsService.upsertBbbSettings(payload);
  }

  @Get('push-notifications')
  getPushNotificationSettings() {
    return this.settingsService.getPushNotificationSettings();
  }

  @Post('push-notifications')
  upsertPushNotificationSettings(
    @Body() payload: UpsertPushNotificationSettingsDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    this.assertNotDemoUser(user);
    return this.settingsService.upsertPushNotificationSettings(payload);
  }

  @Post('push-notifications/generate-keys')
  generatePushNotificationKeys(@ActiveUser() user: ActiveUserData) {
    this.assertNotDemoUser(user);
    return this.settingsService.generatePushNotificationKeys();
  }

  private assertNotDemoUser(user: ActiveUserData) {
    if (user?.roles?.includes('demo_admin')) {
      throw new ForbiddenException(DEMO_CONFIGURATION_LOCK_MESSAGE);
    }
  }
}
