import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";

import { CourseCard } from "@/components/courses/course-card";
import { getSession } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error-handler";
import { userServerService } from "@/services/users/user.server";
import { Course } from "@/types/course";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";
import type { FacultyClassSession } from "@/types/faculty-workspace";
import { UpcomingClasses } from "@/components/profile/upcoming-classes";
import { getLearnerUpcomingSessions } from "@/lib/learner-class-sessions";
import {
  hasLiveClasses,
  hasRecordedLearning,
  isFacultyLedCourse,
  isSelfLearningCourse,
} from "@/lib/course-delivery";

export default async function MyCoursesPage() {
  const session = await getSession();

  if (!session) return null;

  let enrolledCourses: Course[] = [];
  let upcomingClasses: FacultyClassSession[] = [];

  try {
    const [coursesResponse, classesResponse] = await Promise.all([
      userServerService.getEnrolledCourses(session.id),
      facultyWorkspaceServer.getMySessions(),
    ]);
    enrolledCourses = coursesResponse.data;
    upcomingClasses = getLearnerUpcomingSessions(
      classesResponse,
      new Date().toISOString(),
    );
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  const selfLearningCourses = enrolledCourses.filter((course) =>
    isSelfLearningCourse(course),
  );
  const facultyLedCourses = enrolledCourses.filter((course) =>
    isFacultyLedCourse(course),
  );
  const hybridCourses = enrolledCourses.filter(
    (course) => hasRecordedLearning(course) && hasLiveClasses(course),
  );

  return (
    <section className="min-h-[60vh] space-y-6">
      <div className="academy-card p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Learning Library
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-card-foreground">
              My Courses
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Continue your enrolled programs and keep your learning progress
              moving.
            </p>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <BookOpenCheck className="h-4 w-4" />
              {enrolledCourses.length}{" "}
              {enrolledCourses.length > 1 ? "courses" : "course"}
            </div>
          ) : null}
        </div>
      </div>

      {enrolledCourses.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          <LearningModeStat
            label="Self learning"
            value={selfLearningCourses.length}
            description="Recorded lectures and self-paced progress."
          />
          <LearningModeStat
            label="Faculty led"
            value={facultyLedCourses.length}
            description="Live batches with classroom schedule."
          />
          <LearningModeStat
            label="Hybrid"
            value={hybridCourses.length}
            description="Recorded learning plus live faculty sessions."
          />
        </div>
      ) : null}

      {upcomingClasses.length > 0 ? (
        <div className="academy-card p-5 md:p-6">
          <UpcomingClasses sessions={upcomingClasses} />
        </div>
      ) : null}

      {enrolledCourses.length === 0 ? (
        <div className="academy-card flex flex-col items-center justify-center border-dashed p-10 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <BookOpenCheck className="h-10 w-10" />
          </div>

          <h3 className="text-2xl font-semibold text-card-foreground">
            No courses yet
          </h3>

          <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
            You haven’t enrolled in any courses yet. Explore available programs
            and start learning something new today.
          </p>

          <Link
            href="/courses"
            className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Explore Courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {enrolledCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}

function LearningModeStat({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-3xl font-semibold text-card-foreground">{value}</p>
      <p className="mt-2 text-sm font-semibold text-card-foreground">{label}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
