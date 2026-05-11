"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Layers,
  PenLine,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  FacultyWorkspaceAttempt,
  FacultyWorkspaceBatchSummary,
  FacultyWorkspaceCourse,
  FacultyWorkspaceData,
  FacultyWorkspaceExam,
  FacultyWorkspaceSession,
} from "@/types/faculty-workspace";
import { formatDate, formatDateTime } from "@/utils/formate-date";

type FacultyDashboardProps = {
  data: FacultyWorkspaceData;
};

export function FacultyDashboard({ data }: FacultyDashboardProps) {
  const nextClass = data.upcomingSessions[0] ?? null;
  const primaryStats = [
    {
      label: "Courses",
      value: data.summary.assignedCourses,
      detail: `${data.summary.publishedCourses} published`,
      href: "/faculty/courses",
      icon: BookOpen,
    },
    {
      label: "Active students",
      value: data.summary.activeStudents,
      detail: "Across assigned courses",
      href: "/faculty/students",
      icon: Users,
    },
    {
      label: "Upcoming classes",
      value: data.summary.upcomingClasses,
      detail: nextClass ? formatDateTime(nextClass.startsAt) : "No class queued",
      href: "/faculty/classes",
      icon: CalendarDays,
    },
    {
      label: "Manual reviews",
      value: data.summary.pendingManualReviews,
      detail:
        data.summary.pendingManualReviews > 0
          ? "Needs grading attention"
          : "No pending reviews",
      href: "/faculty/exams",
      icon: PenLine,
    },
  ];
  const secondaryStats = [
    {
      label: "Assigned exams",
      value: data.summary.assignedExams,
      href: "/faculty/exams",
      icon: ClipboardCheck,
    },
    {
      label: "Active batches",
      value: data.summary.activeBatches,
      href: "/faculty/batches",
      icon: Layers,
    },
    {
      label: "Pending reminders",
      value: data.summary.pendingReminders,
      href: "/faculty/reminders",
      icon: Bell,
    },
  ];
  const deliveryMix = [
    {
      label: "Self-learning",
      value: data.summary.selfLearningCourses,
      href: "/faculty/courses",
      icon: BookOpen,
      description: "Recorded content and learner progress.",
    },
    {
      label: "Faculty-led",
      value: data.summary.facultyLedCourses,
      href: "/faculty/classes",
      icon: Video,
      description: "Live batches, sessions, and attendance.",
    },
    {
      label: "Hybrid",
      value: data.summary.hybridCourses,
      href: "/faculty/courses",
      icon: Layers,
      description: "Recorded lessons with live class support.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <FacultyDashboardHero data={data} nextClass={nextClass} />
        <TodayFocusCard data={data} nextClass={nextClass} />
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {primaryStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
        {secondaryStats.map((stat) => (
          <CompactStatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <DashboardPanel
          title="Delivery mix"
          description="Course modes assigned to your faculty account."
          actionHref="/faculty/courses"
          actionLabel="View courses"
        >
          <div className="grid gap-3">
            {deliveryMix.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border bg-background p-4 transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <ArrowRight className="ml-auto mt-1 size-4 text-muted-foreground transition group-hover:text-primary" />
                </div>
              </Link>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="Calendar and reminders"
          description={`${data.summary.upcomingClasses} upcoming classes and ${data.summary.pendingReminders} pending reminder notifications.`}
          actionHref="/faculty/reminders"
          actionLabel="Open reminders"
        >
          <UpcomingSessionList sessions={data.upcomingSessions} />
        </DashboardPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardPanel
          title="Assigned courses"
          description="Courses connected to your faculty profile."
          actionHref="/faculty/courses"
          actionLabel="View courses"
        >
          <CourseList courses={data.courses} />
        </DashboardPanel>

        <DashboardPanel
          title="Assigned exams"
          description="Assessments you can manage or review."
          actionHref="/faculty/exams"
          actionLabel="View exams"
        >
          <ExamList exams={data.exams} />
        </DashboardPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <DashboardPanel
          title="Recent exam activity"
          description="Latest submissions from your assigned courses."
          actionHref="/faculty/students"
          actionLabel="View learners"
        >
          <AttemptList attempts={data.recentAttempts} />
        </DashboardPanel>

        <DashboardPanel
          title="Batch activity"
          description={`${data.summary.activeBatches} active and ${data.summary.upcomingBatches} upcoming batches.`}
          actionHref="/faculty/batches"
          actionLabel="Manage batches"
        >
          <BatchList batches={data.batches} />
        </DashboardPanel>
      </section>
    </div>
  );
}

function FacultyDashboardHero({
  data,
  nextClass,
}: {
  data: FacultyWorkspaceData;
  nextClass: FacultyWorkspaceSession | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[var(--brand-100)] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%),linear-gradient(135deg,var(--brand-950)_0%,var(--brand-800)_48%,var(--brand-500)_100%)] p-5 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)] md:p-6">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:78px_78px]" />
      <div className="relative">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            Faculty Dashboard
          </p>
          <h1 className="text-2xl font-bold tracking-[-0.03em] md:text-4xl">
            Teaching operations, learner progress, and live classes in one place.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78 md:text-base">
            Track today&apos;s sessions, manage assigned courses, and keep exam
            reviews moving without jumping between screens.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <HeroActionLink
              href="/faculty/classes"
              icon={Video}
              label="Open classes"
              primary
            />
            <HeroActionLink
              href="/faculty/calendar"
              icon={CalendarDays}
              label="Open calendar"
            />
            <HeroActionLink
              href="/faculty/exams"
              icon={ClipboardCheck}
              label="Review exams"
            />
          </div>
        </div>
      </div>

      <div className="relative mt-6 grid gap-3 border-t border-white/12 pt-4 sm:grid-cols-3">
        <HeroMetric
          label="Courses"
          value={data.summary.assignedCourses}
          detail={`${data.summary.publishedCourses} published`}
        />
        <HeroMetric
          label="Students"
          value={data.summary.activeStudents}
          detail="active learners"
        />
        <HeroMetric
          label="Classes"
          value={data.summary.upcomingClasses}
          detail={nextClass ? "next scheduled" : "none queued"}
        />
      </div>
    </div>
  );
}

function HeroActionLink({
  href,
  icon: Icon,
  label,
  primary = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      style={
        primary
          ? {
              backgroundColor: "#ffffff",
              borderColor: "#ffffff",
              color: "#052e16",
            }
          : undefined
      }
      className={
        primary
          ? "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
          : "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-white/24 bg-white/10 px-2.5 text-sm font-medium text-white transition hover:bg-white/15"
      }
    >
      <Icon className="size-4" />
      {label}
      {primary ? <ArrowRight className="size-4" /> : null}
    </Link>
  );
}

function TodayFocusCard({
  data,
  nextClass,
}: {
  data: FacultyWorkspaceData;
  nextClass: FacultyWorkspaceSession | null;
}) {
  return (
    <aside className="rounded-[32px] border bg-card p-5 shadow-sm md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
        Today focus
      </p>
      {nextClass ? (
        <div className="mt-4 rounded-2xl border bg-background p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{nextClass.title}</p>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {nextClass.courseTitle} - {nextClass.batchName}
              </p>
            </div>
            <Badge variant="secondary">Next</Badge>
          </div>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-4" />
            {formatDateTime(nextClass.startsAt)}
          </p>
          <Button asChild className="mt-4 w-full" size="sm">
            <Link href="/faculty/classes">Manage class</Link>
          </Button>
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          text="No upcoming class is scheduled."
          actionHref="/faculty/calendar"
          actionLabel="Plan schedule"
        />
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <FocusMiniCard
          label="Reminders"
          value={data.summary.pendingReminders}
          href="/faculty/reminders"
        />
        <FocusMiniCard
          label="Reviews"
          value={data.summary.pendingManualReviews}
          href="/faculty/exams"
        />
      </div>

      <div className="mt-4 grid gap-3">
        <HeroFocusLink
          href="/faculty/batches"
          icon={Layers}
          label="Batch health"
          value={`${data.summary.activeBatches} active`}
        />
      </div>
    </aside>
  );
}

function HeroMetric({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-h-24 flex-col justify-between rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/60">
        {label}
      </p>
      <div className="mt-3">
        <p className="break-words text-2xl font-bold leading-tight">{value}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/60">
          {detail}
        </p>
      </div>
    </div>
  );
}

function HeroFocusLink({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-2xl border bg-background p-4 text-foreground transition hover:border-primary/40 hover:bg-primary/5"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </span>
          <span className="mt-1 block truncate text-sm font-semibold">
            {value}
          </span>
        </span>
      </span>
      <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function StatCard({
  detail,
  href,
  icon: Icon,
  label,
  value,
}: {
  detail: string;
  href: string;
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <ArrowRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
      </div>
      <p className="mt-6 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
      <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{detail}</p>
    </Link>
  );
}

function CompactStatCard({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">Open workspace</p>
        </div>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </Link>
  );
}

function DashboardPanel({
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      </div>
      {children}
    </div>
  );
}

function UpcomingSessionList({
  sessions,
}: {
  sessions: FacultyWorkspaceSession[];
}) {
  if (!sessions.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        text="No upcoming class is scheduled yet."
        actionHref="/faculty/calendar"
        actionLabel="Add class"
      />
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const reminderCount = (session.reminderOffsetsMinutes ?? []).length;
        const sentCount = (session.sentReminderOffsetsMinutes ?? []).length;

        return (
          <div
            key={session.id}
            className="grid gap-3 rounded-2xl border bg-background p-4 md:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{session.title}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {session.courseTitle} - {session.batchName}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-4" />
                {formatDateTime(session.startsAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Badge variant="secondary">
                {sentCount}/{reminderCount} sent
              </Badge>
              {session.hasBbbMeeting ? (
                <Badge variant="outline">BBB ready</Badge>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CourseList({ courses }: { courses: FacultyWorkspaceCourse[] }) {
  if (!courses.length) {
    return <EmptyState icon={BookOpen} text="No course has been assigned yet." />;
  }

  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/faculty/courses`}
          className="flex items-center justify-between gap-3 rounded-2xl border bg-background p-4 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {course.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {course.studentsCount} active students
              {course.duration ? ` - ${course.duration}` : ""}
            </p>
          </div>
          <Badge variant={course.isPublished ? "default" : "secondary"}>
            {course.isPublished ? "Published" : "Draft"}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

function ExamList({ exams }: { exams: FacultyWorkspaceExam[] }) {
  if (!exams.length) {
    return (
      <EmptyState icon={ClipboardCheck} text="No exam has been assigned yet." />
    );
  }

  return (
    <div className="space-y-3">
      {exams.map((exam) => (
        <Link
          key={exam.id}
          href="/faculty/exams"
          className="block rounded-2xl border bg-background p-4 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {exam.title}
              </p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {exam.courses.map((course) => course.title).join(", ") ||
                  "No course mapped"}
              </p>
            </div>
            <Badge variant="outline">{exam.status}</Badge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {exam.attemptsCount} submitted attempts
          </p>
        </Link>
      ))}
    </div>
  );
}

function AttemptList({
  attempts,
}: {
  attempts: FacultyWorkspaceAttempt[];
}) {
  if (!attempts.length) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        text="No submitted attempts are available yet."
      />
    );
  }

  return (
    <div className="space-y-3">
      {attempts.map((attempt) => (
        <div
          key={attempt.id}
          className="grid gap-3 rounded-2xl border bg-background p-4 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {attempt.learnerName}
            </p>
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {attempt.examTitle} - {attempt.courseTitle}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {attempt.submittedAt
                ? formatDateTime(attempt.submittedAt)
                : "Not submitted"}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <Badge variant={attempt.passed ? "default" : "secondary"}>
              {attempt.passed ? "Passed" : attempt.status}
            </Badge>
            <span className="text-sm font-semibold">{attempt.percentage}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BatchList({ batches }: { batches: FacultyWorkspaceBatchSummary[] }) {
  if (!batches.length) {
    return <EmptyState icon={Layers} text="No batch has been created yet." />;
  }

  return (
    <div className="space-y-3">
      {batches.map((batch) => (
        <Link
          key={batch.id}
          href="/faculty/batches"
          className="block rounded-2xl border bg-background p-4 transition hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{batch.name}</p>
              <p className="line-clamp-1 text-xs text-muted-foreground">
                {batch.courseTitle}
              </p>
            </div>
            <Badge variant="outline">{batch.status}</Badge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {batch.studentsCount} students - {batch.sessionsCount} classes
            {batch.endDate ? ` - Ends ${formatDate(batch.endDate)}` : ""}
          </p>
        </Link>
      ))}
    </div>
  );
}

function FocusMiniCard({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: number;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-background p-4 transition hover:border-primary/40 hover:bg-primary/5"
    >
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </Link>
  );
}

function EmptyState({
  actionHref,
  actionLabel,
  icon: Icon = CheckCircle2,
  text,
}: {
  actionHref?: string;
  actionLabel?: string;
  icon?: LucideIcon;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed bg-background p-6 text-center">
      <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
      {actionHref && actionLabel ? (
        <Button asChild className="mt-4" size="sm" variant="outline">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
