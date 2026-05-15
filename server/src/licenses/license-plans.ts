import { LicensePlan } from './enums/license-plan.enum';

export type LicenseLimitKey = 'users' | 'courses' | 'faculty';
export type CourseDeliveryMode = 'self_learning' | 'faculty_led' | 'hybrid';
export type LicenseFeatureKey =
  | 'courses'
  | 'faculty'
  | 'liveClasses'
  | 'exams'
  | 'assignments'
  | 'certificates'
  | 'coupons'
  | 'refunds'
  | 'articles'
  | 'emailTemplates'
  | 'engagement'
  | 'advancedSettings'
  | 'branding'
  | 'prioritySupport';
export type CertificateRule = 'lecture_completion' | 'exam_pass';

export type LicenseBehaviorRules = {
  certificateRule: CertificateRule;
  allowedCourseModes: CourseDeliveryMode[];
};

export type LicensePlanDefinition = {
  plan: LicensePlan;
  label: string;
  limits: Record<LicenseLimitKey, number | null>;
  features: Record<LicenseFeatureKey, boolean>;
  rules: LicenseBehaviorRules;
};

const baseFeatures: Record<LicenseFeatureKey, boolean> = {
  courses: true,
  faculty: false,
  liveClasses: false,
  exams: false,
  assignments: false,
  certificates: false,
  coupons: false,
  refunds: false,
  articles: true,
  emailTemplates: false,
  engagement: false,
  advancedSettings: false,
  branding: false,
  prioritySupport: false,
};

export const LICENSE_PLANS: Record<LicensePlan, LicensePlanDefinition> = {
  [LicensePlan.STARTER]: {
    plan: LicensePlan.STARTER,
    label: 'KASA Starter',
    limits: {
      users: 25,
      courses: 10,
      faculty: 5,
    },
    features: {
      ...baseFeatures,
      certificates: true,
      branding: true,
    },
    rules: {
      certificateRule: 'lecture_completion',
      allowedCourseModes: ['self_learning'],
    },
  },
  [LicensePlan.PLUS]: {
    plan: LicensePlan.PLUS,
    label: 'KASA Plus',
    limits: {
      users: 100,
      courses: 50,
      faculty: 20,
    },
    features: {
      ...baseFeatures,
      faculty: true,
      liveClasses: true,
      exams: true,
      assignments: true,
      certificates: true,
      coupons: true,
      refunds: true,
      articles: true,
      emailTemplates: true,
      branding: true,
    },
    rules: {
      certificateRule: 'exam_pass',
      allowedCourseModes: ['self_learning', 'faculty_led'],
    },
  },
  [LicensePlan.ENTERPRISE]: {
    plan: LicensePlan.ENTERPRISE,
    label: 'KASA Enterprise',
    limits: {
      users: null,
      courses: null,
      faculty: null,
    },
    features: Object.keys(baseFeatures).reduce(
      (features, key) => ({
        ...features,
        [key]: true,
      }),
      {} as Record<LicenseFeatureKey, boolean>,
    ),
    rules: {
      certificateRule: 'exam_pass',
      allowedCourseModes: ['self_learning', 'faculty_led', 'hybrid'],
    },
  },
};

export const getPlanFromLicenseKey = (key: string): LicensePlan | null => {
  const normalized = key.trim().toUpperCase();

  if (normalized.startsWith('KASA-STARTER-')) return LicensePlan.STARTER;
  if (normalized.startsWith('KASA-PLUS-')) return LicensePlan.PLUS;
  if (normalized.startsWith('KASA-ENTERPRISE-')) {
    return LicensePlan.ENTERPRISE;
  }

  return null;
};

export const normalizeLicensePlan = (plan: string): LicensePlan | null => {
  const normalized = plan.trim().toLowerCase();

  if (normalized.includes('starter')) return LicensePlan.STARTER;
  if (normalized.includes('plus')) return LicensePlan.PLUS;
  if (normalized.includes('enterprise')) return LicensePlan.ENTERPRISE;

  if (normalized === LicensePlan.STARTER) return LicensePlan.STARTER;
  if (normalized === LicensePlan.PLUS) return LicensePlan.PLUS;
  if (normalized === LicensePlan.ENTERPRISE) return LicensePlan.ENTERPRISE;

  return null;
};
