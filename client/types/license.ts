export type LicensePlan = "starter" | "plus" | "enterprise";

export type LicenseLimitKey = "users" | "courses" | "faculty";

export type LicenseFeatureKey =
  | "courses"
  | "faculty"
  | "liveClasses"
  | "exams"
  | "assignments"
  | "certificates"
  | "coupons"
  | "emailTemplates"
  | "engagement"
  | "advancedSettings"
  | "branding"
  | "prioritySupport";

export type LicenseRecord = {
  id: number;
  key: string;
  plan: LicensePlan;
  status: "active" | "expired" | "revoked";
  purchaserEmail?: string | null;
  expiresAt?: string | null;
  activatedAt?: string | null;
};

export type LicensePlanDefinition = {
  plan: LicensePlan;
  label: string;
  limits: Record<LicenseLimitKey, number | null>;
  features: Record<LicenseFeatureKey, boolean>;
};

export type LicenseUsage = Record<LicenseLimitKey, number>;

export type LicenseSummary = {
  license: LicenseRecord | null;
  plan: LicensePlanDefinition;
  usage: LicenseUsage;
  locked: Record<LicenseLimitKey, boolean>;
};
