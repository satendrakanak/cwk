export const CourseDeliveryMode = {
  SelfLearning: 'self_learning',
  FacultyLed: 'faculty_led',
  Hybrid: 'hybrid',
} as const;

export type CourseDeliveryMode =
  (typeof CourseDeliveryMode)[keyof typeof CourseDeliveryMode];

export const COURSE_DELIVERY_MODE_VALUES = Object.values(CourseDeliveryMode);

export function getCourseDeliveryMode(mode?: string | null): CourseDeliveryMode {
  if (mode === CourseDeliveryMode.FacultyLed || mode === CourseDeliveryMode.Hybrid) {
    return mode;
  }

  return CourseDeliveryMode.SelfLearning;
}

export function hasRecordedLearning(mode?: string | null) {
  const deliveryMode = getCourseDeliveryMode(mode);

  return (
    deliveryMode === CourseDeliveryMode.SelfLearning ||
    deliveryMode === CourseDeliveryMode.Hybrid
  );
}

export function hasLiveClasses(mode?: string | null) {
  const deliveryMode = getCourseDeliveryMode(mode);

  return (
    deliveryMode === CourseDeliveryMode.FacultyLed ||
    deliveryMode === CourseDeliveryMode.Hybrid
  );
}
