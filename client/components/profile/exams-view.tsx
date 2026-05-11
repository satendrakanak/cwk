"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  ClipboardCheck,
  Lock,
  Sparkles,
} from "lucide-react";

import { Course } from "@/types/course";
import { ExamHistoryRecord } from "@/types/exam";
import { ExamHistory } from "./exam-history";
import { cn } from "@/lib/utils";

interface ExamsViewProps {
  courses: Course[];
  examHistory: ExamHistoryRecord[];
}

export function ExamsView({ courses, examHistory }: ExamsViewProps) {
  const attemptedCourseIds = new Set(examHistory.map((item) => item.course.id));

  const upcomingExams = courses
    .filter((course) => course.exam?.isPublished)
    .map((course) => ({
      course,
      hasAttempted: attemptedCourseIds.has(course.id),
      progress: Math.round(course.progress?.progress || 0),
    }));

  const totalAttempts = examHistory.reduce(
    (sum, item) => sum + item.attemptsCount,
    0,
  );

  const passedCourses = examHistory.filter((item) => item.passed).length;

  return (
    <div className="space-y-8">
      <section className="academy-card relative overflow-hidden p-5 md:p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-[90px]" />
          <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-[90px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Exam Centre
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-card-foreground md:text-4xl">
              Review every final exam, result, and next milestone.
            </h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
              See what is available now, what is still locked behind course
              completion, and how your final assessments are progressing.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HeroMetric label="Exam courses" value={upcomingExams.length} />
            <HeroMetric label="Attempts tracked" value={totalAttempts} />
            <HeroMetric label="Passed courses" value={passedCourses} />
          </div>
        </div>
      </section>

      <section className="academy-card p-5 md:p-6">
        <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Upcoming Exams
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-card-foreground">
              Courses with final assessments
            </h3>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            A final exam unlocks only after course completion. Open the course
            and continue learning to make an exam available.
          </p>
        </div>

        {upcomingExams.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <ClipboardCheck className="h-8 w-8" />
            </div>

            <p className="text-sm font-semibold text-card-foreground">
              No published final exams found
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
              No published final exams are attached to your current enrollments.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {upcomingExams.map(({ course, hasAttempted, progress }) => {
              const unlocked = progress >= 100;
              const safeProgress = Math.min(progress, 100);

              return (
                <article
                  key={course.id}
                  className="rounded-3xl border border-border bg-card p-5 shadow-(--shadow-card) transition-all duration-300 hover:border-primary/25 hover:shadow-[0_26px_80px_color-mix(in_oklab,var(--primary)_12%,transparent)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                        Final assessment
                      </p>

                      <h4 className="mt-2 line-clamp-2 text-lg font-semibold leading-7 text-card-foreground">
                        {course.title}
                      </h4>
                    </div>

                    <span
                      className={cn(
                        "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border px-3 text-xs font-bold",
                        unlocked
                          ? "border-primary/15 bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {unlocked ? (
                        <Sparkles className="h-3.5 w-3.5" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}

                      {unlocked ? "Available now" : "Locked"}
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>Course progress</span>
                      <span>{safeProgress}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${safeProgress}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {unlocked
                      ? "All course lectures are complete, so you can now take the final exam."
                      : `${progress}% course progress completed. Finish all lessons to unlock the exam.`}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-muted px-3 font-semibold">
                      <Clock3 className="h-3.5 w-3.5 text-primary" />
                      {course.exam?.timeLimitMinutes
                        ? `${course.exam.timeLimitMinutes} mins`
                        : "No time limit"}
                    </span>

                    <span className="inline-flex h-9 items-center rounded-full border border-border bg-muted px-3 font-semibold">
                      {course.exam?.maxAttempts || "Unlimited"} attempts
                    </span>

                    {hasAttempted ? (
                      <span className="inline-flex h-9 items-center rounded-full border border-primary/15 bg-primary/10 px-3 font-semibold text-primary">
                        Attempted before
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <Link
                      href={`/course/${course.slug}/learn`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Open learning screen
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="academy-card p-5 md:p-6">
        <ExamHistory records={examHistory} />
      </section>
    </div>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-37.5 items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <ClipboardCheck className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0">
        <p className="text-lg font-semibold leading-none text-card-foreground">
          {value}
        </p>

        <p className="mt-1.5 line-clamp-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}
