"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SettingsShell } from "@/components/admin/settings/settings-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error-handler";
import { settingsClientService } from "@/services/settings/settings.client";
import {
  AwsStorageSettings,
  BbbSettings,
  EmailSettings,
  PaymentGatewayAdmin,
  PaymentMode,
  PaymentProvider,
  PushNotificationSettings,
  SiteSettings,
  SocialAuthProvider,
  SocialProvider,
  UpsertPaymentGatewayPayload,
} from "@/types/settings";
import { toast } from "sonner";
import {
  BadgeCheck,
  BellRing,
  DatabaseZap,
  ImageIcon,
  Mail,
  Settings2,
  Shield,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaModal } from "@/components/media/media-modal";
import { FileType } from "@/types/file";

const providers: { label: string; value: PaymentProvider }[] = [
  { label: "Razorpay", value: "RAZORPAY" },
  { label: "Stripe", value: "STRIPE" },
  { label: "PayPal", value: "PAYPAL" },
  { label: "PayU", value: "PAYU" },
  { label: "Cash on Delivery", value: "COD" },
];

const modes: { label: string; value: PaymentMode }[] = [
  { label: "Test mode", value: "TEST" },
  { label: "Live mode", value: "LIVE" },
];

const socialLabels: Record<SocialProvider, string> = {
  GOOGLE: "Google",
  APPLE: "Apple",
  META: "Meta",
};

const defaultGatewayForm: UpsertPaymentGatewayPayload = {
  provider: "RAZORPAY",
  mode: "TEST",
  keyId: "",
  keySecret: "",
  webhookSecret: "",
  webhookUrl: "",
  isActive: false,
};

const defaultSiteSettings: SiteSettings = {
  siteName: "CodeWithKasa",
  siteTagline: "Coding tutorials for you",
  siteDescription:
    "Practical coding education for learners who want clarity, mentorship, and real-world application.",
  logoUrl: "/assets/cwk-logo-light.png",
  footerLogoUrl: "/assets/cwk-logo-light.png",
  faviconUrl: "/favicon.png",
  adminPanelName: "CWK",
  adminPanelIconUrl: "/assets/cwk-mark-light.png",
  supportEmail: "info@codewithkasa.com",
  supportPhone: "+91-9809-XXXXXX",
  supportAddress: "India",
  footerAbout:
    "Practical coding education for learners who want clarity, mentorship, and real-world application.",
  footerCopyright: `© ${new Date().getFullYear()} CodeWithKasa. All Rights Reserved`,
  footerCtaEyebrow: "Start Your Learning Journey",
  footerCtaHeading:
    "Build practical coding expertise with a learning system that actually supports you.",
  footerCtaDescription:
    "Explore guided programs, thoughtful faculty, and a curriculum designed to help you learn clearly and apply with confidence.",
  footerPrimaryCtaLabel: "Explore Courses",
  footerPrimaryCtaHref: "/courses",
  footerSecondaryCtaLabel: "Talk to Us",
  footerSecondaryCtaHref: "/contact",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
  twitterUrl: "",
};

const defaultEmailSettings: EmailSettings = {
  isEnabled: false,
  smtpHost: "",
  smtpPort: 587,
  secure: false,
  smtpUser: "",
  smtpPassword: "",
  hasPassword: false,
  fromName: "CodeWithKasa",
  fromEmail: "info@codewithkasa.com",
  replyToEmail: "",
};

const defaultAwsStorageSettings: AwsStorageSettings = {
  isEnabled: false,
  region: "",
  bucketName: "",
  cloudfrontUrl: "",
  accessKeyId: "",
  accessKeySecret: "",
};

const defaultBbbSettings: BbbSettings = {
  isEnabled: false,
  apiUrl: "",
  sharedSecret: "",
  hasSharedSecret: false,
  defaultRecord: false,
  autoStartRecording: false,
  allowStartStopRecording: true,
  meetingExpireIfNoUserJoinedInMinutes: 60,
};

const defaultPushNotificationSettings: PushNotificationSettings = {
  isEnabled: false,
  subject: "",
  publicKey: "",
  privateKey: "",
  hasPrivateKey: false,
};

const defaultSocialProviders: SocialAuthProvider[] = [
  {
    provider: "GOOGLE",
    label: "Continue with Google",
    isEnabled: false,
    redirectUrl: "",
    clientIdPreview: null,
    hasClientSecret: false,
  },
  {
    provider: "APPLE",
    label: "Continue with Apple",
    isEnabled: false,
    redirectUrl: "",
    clientIdPreview: null,
    hasClientSecret: false,
  },
  {
    provider: "META",
    label: "Continue with Meta",
    isEnabled: false,
    redirectUrl: "",
    clientIdPreview: null,
    hasClientSecret: false,
  },
];

