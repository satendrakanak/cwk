import { SiteSettingsDashboard } from "@/components/admin/settings/site-settings-dashboard";
import { settingsServerService } from "@/services/settings/settings.server";
import {
  AwsStorageSettings,
  BbbSettings,
  EmailSettings,
  PaymentGatewayAdmin,
  PushNotificationSettings,
  SiteSettings,
  SocialAuthProvider,
} from "@/types/settings";

const SiteSettingsPage = async () => {
  let gateways: PaymentGatewayAdmin[] = [];
  let siteSettings: SiteSettings | null = null;
  let emailSettings: EmailSettings | null = null;
  let awsStorageSettings: AwsStorageSettings | null = null;
  let bbbSettings: BbbSettings | null = null;
  let pushNotificationSettings: PushNotificationSettings | null = null;
  let socialProviders: SocialAuthProvider[] = [];

  try {
    const [
      gatewaysResponse,
      siteResponse,
      emailResponse,
      awsResponse,
      bbbResponse,
      pushResponse,
      socialResponse,
    ] =
      await Promise.all([
        settingsServerService.getGateways(),
        settingsServerService.getSiteSettings(),
        settingsServerService.getEmailSettings(),
        settingsServerService.getAwsStorageSettings(),
        settingsServerService.getBbbSettings(),
        settingsServerService.getPushNotificationSettings(),
        settingsServerService.getSocialAuthSettings(),
      ]);

    gateways = gatewaysResponse.data;
    siteSettings = siteResponse.data;
    emailSettings = emailResponse.data;
    awsStorageSettings = awsResponse.data;
    bbbSettings = bbbResponse.data;
    pushNotificationSettings = pushResponse.data;
    socialProviders = socialResponse.data.providers || [];
  } catch {
    gateways = [];
  }

  return (
    <SiteSettingsDashboard
      gateways={gateways}
      siteSettings={siteSettings}
      emailSettings={emailSettings}
      awsStorageSettings={awsStorageSettings}
      bbbSettings={bbbSettings}
      pushNotificationSettings={pushNotificationSettings}
      socialProviders={socialProviders}
    />
  );
};

export default SiteSettingsPage;
