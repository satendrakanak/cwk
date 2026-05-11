import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  AwsStorageSettings,
  BbbSettings,
  EmailSettings,
  PaymentGatewayAdmin,
  PushNotificationSettings,
  PublicSettingsBundle,
  PublicSocialProvider,
  SiteSettings,
  SocialAuthProvider,
  SocialProvider,
  UpsertPaymentGatewayPayload,
} from "@/types/settings";

export const settingsClientService = {
  getPaymentConfig: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<{ keyId: string }>>(
        "/api/settings/payment-config",
      ),
    ),

  getGateways: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<PaymentGatewayAdmin[]>>(
        "/api/settings/gateways",
      ),
    ),

  upsertGateway: (data: UpsertPaymentGatewayPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<PaymentGatewayAdmin>>(
        "/api/settings/gateway",
        data,
      ),
    ),

  getSiteSettings: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<SiteSettings>>("/api/settings/site"),
    ),

  upsertSiteSettings: (data: Partial<SiteSettings>) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<SiteSettings>>("/api/settings/site", data),
    ),

  getEmailSettings: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<EmailSettings>>("/api/settings/email"),
    ),

  upsertEmailSettings: (data: Partial<EmailSettings>) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<EmailSettings>>("/api/settings/email", data),
    ),

  getAwsStorageSettings: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<AwsStorageSettings>>(
        "/api/settings/aws-storage",
      ),
    ),

  upsertAwsStorageSettings: (data: Partial<AwsStorageSettings>) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<AwsStorageSettings>>(
        "/api/settings/aws-storage",
        data,
      ),
    ),

  getBbbSettings: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<BbbSettings>>("/api/settings/bbb"),
    ),

  upsertBbbSettings: (data: Partial<BbbSettings>) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<BbbSettings>>("/api/settings/bbb", data),
    ),

  getPushNotificationSettings: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<PushNotificationSettings>>(
        "/api/settings/push-notifications",
      ),
    ),

  upsertPushNotificationSettings: (data: Partial<PushNotificationSettings>) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<PushNotificationSettings>>(
        "/api/settings/push-notifications",
        data,
      ),
    ),

  generatePushNotificationKeys: () =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<PushNotificationSettings>>(
        "/api/settings/push-notifications/generate-keys",
      ),
    ),

  getSocialAuthSettings: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<{ providers: SocialAuthProvider[] }>>(
        "/api/settings/social-auth",
      ),
    ),

  upsertSocialAuthSettings: (
    providers: Array<{
      provider: SocialProvider;
      label: string;
      isEnabled: boolean;
      redirectUrl: string;
      clientId?: string;
      clientSecret?: string;
    }>,
  ) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<{ providers: SocialAuthProvider[] }>>(
        "/api/settings/social-auth",
        { providers },
      ),
    ),

  getPublicSettingsBundle: () =>
    apiClient.get<ApiResponse<PublicSettingsBundle>>("/api/settings/public"),

  getActiveSocialProviders: () =>
    apiClient.get<ApiResponse<PublicSocialProvider[]>>(
      "/api/settings/social-auth/active",
    ),
};
