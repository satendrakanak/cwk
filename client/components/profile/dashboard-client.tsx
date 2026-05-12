"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  RadioTower,
} from "lucide-react";

import { CourseCard } from "../courses/course-card";
import { StatCard } from "./stat-card";
import { OrderHistory } from "./order-history";
import { ExamHistory } from "./exam-history";
import { Course } from "@/types/course";
import { DashboardStats, User, WeeklyProgress } from "@/types/user";
import { Order } from "@/types/order";
import { ExamHistoryRecord } from "@/types/exam";
import type { FacultyClassSession } from "@/types/faculty-workspace";
import type { Assignment } from "@/types/assignment";
import { UpcomingClasses } from "./upcoming-classes";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/formate-date";

const ProgressChart = dynamic(
  () => import("@/components/profile/progress-chart"),
  { ssr: false },
);

interface DashboardClientProps {
  stats: DashboardStats;
  courses: Course[];
  weeklyProgress: WeeklyProgress[];
  orders: Order[];
  examHistory: ExamHistoryRecord[];
  user: User;
  upcomingClasses: FacultyClassSession[];
  assignments: Assignment[];
}

export default function DashboardClient({
  stats,
  courses,
  weeklyProgress,
  orders,
  examHistory,
  user,
  upcomingClasses,
  assignments,
}: DashboardClientProps) {
  const learningSummary = stats.learningSummary;
  const pendingAssignments = assignments.filter(
    (assignment) => assignment.submissions?.[0]?.status !== "graded",
  );
  const learningCards = [
    {
      title: "Recorded learning",
      value: learningSummary
        ? `${learningSummary.recordedCourses} course${learningSummary.recordedCourses === 1 ? "" : "s"}`
        : "0 courses",
      description: "Lecture and chapter based progress",
      href: "/my-courses",
      icon: BookOpenCheck,
    },
    {
      title: "Live attendance",
      value: learningSummary
        ? `${learningSummary.attendedLiveClasses}/${learningSummary.completedLiveClasses}`
        : "0/0",
      description:
        learningSummary?.missedLiveClasses
          ? `${learningSummary.missedLiveClasses} missed completed class${learningSummary.missedLiveClasses === 1 ? "" : "es"}`
          : "Completed live classes attended",
      href: "/classes",
      icon: RadioTower,
    },
    {
      title: "Exam readiness",
      value: `${stats.examsPassed}/${stats.examsTaken}`,
      description: "Passed attempts out of total submissions",
      href: "/exams",
      icon: ClipboardCheck,
    },
    {
      title: "Assignments",
      value: pendingAssignments.length,
      description: "Pending coursework from enrolled courses",
      href: "/assignments",
      icon: ClipboardList,
    },
    {
      title: "Certificates",
      value: stats.certificatesEarned,
      description: "Unlocked certificates",
      href: "/certificates",
      icon: Award,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          icon={BookOpenCheck}
          title="Courses Completed"
          value={`${stats.completed}/${stats.courses}`}
          description="Completed courses out of your total active enrollments."
        />

        <StatCard
          icon={BarChart3}
          title="Average Progress"
          value={`${stats.progress}%`}
          description="Overall learning momentum across enrolled courses."
          highlight
        />

        <StatCard
          icon={ClipboardCheck}
          title="Exam Attempts"
          value={stats.examsTaken}
          description="Total final exam submissions across your courses."
        />

        <StatCard
          icon={GraduationCap}
          title="Exams Passed"
          value={stats.examsPassed}
          description="Final exams you have cleared successfully."
        />

        <StatCard
          icon={Award}
          title="Certificates"
          value={stats.certificatesEarned}
          description="Certificates unlocked after completion milestones."
        />

        <StatCard
          icon={CalendarDays}
          title="Live Classes"
          value={upcomingClasses.length}
          description="Upcoming scheduled classes from your active batches."
        />
      </div>

      <ProgressChart weeklyProgress={weeklyProgress} />

      <section className="academy-card p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-2 border-b border-border pb-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Learning Progress
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-card-foreground">
              Your course journey
            </h3>
          </div>
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground md:mx-0">
            A compact view across self-learning, live classes, exams, and
            certificates. Open each page for full details.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          {learningCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-border bg-background p-4 text-center transition hover:border-primary/40 hover:bg-primary/5 md:text-left"
            >
              <div className="mb-4 flex items-center justify-center gap-3 md:justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <card.icon className="size-5" />
                </span>
                <ArrowRight className="hidden size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary md:block" />
              </div>
              <p className="text-xl font-semibold text-card-foreground">
                {card.value}
              </p>
              <p className="mt-1 text-sm font-medium text-card-foreground">
                {card.title}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {card.description}
              </p>
            </Link>
          ))}
        </div>

        {learningSummary?.courses?.length ? (
          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {learningSummary.courses.slice(0, 3).map((course) => (
              <Link
                key={course.courseId}
                href={`/course/${course.slug}/learn`}
                className="rounded-2xl border border-border bg-muted/30 p-4 text-center transition hover:border-primary/40 md:text-left"
              >
                <div className="flex flex-col items-center justify-between gap-3 md:flex-row md:items-start">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-card-foreground">
                      {course.title}
                    </p>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {course.mode.replace("_", " ")}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {course.overallProgress}%
                  </span>
                </div>
                <Progress value={course.overallProgress} className="mt-4 h-2" />
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs text-muted-foreground md:text-left">
                  {course.recorded.enabled ? (
                    <span>
                      {course.recorded.completedLectures}/
                      {course.recorded.totalLectures} lectures
                    </span>
                  ) : (
                    <span>No lectures</span>
                  )}
                  {course.live.enabled ? (
                    <span>
                      {course.live.attendedClasses}/
                      {course.live.completedClasses} classes
                    </span>
                  ) : (
                    <span>No live classes</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="academy-card p-5 md:p-6">
        <UpcomingClasses sessions={upcomingClasses} limit={3} />
      </section>

      <section className="academy-card p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-2 border-b border-border pb-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Coursework
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-card-foreground">
              Pending assignments
            </h3>
          </div>
          <Link
            href="/assignments"
            className="mx-auto inline-flex items-center gap-2 text-sm font-semibold text-primary md:mx-0"
          >
            View all
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {pendingAssignments.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {pendingAssignments.slice(0, 4).map((assignment) => {
              const submission = assignment.submissions?.[0];

              return (
                <Link
                  key={assignment.id}
                  href="/assignments"
                  className="rounded-2xl border border-border bg-background p-4 text-center transition hover:border-primary/40 hover:bg-primary/5 md:text-left"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold text-card-foreground">
                        {assignment.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {assignment.course.title}
                        {assignment.dueAt
                          ? ` - Due ${formatDateTime(assignment.dueAt)}`
                          : ""}
                      </p>
                    </div>
                    <Badge variant={submission ? "default" : "outline"}>
                      {submission ? submission.status.replace("_", " ") : "Pending"}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-8 text-center text-sm text-muted-foreground">
            No pending assignments right now.
          </div>
        )}
      </section>

      <section className="academy-card p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-2 border-b border-border pb-5 text-center md:flex-row md:items-end md:justify-between md:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Continue Learning
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-card-foreground">
              Pick up where you left off
            </h3>
          </div>

          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground md:mx-0">
            Resume your latest courses, keep the streak alive, and move one step
            closer to completion.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/50 p-10 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <BookOpenCheck className="h-8 w-8" />
            </div>

            <h3 className="mb-2 text-xl font-semibold text-card-foreground">
              No courses yet
            </h3>

            <p className="mb-6 max-w-md text-sm leading-7 text-muted-foreground">
              You haven’t enrolled in any courses yet. Start learning something
              new today.
            </p>

            <Link
              href="/courses"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      <section className="academy-card p-5 md:p-6">
        <OrderHistory
          orders={orders}
          enrolledCourses={courses}
          limit={2}
          showViewAll
          canRequestRefund={user.canRequestRefund}
        />
      </section>

      <section className="academy-card p-5 md:p-6">
        <ExamHistory records={examHistory} />
      </section>
    </div>
  );
}
