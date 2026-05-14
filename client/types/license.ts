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
  | "refunds"
  | "articles"
  | "emailTemplates"
  | "engagement"
  | "advancedSettings"
  | "branding"
  | "prioritySupport";

export type CertificateRule = "lecture_completion" | "exam_pass";

export type LicenseBehaviorRules = {
  certificateRule: CertificateRule;
};

export type LicenseRecord = {
  id: number;
  keyHash: string;
  keyFingerprint: string;
  keyLast4?: string | null;
  plan: LicensePlan;
  status: "active" | "expired" | "revoked";
  purchaserEmail?: string | null;
  productSlug?: string | null;
  activationId?: string | null;
  activationStatus?: string | null;
  expiresAt?: string | null;
  activatedAt?: string | null;
};

export type LicensePlanDefinition = {
  plan: LicensePlan;
  label: string;
  limits: Record<LicenseLimitKey, number | null>;
  features: Record<LicenseFeatureKey, boolean>;
  rules: LicenseBehaviorRules;
};

export type LicenseUsage = Record<LicenseLimitKey, number>;

export type LicenseSummary = {
  license: LicenseRecord | null;
  plan: LicensePlanDefinition | null;
  usage: LicenseUsage;
  locked: Record<LicenseLimitKey, boolean>;
};
