type CourseModeLike = {
  mode?: string | null;
};

export const COURSE_DELIVERY_MODES = [
  {
    value: "self_learning",
    label: "Self-learning course",
    shortLabel: "Self learning",
    description: "Recorded lectures, progress tracking, resources, and exams.",
  },
  {
    value: "faculty_led",
    label: "Faculty-led live course",
    shortLabel: "Live classes",
    description: "Batches, scheduled classes, reminders, and faculty guidance.",
  },
  {
    value: "hybrid",
    label: "Blended course",
    shortLabel: "Blended",
    description: "Recorded learning plus live faculty sessions.",
  },
] as const;

export type CourseDeliveryMode = (typeof COURSE_DELIVERY_MODES)[number]["value"];

export function getCourseDeliveryMode(mode?: string | null): CourseDeliveryMode {
  if (mode === "faculty_led" || mode === "hybrid") return mode;

  return "self_learning";
}

export function getCourseDeliveryLabel(mode?: string | null) {
  const deliveryMode = getCourseDeliveryMode(mode);

  return (
    COURSE_DELIVERY_MODES.find((item) => item.value === deliveryMode) ??
    COURSE_DELIVERY_MODES[0]
  );
}

export function isSelfLearningCourse(course: CourseModeLike) {
  return getCourseDeliveryMode(course.mode) === "self_learning";
}

export function isFacultyLedCourse(course: CourseModeLike) {
  return getCourseDeliveryMode(course.mode) === "faculty_led";
}

export function isBlendedCourse(course: CourseModeLike) {
  return getCourseDeliveryMode(course.mode) === "hybrid";
}

export function hasRecordedLearning(course: CourseModeLike) {
  return isSelfLearningCourse(course) || isBlendedCourse(course);
}

export function hasLiveClasses(course: CourseModeLike) {
  return isFacultyLedCourse(course) || isBlendedCourse(course);
}
