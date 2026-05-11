import { notFound } from "next/navigation";

import { CourseExamPageClient } from "@/components/course/learn/course-exam-page-client";
import { EnrollmentGate } from "@/components/layout/enrollment-gate";
import { getErrorMessage } from "@/lib/error-handler";
import { courseServerService } from "@/services/courses/course.server";
import { Course } from "@/types/course";

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
    const response =
      await courseServerService.getLearningCourseBySlug(courseSlug);

    course = response.data;
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
