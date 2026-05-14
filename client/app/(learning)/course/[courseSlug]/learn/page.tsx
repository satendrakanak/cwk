import { notFound } from "next/navigation";

import { Course } from "@/types/course";
import { courseServerService } from "@/services/courses/course.server";
import { LearnClient } from "@/components/course/learn/learn-client";
import { getErrorMessage } from "@/lib/error-handler";
import { EnrollmentGate } from "@/components/layout/enrollment-gate";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";
import type { FacultyClassSession } from "@/types/faculty-workspace";
import { getLearnerUpcomingSessions } from "@/lib/learner-class-sessions";
import { assignmentServerService } from "@/services/assignments/assignment.server";
import type { Assignment } from "@/types/assignment";
import { licenseServerService } from "@/services/licenses/license.server";
import type { LicenseSummary } from "@/types/license";
import { isLicenseFeatureEnabled } from "@/lib/license/feature-access";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  // 🔥 future: fetch course from API
  const { courseSlug } = await params;

  if (!courseSlug) {
    notFound();
  }

  let course: Course | null = null;
  let liveSessions: FacultyClassSession[] = [];
  let assignments: Assignment[] = [];
  let licenseSummary: LicenseSummary | null = null;
  let hasAccess = true;

  try {
    const response =
      await courseServerService.getLearningCourseBySlug(courseSlug);

    course = response.data;
    const licenseResponse = await licenseServerService
      .getCurrent()
      .catch(() => null);
    licenseSummary = licenseResponse?.data ?? null;
    const [sessions, assignmentsResponse] = await Promise.all([
      isLicenseFeatureEnabled(licenseSummary, "liveClasses")
        ? facultyWorkspaceServer.getMySessions()
        : Promise.resolve([]),
      isLicenseFeatureEnabled(licenseSummary, "assignments")
        ? assignmentServerService.getMyAssignments()
        : Promise.resolve({ data: [] }),
    ]);

    liveSessions = getLearnerUpcomingSessions(
      sessions.filter((session) => session.course.slug === courseSlug),
      new Date().toISOString(),
    );
    assignments = assignmentsResponse.data.filter(
      (assignment) => assignment.course.id === course?.id,
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    // 🔥 detect access error
    if (message.toLowerCase().includes("have access to this course")) {
      hasAccess = false;
    } else {
      throw error;
    }
  }

  return (
    <EnrollmentGate hasAccess={hasAccess} courseSlug={courseSlug}>
      {course && (
        <LearnClient
          course={course}
          liveSessions={liveSessions}
          assignments={assignments}
          licenseSummary={licenseSummary}
        />
      )}
    </EnrollmentGate>
  );
}
