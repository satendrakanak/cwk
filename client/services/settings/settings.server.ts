import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import {
  AwsStorageSettings,
  BbbSettings,
  EmailSettings,
  Gateway,
  PaymentGatewayAdmin,
  PushNotificationSettings,
  PublicSettingsBundle,
  SiteSettings,
  SocialAuthProvider,
} from "@/types/settings";

const PUBLIC_REVALIDATE_SECONDS = 60;

export const settingsServerService = {
  getGatewaysInfo: () =>
    apiServer.get<ApiResponse<Gateway[]>>("/settings/gateways/active"),

  getGateways: () =>
    apiServer.get<ApiResponse<PaymentGatewayAdmin[]>>("/settings/gateways"),

  getSiteSettings: () =>
    apiServer.get<ApiResponse<SiteSettings>>("/settings/site"),

  getEmailSettings: () =>
    apiServer.get<ApiResponse<EmailSettings>>("/settings/email"),

  getAwsStorageSettings: () =>
    apiServer.get<ApiResponse<AwsStorageSettings>>("/settings/aws-storage"),
  getBbbSettings: () =>
    apiServer.get<ApiResponse<BbbSettings>>("/settings/bbb"),

  getPushNotificationSettings: () =>
    apiServer.get<ApiResponse<PushNotificationSettings>>(
      "/settings/push-notifications",
    ),

  getSocialAuthSettings: () =>
    apiServer.get<ApiResponse<{ providers: SocialAuthProvider[] }>>(
      "/settings/social-auth",
    ),

  getPublicSettingsBundle: () =>
    apiServer.get<ApiResponse<PublicSettingsBundle>>("/settings/public", {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    }),
};
