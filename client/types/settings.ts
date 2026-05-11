export type Gateway = {
  provider: string;
  displayName: string;
};

export type PaymentProvider = "RAZORPAY" | "STRIPE" | "PAYPAL" | "PAYU" | "COD";

export type PaymentMode = "TEST" | "LIVE";

export type PaymentGatewayAdmin = {
  id: number;
  provider: PaymentProvider;
  displayName: string;
  mode: PaymentMode;
  isActive: boolean;
  keyIdPreview: string | null;
  hasKeySecret: boolean;
  hasWebhookSecret: boolean;
  webhookUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertPaymentGatewayPayload = {
  provider: PaymentProvider;
  mode: PaymentMode;
  keyId?: string;
  keySecret?: string;
  webhookSecret?: string;
  webhookUrl?: string;
  isActive: boolean;
};

export type SiteSettings = {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  logoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;
  adminPanelName: string;
  adminPanelIconUrl: string;
  supportEmail: string;
  supportPhone: string;
  supportAddress: string;
  footerAbout: string;
  footerCopyright: string;
  footerCtaEyebrow: string;
  footerCtaHeading: string;
  footerCtaDescription: string;
  footerPrimaryCtaLabel: string;
  footerPrimaryCtaHref: string;
  footerSecondaryCtaLabel: string;
  footerSecondaryCtaHref: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
};

export type EmailSettings = {
  isEnabled: boolean;
  smtpHost: string;
  smtpPort: number;
  secure: boolean;
  smtpUser: string;
  smtpPassword: string;
  hasPassword?: boolean;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
};

export type AwsStorageSettings = {
  isEnabled: boolean;
  region: string;
  bucketName: string;
  cloudfrontUrl: string;
  accessKeyId: string;
  accessKeySecret: string;
  hasAccessKeySecret?: boolean;
};

export type BbbSettings = {
  isEnabled: boolean;
  apiUrl: string;
  sharedSecret: string;
  hasSharedSecret?: boolean;
  defaultRecord: boolean;
  autoStartRecording: boolean;
  allowStartStopRecording: boolean;
  meetingExpireIfNoUserJoinedInMinutes: number;
};

export type PushNotificationSettings = {
  isEnabled: boolean;
  subject: string;
  publicKey: string;
  privateKey: string;
  hasPrivateKey?: boolean;
};

export type SocialProvider = "GOOGLE" | "APPLE" | "META";

export type SocialAuthProvider = {
  provider: SocialProvider;
  label: string;
  isEnabled: boolean;
  redirectUrl: string;
  clientIdPreview?: string | null;
  hasClientSecret?: boolean;
  clientId?: string;
  clientSecret?: string;
};

export type PublicSocialProvider = {
  provider: SocialProvider;
  label: string;
  redirectUrl: string | null;
};

export type PublicSettingsBundle = {
  site: SiteSettings;
  socialProviders: PublicSocialProvider[];
};
