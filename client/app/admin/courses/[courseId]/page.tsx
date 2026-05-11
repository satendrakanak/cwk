import { CourseHeader } from "@/components/admin/courses/course-header";
import { RightSidebar } from "@/components/admin/courses/right-sidebar";
import { BasicInfoForm } from "@/components/admin/courses/basic-info-form";
import { CourseDetailsForm } from "@/components/admin/courses/course-details-form";
import { RequirementsForm } from "@/components/admin/courses/requirements-form";
import { MetaForm } from "@/components/admin/courses/meta-form";
import { CourseFaqsForm } from "@/components/admin/courses/course-faqs-form";
import { courseServerService } from "@/services/courses/course.server";
import ChaptersForm from "@/components/admin/courses/chapters-form";
import { Course } from "@/types/course";
import { CourseDescription } from "@/components/admin/courses/course-description-form";
import { hasPermission, hasRole } from "@/lib/access-control";
import { getSession } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error-handler";
import {
  hasLiveClasses,
  isBlendedCourse,
  isFacultyLedCourse,
} from "@/lib/course-delivery";

export default async function CourseIdPage({
  params,
}: {
  params: Promise<{ courseId: number }>;
}) {
  const { courseId } = await params;

  let course: Course;

  try {
    const [response] = await Promise.all([
      courseServerService.getById(courseId),
    ]);
    course = response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  const session = await getSession();
  const canManageCourseSettings =
    hasRole(session, "admin") || hasPermission(session, "update_course");

  return (
    <div>
      <CourseHeader
        course={course}
        canManageActions={canManageCourseSettings}
      />

      <div className="grid gap-6 py-6 xl:grid-cols-[4fr_1fr]">
        <div className="space-y-6">
          <BasicInfoForm course={course} />
          <CourseDescription course={course} />
          <CourseDetailsForm course={course} />
          {isFacultyLedCourse(course) ? (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Live course curriculum
              </p>
              <h3 className="mt-2 text-lg font-semibold">
                Use chapters as the public syllabus
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Faculty-led courses use chapters as curriculum modules. Add a
                clear title, description, and ordering for each module. Recorded
                lectures are not used for this course type.
              </p>
            </div>
          ) : null}
          {isBlendedCourse(course) ? (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Hybrid course structure
              </p>
              <h3 className="mt-2 text-lg font-semibold">
                Recorded lessons plus live faculty sessions
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Keep chapters and lectures here for recorded learning. Assign
                faculty from the sidebar so batches, calendar sessions, and
                reminders can run from Faculty Workspace.
              </p>
            </div>
          ) : null}
          <ChaptersForm course={course} />
          {hasLiveClasses(course) ? (
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Faculty workflow
              </p>
              <h3 className="mt-2 text-lg font-semibold">
                Manage batches and live classes from Faculty Workspace
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Assign faculty from the right sidebar first. The assigned faculty
                can then create batches, enroll students, schedule classes, and
                send class reminders from their dashboard.
              </p>
            </div>
          ) : null}
          <RequirementsForm course={course} />
          <MetaForm course={course} />
          <CourseFaqsForm course={course} />
        </div>

        <div className="space-y-6">
          {canManageCourseSettings ? <RightSidebar course={course} /> : null}
        </div>
      </div>
    </div>
  );
}
