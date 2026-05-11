"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  Clock,
  GraduationCap,
  Video,
} from "lucide-react";

import { WebsiteNavUser } from "@/components/auth/website-nav-user";
import { OpenClassroomButton } from "@/components/classroom/open-classroom-button";
import Logo from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types/course";
import type { FacultyClassSession } from "@/types/faculty-workspace";
import { formatDateTime } from "@/utils/formate-date";

type FacultyLedLearningClientProps = {
  course: Course;
  sessions: FacultyClassSession[];
};

export function FacultyLedLearningClient({
  course,
  sessions,
}: FacultyLedLearningClientProps) {
  const nextSession = sessions[0] ?? null;
  const publishedChapters = course.chapters.filter(
    (chapter) => chapter.isPublished,
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-card/95 px-4 py-3 shadow-sm backdrop-blur md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="shrink-0">
              <Logo />
            </div>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Live Classroom
              </p>
              <h1 className="truncate text-sm font-semibold md:text-base">
                {course.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/my-courses">
                <ArrowLeft className="mr-2 size-4" />
                My courses
              </Link>
            </Button>
            <WebsiteNavUser />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
          <Badge className="mb-5 w-fit">Faculty-led course</Badge>
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            Your course runs through live faculty classes.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Follow your batch schedule, join sessions from this classroom, and
            use the syllabus below to stay clear on what will be covered.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoTile
              icon={CalendarDays}
              title="Batch schedule"
              value={`${sessions.length} upcoming`}
              description="Classes appear here when your faculty schedules them."
            />
            <InfoTile
              icon={Video}
              title="Live sessions"
              value={nextSession ? "Classroom ready" : "Awaiting schedule"}
              description="Join only from this classroom so timing and access stay controlled."
            />
            <InfoTile
              icon={GraduationCap}
              title="Curriculum modules"
              value={`${publishedChapters.length} modules`}
              description="Your faculty teaches these modules through live classes."
            />
          </div>
        </section>

        <aside className="rounded-3xl border bg-card p-5 shadow-sm lg:row-span-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Next class
          </p>

          {nextSession ? (
            <div className="mt-4 space-y-4">
              <h3 className="text-xl font-semibold">{nextSession.title}</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="flex gap-2">
                  <Clock className="mt-0.5 size-4 text-primary" />
                  <span>
                    {formatDateTime(nextSession.startsAt)} to{" "}
                    {formatDateTime(nextSession.endsAt)}
                  </span>
                </p>
                <p>Batch: {nextSession.batch.name}</p>
                {nextSession.faculty ? (
                  <p>
                    Faculty: {nextSession.faculty.firstName}{" "}
                    {nextSession.faculty.lastName ?? ""}
                  </p>
                ) : null}
              </div>
              <OpenClassroomButton
                className="w-full"
                sessionId={nextSession.id}
              />
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed bg-muted/40 p-6 text-center">
              <CalendarDays className="mx-auto mb-3 size-8 text-primary" />
              <p className="font-semibold">No class scheduled yet</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your upcoming batch classes will appear here after faculty
                schedules them.
              </p>
            </div>
          )}
        </aside>

        <section className="rounded-3xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Course syllabus
              </p>
              <h3 className="mt-1 text-xl font-semibold">
                What your faculty will cover
              </h3>
            </div>
            <Badge variant="secondary">
              {publishedChapters.length} modules
            </Badge>
          </div>

          {publishedChapters.length ? (
            <div className="space-y-3">
              {publishedChapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="rounded-2xl border bg-background p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold">{chapter.title}</h4>
                      {chapter.description ? (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {chapter.description}
                        </p>
                      ) : (
                        <p className="mt-3 rounded-xl border border-dashed bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                          Module description will appear here soon.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
              <BookOpenCheck className="mx-auto mb-3 size-8 text-primary" />
              <p className="font-semibold">Syllabus is being prepared</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your faculty will publish modules and descriptions here.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-3xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                Class schedule
              </p>
              <h3 className="mt-1 text-xl font-semibold">Upcoming sessions</h3>
            </div>
            <Badge variant="secondary">{sessions.length} upcoming</Badge>
          </div>

          {sessions.length ? (
            <div className="grid gap-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="grid gap-4 rounded-2xl border bg-background p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="min-w-0">
                    <h4 className="truncate font-semibold">{session.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDateTime(session.startsAt)} to{" "}
                      {formatDateTime(session.endsAt)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Batch: {session.batch.name}
                    </p>
                  </div>
                  <OpenClassroomButton sessionId={session.id} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Schedule will appear here soon.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  title,
  value,
  description,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm font-semibold text-primary">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
