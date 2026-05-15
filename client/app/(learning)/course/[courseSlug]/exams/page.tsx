import { notFound } from "next/navigation";

import { CourseExamPageClient } from "@/components/course/learn/course-exam-page-client";
import { EnrollmentGate } from "@/components/layout/enrollment-gate";
import { getErrorMessage } from "@/lib/error-handler";
import { courseServerService } from "@/services/courses/course.server";
import { Course } from "@/types/course";
import { licenseServerService } from "@/services/licenses/license.server";
import { isLicenseFeatureEnabled } from "@/lib/license/feature-access";

export default async function CourseExamPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  if (!courseSlug) {
    notFound();
  }

  let course: Course | null = null;
  let hasAccess = true;

  try {
    const [response, licenseResponse] = await Promise.all([
      courseServerService.getLearningCourseBySlug(courseSlug),
      licenseServerService.getCurrent().catch(() => null),
    ]);

    course = response.data;
    if (!isLicenseFeatureEnabled(licenseResponse?.data, "exams")) {
      notFound();
    }
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    if (message.toLowerCase().includes("have access to this course")) {
      hasAccess = false;
    } else {
      throw error;
    }
  }

  return (
    <EnrollmentGate hasAccess={hasAccess} courseSlug={courseSlug}>
      {course ? <CourseExamPageClient course={course} /> : null}
    </EnrollmentGate>
  );
}
