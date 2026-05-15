import type {
  CourseDeliveryMode,
  LicenseFeatureKey,
  LicenseSummary,
} from "@/types/license";

export function isLicenseFeatureEnabled(
  summary: LicenseSummary | null | undefined,
  feature: LicenseFeatureKey,
) {
  return summary?.plan?.features[feature] === true;
}

export function getAllowedCourseModes(
  summary: LicenseSummary | null | undefined,
) {
  return (
    summary?.plan?.rules.allowedCourseModes ?? [
      "self_learning",
      "faculty_led",
      "hybrid",
    ]
  );
}

export function isCourseModeAllowed(
  summary: LicenseSummary | null | undefined,
  mode: CourseDeliveryMode,
) {
  return getAllowedCourseModes(summary).includes(mode);
}