export function SiteSettingsDashboard({
  gateways,
  siteSettings,
  emailSettings,
  awsStorageSettings,
  bbbSettings,
  pushNotificationSettings,
  socialProviders,
}: {
  gateways: PaymentGatewayAdmin[];
  siteSettings: SiteSettings | null;
  emailSettings: EmailSettings | null;
  awsStorageSettings: AwsStorageSettings | null;
  bbbSettings: BbbSettings | null;
  pushNotificationSettings: PushNotificationSettings | null;
  socialProviders: SocialAuthProvider[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(gateways);
  const [siteForm, setSiteForm] = useState<SiteSettings>({
    ...defaultSiteSettings,
    ...(siteSettings || {}),
  });
  const [emailForm, setEmailForm] = useState<EmailSettings>({
    ...defaultEmailSettings,
    ...(emailSettings || {}),
  });
  const [awsForm, setAwsForm] = useState<AwsStorageSettings>({
    ...defaultAwsStorageSettings,
    ...(awsStorageSettings || {}),
    accessKeyId: "",
    accessKeySecret: "",
  });
  const [bbbForm, setBbbForm] = useState<BbbSettings>({
    ...defaultBbbSettings,
    ...(bbbSettings || {}),
  });
  const [pushForm, setPushForm] = useState<PushNotificationSettings>({
    ...defaultPushNotificationSettings,
    ...(pushNotificationSettings || {}),
  });
  const [socialForm, setSocialForm] = useState<SocialAuthProvider[]>(
    socialProviders.length ? socialProviders : defaultSocialProviders,
  );
  const [gatewayForm, setGatewayForm] =
    useState<UpsertPaymentGatewayPayload>(defaultGatewayForm);
  const [mediaTarget, setMediaTarget] = useState<
    "logoUrl" | "footerLogoUrl" | "faviconUrl" | "adminPanelIconUrl" | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const selectedGateway = useMemo(
    () =>
      items.find(
        (gateway) =>
          gateway.provider === gatewayForm.provider &&
          gateway.mode === gatewayForm.mode,
      ),
    [gatewayForm.mode, gatewayForm.provider, items],
  );

  const activeSocialProviders = socialForm.filter((item) => item.isEnabled);
  const activeGateway = items.find((gateway) => gateway.isActive);

  const updateSiteField = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) => {
    setSiteForm((current) => ({ ...current, [key]: value }));
  };

  const updateEmailField = <K extends keyof EmailSettings>(
    key: K,
    value: EmailSettings[K],
  ) => {
    setEmailForm((current) => ({ ...current, [key]: value }));
  };

  const updateAwsField = <K extends keyof AwsStorageSettings>(
    key: K,
    value: AwsStorageSettings[K],
  ) => {
    setAwsForm((current) => ({ ...current, [key]: value }));
  };

  const updateBbbField = <K extends keyof BbbSettings>(
    key: K,
    value: BbbSettings[K],
  ) => {
    setBbbForm((current) => ({ ...current, [key]: value }));
  };

  const updatePushField = <K extends keyof PushNotificationSettings>(
    key: K,
    value: PushNotificationSettings[K],
  ) => {
    setPushForm((current) => ({ ...current, [key]: value }));
  };

  const updateSocialField = (
    provider: SocialProvider,
    key: keyof SocialAuthProvider,
    value: string | boolean,
  ) => {
    setSocialForm((current) =>
      current.map((item) =>
        item.provider === provider ? { ...item, [key]: value } : item,
      ),
    );
  };

  const updateGatewayField = <K extends keyof UpsertPaymentGatewayPayload>(
    key: K,
    value: UpsertPaymentGatewayPayload[K],
  ) => {
    setGatewayForm((current) => ({ ...current, [key]: value }));
  };

  const selectGateway = (gateway: PaymentGatewayAdmin) => {
    setGatewayForm({
      provider: gateway.provider,
      mode: gateway.mode,
      keyId: "",
      keySecret: "",
      webhookSecret: "",
      webhookUrl: gateway.webhookUrl || "",
      isActive: gateway.isActive,
    });
  };

  const saveSiteSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const response =
          await settingsClientService.upsertSiteSettings(siteForm);
        setSiteForm(response.data);
        toast.success("Site settings updated");
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const saveEmailSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const emailPayload = { ...emailForm };
        Reflect.deleteProperty(emailPayload, "hasPassword");
        const { smtpPassword, ...rest } = emailPayload;

        const payload = {
          ...rest,
          ...(smtpPassword?.trim()
            ? { smtpPassword: smtpPassword.trim() }
            : {}),
        };

        const response =
          await settingsClientService.upsertEmailSettings(payload);
        setEmailForm({
          ...response.data,
          smtpPassword: "",
        });
        toast.success("Email configuration updated");
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const saveSocialAuthSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const response = await settingsClientService.upsertSocialAuthSettings(
          socialForm.map((provider) => ({
            provider: provider.provider,
            label: provider.label,
            isEnabled: provider.isEnabled,
            redirectUrl: provider.redirectUrl,
            clientId: provider.clientId || "",
            clientSecret: provider.clientSecret || "",
          })),
        );
        setSocialForm(response.data.providers);
        toast.success("Social auth settings updated");
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const saveAwsStorageSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const awsPayload = { ...awsForm };
        Reflect.deleteProperty(awsPayload, "hasAccessKeySecret");
        const { accessKeyId, accessKeySecret, ...rest } = awsPayload;

        const payload = {
          ...rest,
          ...(accessKeyId?.trim() ? { accessKeyId: accessKeyId.trim() } : {}),
          ...(accessKeySecret?.trim()
            ? { accessKeySecret: accessKeySecret.trim() }
            : {}),
        };

        const response =
          await settingsClientService.upsertAwsStorageSettings(payload);
        setAwsForm({
          ...response.data,
          accessKeyId: "",
          accessKeySecret: "",
        });
        toast.success("AWS storage settings updated");
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const saveBbbSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const bbbPayload = { ...bbbForm };
        Reflect.deleteProperty(bbbPayload, "hasSharedSecret");
        const { sharedSecret, ...rest } = bbbPayload;
        const payload = {
          ...rest,
          ...(sharedSecret?.trim()
            ? { sharedSecret: sharedSecret.trim() }
            : {}),
        };

        const response = await settingsClientService.upsertBbbSettings(payload);
        setBbbForm({
          ...response.data,
          sharedSecret: "",
        });
        toast.success("BigBlueButton settings updated");
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const savePushNotificationSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const pushPayload = { ...pushForm };
        Reflect.deleteProperty(pushPayload, "hasPrivateKey");
        const { privateKey, ...rest } = pushPayload;
        const payload = {
          ...rest,
          ...(privateKey?.trim() ? { privateKey: privateKey.trim() } : {}),
        };

        const response =
          await settingsClientService.upsertPushNotificationSettings(payload);
        setPushForm({
          ...response.data,
          privateKey: "",
        });
        toast.success("Push notification settings updated");
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const generatePushNotificationKeys = () => {
    startTransition(async () => {
      try {
        const response =
          await settingsClientService.generatePushNotificationKeys();
        setPushForm({
          ...response.data,
          privateKey: "",
        });
        toast.success("VAPID keys generated");
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const saveGateway = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const response = await settingsClientService.upsertGateway(gatewayForm);
        const updatedGateway = response.data;
        setItems((current) => {
          const next = current.filter(
            (item) =>
              !(
                item.provider === updatedGateway.provider &&
                item.mode === updatedGateway.mode
              ),
          );
          return [...next, updatedGateway].sort((a, b) =>
            `${a.provider}-${a.mode}`.localeCompare(`${b.provider}-${b.mode}`),
          );
        });
        setGatewayForm((current) => ({
          ...current,
          keyId: "",
          keySecret: "",
          webhookSecret: "",
        }));
        toast.success("Payment settings updated");
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  return (
    <SettingsShell
      title="Site Settings"
      description="Manage brand assets, support details, SMTP delivery, social auth toggles, and payment gateways from one dashboard."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={Settings2}
          label="Site identity"
          value={siteForm.siteName}
          meta={siteForm.siteTagline}
        />
        <StatCard
          icon={Mail}
          label="Email delivery"
          value={emailForm.isEnabled ? "Active" : "Draft"}
          meta={emailForm.fromEmail}
        />
        <StatCard
          icon={Shield}
          label="Social providers"
          value={activeSocialProviders.length}
          meta={`${activeSocialProviders.length} enabled on auth screens`}
        />
        <StatCard
          icon={DatabaseZap}
          label="Storage & checkout"
          value={activeGateway?.displayName || "No gateway"}
          meta={awsForm.bucketName || "AWS storage not configured"}
        />
        <StatCard
          icon={Video}
          label="Live classes"
          value={bbbForm.isEnabled ? "BBB active" : "BBB off"}
          meta={bbbForm.apiUrl || "BigBlueButton not configured"}
        />
        <StatCard
          icon={BellRing}
          label="Push alerts"
          value={pushForm.isEnabled ? "Enabled" : "Off"}
          meta={pushForm.publicKey ? "VAPID keys saved" : "Keys not generated"}
        />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.42fr_0.88fr]">
        <SettingsCard
          eyebrow="Branding"
          title="Site identity & contact details"
          description="Keep website branding, admin branding, support details, footer CTA, and social links neatly organized."
        >
          <form onSubmit={saveSiteSettings} className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[1.18fr_0.92fr]">
              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                      Website branding
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      These details appear across the public website.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Site name">
                      <Input
                        value={siteForm.siteName}
                        onChange={(event) =>
                          updateSiteField("siteName", event.target.value)
                        }
                      />
                    </Field>
                    <Field label="Site tagline">
                      <Input
                        value={siteForm.siteTagline}
                        onChange={(event) =>
                          updateSiteField("siteTagline", event.target.value)
                        }
                      />
                    </Field>
                  </div>

                  <Field label="Site description" className="mt-4">
                    <Textarea
                      value={siteForm.siteDescription}
                      onChange={(event) =>
                        updateSiteField("siteDescription", event.target.value)
                      }
                    />
                  </Field>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                      Contact details
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      Keep support information synced everywhere.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Support email">
                      <Input
                        value={siteForm.supportEmail}
                        onChange={(event) =>
                          updateSiteField("supportEmail", event.target.value)
                        }
                      />
                    </Field>
                    <Field label="Support phone">
                      <Input
                        value={siteForm.supportPhone}
                        onChange={(event) =>
                          updateSiteField("supportPhone", event.target.value)
                        }
                      />
                    </Field>
                  </div>

                  <Field label="Support address" className="mt-4">
                    <Textarea
                      value={siteForm.supportAddress}
                      onChange={(event) =>
                        updateSiteField("supportAddress", event.target.value)
                      }
                    />
                  </Field>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                      Media assets
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      Choose each image separately from the media library.
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <MediaField
                      label="Header logo"
                      value={siteForm.logoUrl}
                      onChoose={() => setMediaTarget("logoUrl")}
                    />
                    <MediaField
                      label="Footer logo"
                      value={siteForm.footerLogoUrl}
                      onChoose={() => setMediaTarget("footerLogoUrl")}
                    />
                    <MediaField
                      label="Favicon"
                      value={siteForm.faviconUrl}
                      onChoose={() => setMediaTarget("faviconUrl")}
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/6">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                      Admin branding
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      Use a short label and compact icon for the sidebar.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                    <Field label="Admin panel short name">
                      <Input
                        maxLength={18}
                        value={siteForm.adminPanelName}
                        onChange={(event) =>
                          updateSiteField("adminPanelName", event.target.value)
                        }
                        placeholder="CWK"
                      />
                    </Field>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
                    <MediaField
                      label="Admin icon"
                      value={siteForm.adminPanelIconUrl}
                      onChoose={() => setMediaTarget("adminPanelIconUrl")}
                      compact
                    />
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Preview
                      </p>
                      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-[var(--brand-50)] text-[var(--brand-700)]">
                          {siteForm.adminPanelIconUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={siteForm.adminPanelIconUrl}
                              alt={siteForm.adminPanelName || "Admin icon"}
                              className="size-8 rounded-lg object-contain"
                            />
                          ) : (
                            <ImageIcon className="size-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">
                            {siteForm.adminPanelName || "U"}
                          </p>
                          <p className="text-xs text-slate-500">Admin Panel</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Field label="Footer about">
              <Textarea
                value={siteForm.footerAbout}
                onChange={(event) =>
                  updateSiteField("footerAbout", event.target.value)
                }
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Footer CTA eyebrow">
                <Input
                  value={siteForm.footerCtaEyebrow}
                  onChange={(event) =>
                    updateSiteField("footerCtaEyebrow", event.target.value)
                  }
                />
              </Field>
              <Field label="Footer CTA heading">
                <Input
                  value={siteForm.footerCtaHeading}
                  onChange={(event) =>
                    updateSiteField("footerCtaHeading", event.target.value)
                  }
                />
              </Field>
            </div>

            <Field label="Footer CTA description">
              <Textarea
                value={siteForm.footerCtaDescription}
                onChange={(event) =>
                  updateSiteField("footerCtaDescription", event.target.value)
                }
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Primary CTA label">
                <Input
                  value={siteForm.footerPrimaryCtaLabel}
                  onChange={(event) =>
                    updateSiteField("footerPrimaryCtaLabel", event.target.value)
                  }
                />
              </Field>
              <Field label="Primary CTA href">
                <Input
                  value={siteForm.footerPrimaryCtaHref}
                  onChange={(event) =>
                    updateSiteField("footerPrimaryCtaHref", event.target.value)
                  }
                />
              </Field>
              <Field label="Secondary CTA label">
                <Input
                  value={siteForm.footerSecondaryCtaLabel}
                  onChange={(event) =>
                    updateSiteField(
                      "footerSecondaryCtaLabel",
                      event.target.value,
                    )
                  }
                />
              </Field>
              <Field label="Secondary CTA href">
                <Input
                  value={siteForm.footerSecondaryCtaHref}
                  onChange={(event) =>
                    updateSiteField(
                      "footerSecondaryCtaHref",
                      event.target.value,
                    )
                  }
                />
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Facebook URL">
                <Input
                  value={siteForm.facebookUrl}
                  onChange={(event) =>
                    updateSiteField("facebookUrl", event.target.value)
                  }
                />
              </Field>
              <Field label="Instagram URL">
                <Input
                  value={siteForm.instagramUrl}
                  onChange={(event) =>
                    updateSiteField("instagramUrl", event.target.value)
                  }
                />
              </Field>
              <Field label="YouTube URL">
                <Input
                  value={siteForm.youtubeUrl}
                  onChange={(event) =>
                    updateSiteField("youtubeUrl", event.target.value)
                  }
                />
              </Field>
              <Field label="LinkedIn URL">
                <Input
                  value={siteForm.linkedinUrl}
                  onChange={(event) =>
                    updateSiteField("linkedinUrl", event.target.value)
                  }
                />
              </Field>
              <Field label="Twitter URL">
                <Input
                  value={siteForm.twitterUrl}
                  onChange={(event) =>
                    updateSiteField("twitterUrl", event.target.value)
                  }
                />
              </Field>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save site settings"}
              </Button>
            </div>
          </form>
        </SettingsCard>

        <div className="space-y-6">
          <SettingsCard
            eyebrow="SMTP"
            title="Email configuration"
            description="Store delivery settings in the database and use them for outgoing transactional mail."
          >
            <form onSubmit={saveEmailSettings} className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/6">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Enable DB mailer
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    When enabled, outgoing mail uses the saved SMTP config.
                  </p>
                </div>
                <Switch
                  checked={emailForm.isEnabled}
                  onCheckedChange={(checked) =>
                    updateEmailField("isEnabled", checked)
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="SMTP host">
                  <Input
                    value={emailForm.smtpHost}
                    onChange={(event) =>
                      updateEmailField("smtpHost", event.target.value)
                    }
                  />
                </Field>
                <Field label="SMTP port">
                  <Input
                    type="number"
                    value={emailForm.smtpPort}
                    onChange={(event) =>
                      updateEmailField("smtpPort", Number(event.target.value))
                    }
                  />
                </Field>
                <Field label="SMTP username">
                  <Input
                    value={emailForm.smtpUser}
                    onChange={(event) =>
                      updateEmailField("smtpUser", event.target.value)
                    }
                  />
                </Field>

                <Field label="SMTP password">
                  <Input
                    type="password"
                    placeholder={
                      emailForm.hasPassword
                        ? "Leave blank to keep existing password"
                        : "Enter SMTP password"
                    }
                    value={emailForm.smtpPassword || ""}
                    onChange={(event) =>
                      updateEmailField("smtpPassword", event.target.value)
                    }
                  />
                </Field>
                <Field label="From name">
                  <Input
                    value={emailForm.fromName}
                    onChange={(event) =>
                      updateEmailField("fromName", event.target.value)
                    }
                  />
                </Field>
                <Field label="From email">
                  <Input
                    value={emailForm.fromEmail}
                    onChange={(event) =>
                      updateEmailField("fromEmail", event.target.value)
                    }
                  />
                </Field>
                <Field label="Reply-to email">
                  <Input
                    value={emailForm.replyToEmail}
                    onChange={(event) =>
                      updateEmailField("replyToEmail", event.target.value)
                    }
                  />
                </Field>
                <Field label="Use secure connection">
                  <div className="flex h-11 items-center rounded-xl border border-slate-200 px-3 dark:border-white/10 dark:bg-white/6">
                    <Switch
                      checked={emailForm.secure}
                      onCheckedChange={(checked) =>
                        updateEmailField("secure", checked)
                      }
                    />
                  </div>
                </Field>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save email config"}
                </Button>
              </div>
            </form>
          </SettingsCard>

          <SettingsCard
            eyebrow="Live classes"
            title="BigBlueButton configuration"
            description="Store BBB API URL and shared secret encrypted in the database. Faculty and learners receive signed join links from the backend."
          >
            <form onSubmit={saveBbbSettings} className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/6">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Enable BigBlueButton
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    When enabled, calendar classes can start and join BBB rooms.
                  </p>
                </div>
                <Switch
                  checked={bbbForm.isEnabled}
                  onCheckedChange={(checked) =>
                    updateBbbField("isEnabled", checked)
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="BBB API URL">
                  <Input
                    placeholder="https://bbb.example.com/bigbluebutton/api"
                    value={bbbForm.apiUrl}
                    onChange={(event) =>
                      updateBbbField("apiUrl", event.target.value)
                    }
                  />
                </Field>
                <Field label="Shared secret">
                  <Input
                    type="password"
                    placeholder={
                      bbbForm.hasSharedSecret
                        ? "Saved already, enter a new secret to rotate"
                        : "Enter BBB shared secret"
                    }
                    value={bbbForm.sharedSecret || ""}
                    onChange={(event) =>
                      updateBbbField("sharedSecret", event.target.value)
                    }
                  />
                </Field>
                <Field label="Meeting expiry without users">
                  <Input
                    type="number"
                    min="5"
                    value={bbbForm.meetingExpireIfNoUserJoinedInMinutes}
                    onChange={(event) =>
                      updateBbbField(
                        "meetingExpireIfNoUserJoinedInMinutes",
                        Number(event.target.value),
                      )
                    }
                  />
                </Field>
                <Field label="Allow recording controls">
                  <div className="flex h-11 items-center rounded-xl border border-slate-200 px-3 dark:border-white/10 dark:bg-white/6">
                    <Switch
                      checked={bbbForm.allowStartStopRecording}
                      onCheckedChange={(checked) =>
                        updateBbbField("allowStartStopRecording", checked)
                      }
                    />
                  </div>
                </Field>
                <Field label="Record meetings by default">
                  <div className="flex h-11 items-center rounded-xl border border-slate-200 px-3 dark:border-white/10 dark:bg-white/6">
                    <Switch
                      checked={bbbForm.defaultRecord}
                      onCheckedChange={(checked) =>
                        updateBbbField("defaultRecord", checked)
                      }
                    />
                  </div>
                </Field>
                <Field label="Auto-start recording">
                  <div className="flex h-11 items-center rounded-xl border border-slate-200 px-3 dark:border-white/10 dark:bg-white/6">
                    <Switch
                      checked={bbbForm.autoStartRecording}
                      onCheckedChange={(checked) =>
                        updateBbbField("autoStartRecording", checked)
                      }
                    />
                  </div>
                </Field>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/6 dark:text-slate-300">
                Run <code>bbb-conf --secret</code> on your BBB server to get the
                API URL and shared secret. The secret is encrypted before it is
                stored.
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save BBB config"}
                </Button>
              </div>
            </form>
          </SettingsCard>

          <SettingsCard
            eyebrow="PWA"
            title="Push notification configuration"
            description="Enable browser push for class reminders, exam updates, and important learner alerts. VAPID private key is stored encrypted."
          >
            <form onSubmit={savePushNotificationSettings} className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/6">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Enable push notifications
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Users can subscribe from their notifications page once this
                    is enabled.
                  </p>
                </div>
                <Switch
                  checked={pushForm.isEnabled}
                  onCheckedChange={(checked) =>
                    updatePushField("isEnabled", checked)
                  }
                />
              </div>

              <Field label="VAPID subject">
                <Input
                  placeholder="mailto:support@example.com"
                  value={pushForm.subject}
                  onChange={(event) =>
                    updatePushField("subject", event.target.value)
                  }
                />
              </Field>

              <Field label="Public key">
                <Textarea
                  value={pushForm.publicKey}
                  onChange={(event) =>
                    updatePushField("publicKey", event.target.value)
                  }
                  placeholder="Generate keys or paste existing VAPID public key"
                />
              </Field>

              <Field label="Private key">
                <Input
                  type="password"
                  placeholder={
                    pushForm.hasPrivateKey
                      ? "Saved already, enter a new key to rotate"
                      : "Generate keys or paste existing VAPID private key"
                  }
                  value={pushForm.privateKey || ""}
                  onChange={(event) =>
                    updatePushField("privateKey", event.target.value)
                  }
                />
              </Field>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/6 dark:text-slate-300">
                Production push needs HTTPS. Localhost works for testing in
                Chrome/Edge, and iOS push only works after installing the PWA to
                the home screen.
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={generatePushNotificationKeys}
                >
                  {isPending ? "Working..." : "Generate VAPID keys"}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save push config"}
                </Button>
              </div>
            </form>
          </SettingsCard>

          <SettingsCard
            eyebrow="Social auth"
            title="Login provider visibility"
            description="Active providers show up automatically on sign-in and sign-up forms."
          >
            <form onSubmit={saveSocialAuthSettings} className="space-y-4">
              {socialForm.map((provider) => (
                <div
                  key={provider.provider}
                  className="rounded-2xl border border-slate-200 p-4 dark:border-white/10 dark:bg-white/6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">
                        {socialLabels[provider.provider]}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-300">
                        {provider.clientIdPreview || "No client ID saved yet"}
                      </p>
                    </div>
                    <Switch
                      checked={provider.isEnabled}
                      onCheckedChange={(checked) =>
                        updateSocialField(
                          provider.provider,
                          "isEnabled",
                          checked,
                        )
                      }
                    />
                  </div>

                  <div className="mt-4 grid gap-4">
                    <Field label="Button label">
                      <Input
                        value={provider.label}
                        onChange={(event) =>
                          updateSocialField(
                            provider.provider,
                            "label",
                            event.target.value,
                          )
                        }
                      />
                    </Field>
                    <Field label="Redirect URL">
                      <Input
                        value={provider.redirectUrl}
                        onChange={(event) =>
                          updateSocialField(
                            provider.provider,
                            "redirectUrl",
                            event.target.value,
                          )
                        }
                      />
                    </Field>
                    <Field label="Client ID">
                      <Input
                        placeholder={
                          provider.clientIdPreview || "Enter client ID"
                        }
                        value={provider.clientId || ""}
                        onChange={(event) =>
                          updateSocialField(
                            provider.provider,
                            "clientId",
                            event.target.value,
                          )
                        }
                      />
                    </Field>
                    <Field label="Client secret">
                      <Input
                        type="password"
                        placeholder={
                          provider.hasClientSecret
                            ? "Saved already, enter a new secret to rotate"
                            : "Enter client secret"
                        }
                        value={provider.clientSecret || ""}
                        onChange={(event) =>
                          updateSocialField(
                            provider.provider,
                            "clientSecret",
                            event.target.value,
                          )
                        }
                      />
                    </Field>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save social auth"}
                </Button>
              </div>
            </form>
          </SettingsCard>

          <SettingsCard
            eyebrow="AWS"
            title="Storage configuration"
            description="Move S3 credentials, bucket details, and CloudFront setup into the database-backed settings panel."
          >
            <form onSubmit={saveAwsStorageSettings} className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/6">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Enable DB-backed storage config
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    Uploads and certificate storage can use the values saved
                    here.
                  </p>
                </div>
                <Switch
                  checked={awsForm.isEnabled}
                  onCheckedChange={(checked) =>
                    updateAwsField("isEnabled", checked)
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="AWS region">
                  <Input
                    value={awsForm.region}
                    onChange={(event) =>
                      updateAwsField("region", event.target.value)
                    }
                  />
                </Field>
                <Field label="Bucket name">
                  <Input
                    value={awsForm.bucketName}
                    onChange={(event) =>
                      updateAwsField("bucketName", event.target.value)
                    }
                  />
                </Field>
                <Field label="CloudFront URL">
                  <Input
                    value={awsForm.cloudfrontUrl}
                    onChange={(event) =>
                      updateAwsField("cloudfrontUrl", event.target.value)
                    }
                  />
                </Field>
                <Field label="Access key ID">
                  <Input
                    placeholder={
                      awsStorageSettings?.accessKeyId || "Enter access key ID"
                    }
                    value={awsForm.accessKeyId}
                    onChange={(event) =>
                      updateAwsField("accessKeyId", event.target.value)
                    }
                  />
                </Field>
                <Field label="Secret access key">
                  <Input
                    type="password"
                    placeholder={
                      awsStorageSettings?.hasAccessKeySecret
                        ? "Saved already, enter a new secret to rotate"
                        : "Enter secret access key"
                    }
                    value={awsForm.accessKeySecret}
                    onChange={(event) =>
                      updateAwsField("accessKeySecret", event.target.value)
                    }
                  />
                </Field>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save AWS config"}
                </Button>
              </div>
            </form>
          </SettingsCard>
        </div>
      </section>

      <SettingsCard
        eyebrow="Payments"
        title="Checkout gateway controls"
        description="Live/test credentials stay encrypted in the backend. Activate only one mode per provider when you are ready."
      >
        <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="grid gap-3 md:grid-cols-2">
            {items.length ? (
              items.map((gateway) => (
                <button
                  key={`${gateway.provider}-${gateway.mode}`}
                  type="button"
                  onClick={() => selectGateway(gateway)}
                  className={cn(
                    "rounded-3xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--brand-300)] hover:shadow-xl dark:border-white/10 dark:bg-white/6 dark:hover:border-[var(--brand-400)] dark:hover:bg-white/8",
                    selectedGateway?.id === gateway.id
                      ? "border-[var(--brand-400)] shadow-xl"
                      : "border-slate-200",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-950 dark:text-white">
                          {gateway.displayName}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                          {gateway.mode}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                        {gateway.keyIdPreview || "Key preview unavailable"}
                      </p>
                    </div>
                    {gateway.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Active
                      </span>
                    ) : null}
                  </div>
                </button>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/6">
                <p className="font-semibold text-slate-900 dark:text-white">
                  No payment gateway configured yet
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                  Add your first checkout config from the editor.
                </p>
              </div>
            )}
          </div>

          <form
            onSubmit={saveGateway}
            className="space-y-4 rounded-3xl border border-slate-200 p-5 dark:border-white/10 dark:bg-white/6"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Provider">
                <select
                  value={gatewayForm.provider}
                  onChange={(event) =>
                    updateGatewayField(
                      "provider",
                      event.target.value as PaymentProvider,
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] dark:text-white"
                >
                  {providers.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mode">
                <select
                  value={gatewayForm.mode}
                  onChange={(event) =>
                    updateGatewayField(
                      "mode",
                      event.target.value as PaymentMode,
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] dark:text-white"
                >
                  {modes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Key ID">
                <Input
                  placeholder={selectedGateway?.keyIdPreview || "Enter key ID"}
                  value={gatewayForm.keyId || ""}
                  onChange={(event) =>
                    updateGatewayField("keyId", event.target.value)
                  }
                />
              </Field>
              <Field label="Key secret">
                <Input
                  type="password"
                  value={gatewayForm.keySecret || ""}
                  onChange={(event) =>
                    updateGatewayField("keySecret", event.target.value)
                  }
                />
              </Field>
              <Field label="Webhook secret">
                <Input
                  type="password"
                  value={gatewayForm.webhookSecret || ""}
                  onChange={(event) =>
                    updateGatewayField("webhookSecret", event.target.value)
                  }
                />
              </Field>
              <Field label="Webhook URL">
                <Input
                  value={gatewayForm.webhookUrl || ""}
                  onChange={(event) =>
                    updateGatewayField("webhookUrl", event.target.value)
                  }
                />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/6">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Activate this gateway
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  The active config will power checkout and webhook
                  verification.
                </p>
              </div>
              <Switch
                checked={gatewayForm.isActive}
                onCheckedChange={(checked) =>
                  updateGatewayField("isActive", checked)
                }
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save payment config"}
              </Button>
            </div>
          </form>
        </div>
      </SettingsCard>

      <MediaModal
        open={Boolean(mediaTarget)}
        onClose={() => setMediaTarget(null)}
        onSelect={(file: FileType) => {
          if (mediaTarget) {
            updateSiteField(mediaTarget, file.path);
          }
          setMediaTarget(null);
        }}
        previewType="image"
      />
    </SettingsShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  meta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  meta: string;
}) {
  return (
    <div className="min-h-40 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="max-w-full text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-700)] dark:text-[var(--brand-300)]">
            {label}
          </p>
          <h3 className="mt-3 break-words text-2xl font-semibold leading-tight text-slate-950 dark:text-white">
            {value}
          </h3>
          <p className="mt-2 break-words text-sm leading-6 text-slate-500 dark:text-slate-300">
            {meta}
          </p>
        </div>
        <div className="shrink-0 rounded-2xl bg-[var(--brand-50)] p-3 text-[var(--brand-700)] dark:bg-[var(--brand-500)]/15 dark:text-[var(--brand-300)]">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function SettingsCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)] dark:text-[var(--brand-300)]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function MediaField({
  label,
  value,
  onChoose,
  compact = false,
}: {
  label: string;
  value: string;
  onChoose: () => void;
  compact?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div
        className={cn(
          "rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)]",
          compact ? "min-h-[188px]" : "min-h-[214px]",
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              "flex items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/6",
              compact ? "h-24" : "h-32",
            )}
          >
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={value}
                alt={label}
                className="h-full w-full object-contain p-3"
              />
            ) : (
              <ImageIcon className="size-5 text-slate-400 dark:text-slate-500" />
            )}
          </div>
          <div className="min-w-0 flex-1 pt-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {label}
            </p>
            <p className="mt-1 line-clamp-2 break-all text-xs text-slate-500 dark:text-slate-300">
              {value || "Choose from media library"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            onClick={onChoose}
          >
            Select from media
          </Button>
        </div>
      </div>
    </div>
  );
}
