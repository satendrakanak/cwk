import type { LicenseFeatureKey, LicenseSummary } from "@/types/license";

export const LICENSE_PRICING_URL = "https://getkasa.in/#pricing";
export const LICENSE_RECOVERY_PATH = "/admin/settings/license";

type LicenseRouteRule = {
  prefix: string;
  feature?: LicenseFeatureKey;
  label: string;
};

const licenseRouteRules: LicenseRouteRule[] = [
  { prefix: "/admin/courses", feature: "courses", label: "Course management" },
  { prefix: "/admin/exams", feature: "exams", label: "Exams" },
  { prefix: "/admin/assignments", feature: "assignments", label: "Assignments" },
  { prefix: "/admin/coupons", feature: "coupons", label: "Coupons" },
  { prefix: "/admin/refunds", feature: "refunds", label: "Refund management" },
  { prefix: "/admin/recordings", feature: "liveClasses", label: "Live class recordings" },
  { prefix: "/admin/certificates", feature: "certificates", label: "Certificates" },
  { prefix: "/admin/engagement", feature: "engagement", label: "Engagement automation" },
  { prefix: "/admin/articles", feature: "articles", label: "Articles" },
  { prefix: "/admin/email-templates", feature: "emailTemplates", label: "Email templates" },
  { prefix: "/admin/settings/site", feature: "branding", label: "Branding controls" },
  {
    prefix: "/admin/settings/access-control",
    feature: "advancedSettings",
    label: "Roles and permissions",
  },
  { prefix: "/faculty/exams", feature: "exams", label: "Faculty exams" },
  { prefix: "/faculty/assignments", feature: "assignments", label: "Faculty assignments" },
  { prefix: "/faculty/classes", feature: "liveClasses", label: "Faculty classes" },
  { prefix: "/faculty/calendar", feature: "liveClasses", label: "Faculty calendar" },
  { prefix: "/faculty/recordings", feature: "liveClasses", label: "Faculty recordings" },
  { prefix: "/faculty/reminders", feature: "liveClasses", label: "Faculty reminders" },
  { prefix: "/faculty", feature: "faculty", label: "Faculty workspace" },
];

export function isLicenseRecoveryPath(pathname: string | null | undefined) {
  return pathname === LICENSE_RECOVERY_PATH;
}

export function getLicenseRouteRule(pathname: string | null | undefined) {
  if (!pathname) return null;

  return (
    [...licenseRouteRules]
      .sort((a, b) => b.prefix.length - a.prefix.length)
      .find(
        (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`),
      ) ?? null
  );
}

export function getLicenseInvalidReason(summary: LicenseSummary | null) {
  if (!summary?.license) {
    return {
      code: "missing",
      title: "License required",
      description:
        "This workspace needs an active KASA license before admin modules can be used.",
      actionLabel: "Activate license",
      actionHref: LICENSE_RECOVERY_PATH,
    };
  }

  if (summary.license.status === "expired") {
    return {
      code: "expired",
      title: "License expired",
      description:
        "Your KASA license has expired. Renew or activate a valid key to continue using this workspace.",
      actionLabel: "Renew license",
      actionHref: LICENSE_RECOVERY_PATH,
    };
  }

  if (summary.license.status === "revoked") {
    return {
      code: "revoked",
      title: "License deactivated",
      description:
        "This KASA license has been deactivated. Activate a valid key to restore workspace access.",
      actionLabel: "Activate new key",
      actionHref: LICENSE_RECOVERY_PATH,
    };
  }

  if (!summary.plan) {
    return {
      code: "invalid",
      title: "License plan unavailable",
      description:
        "The active key could not be matched to a supported KASA plan. Activate a valid key to continue.",
      actionLabel: "Activate license",
      actionHref: LICENSE_RECOVERY_PATH,
    };
  }

  return null;
}

export function getModuleLockReason(
  summary: LicenseSummary | null,
  pathname: string | null | undefined,
) {
  const invalidReason = getLicenseInvalidReason(summary);
  if (invalidReason) return invalidReason;

  const routeRule = getLicenseRouteRule(pathname);
  const feature = routeRule?.feature;

  if (!summary?.plan || !feature || summary.plan.features[feature]) {
    return null;
  }

  return {
    code: "feature_locked",
    title: `${routeRule.label} is locked`,
    description: `${summary.plan.label} does not include ${routeRule.label.toLowerCase()}. Upgrade your plan to unlock this module.`,
    actionLabel: "Upgrade plan",
    actionHref: LICENSE_PRICING_URL,
  };
}
