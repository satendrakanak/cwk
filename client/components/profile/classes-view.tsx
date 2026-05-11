"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  Search,
  UserRound,
  Video,
} from "lucide-react";

import { OpenClassroomButton } from "@/components/classroom/open-classroom-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  FacultyClassRecording,
  FacultyClassSession,
} from "@/types/faculty-workspace";
import { formatDate, formatDateTime, formatTime, getDateKey } from "@/utils/formate-date";
import { ClassRecordings } from "./class-recordings";

type ClassesViewProps = {
  sessions: FacultyClassSession[];
  recordings: FacultyClassRecording[];
  nowIso: string;
};

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ClassesView({ nowIso, recordings, sessions }: ClassesViewProps) {
  const now = new Date(nowIso).getTime();
  const [query, setQuery] = useState("");
  const [monthAnchor, setMonthAnchor] = useState(() =>
    startOfMonth(sessions[0]?.startsAt ? new Date(sessions[0].startsAt) : new Date()),
  );
  const [selectedSession, setSelectedSession] =
    useState<FacultyClassSession | null>(null);

  const filteredSessions = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return sessions.filter((session) => {
      const haystack = [
        session.title,
        session.course.title,
        session.batch.name,
        session.faculty
          ? [session.faculty.firstName, session.faculty.lastName]
              .filter(Boolean)
              .join(" ")
          : "",
      ]
        .join(" ")
        .toLowerCase();

      return !needle || haystack.includes(needle);
    });
  }, [query, sessions]);

  const sessionsByDate = useMemo(() => {
    return filteredSessions.reduce((map, session) => {
      const key = getDateKey(session.startsAt);
      const items = map.get(key) ?? [];
      items.push(session);
      map.set(key, items);
      return map;
    }, new Map<string, FacultyClassSession[]>());
  }, [filteredSessions]);

  const nextClass =
    sessions.find((session) => isJoinableSession(session, now)) ?? null;
  const completedSessions = sessions.filter(
    (session) => new Date(session.endsAt).getTime() <= now,
  );
  const attendedSessions = completedSessions.filter(
    (session) => session.attendance?.attended,
  );
  const absentSessions = completedSessions.filter(
    (session) => !session.attendance?.attended,
  );
  const attendancePercent = completedSessions.length
    ? Math.round((attendedSessions.length / completedSessions.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      <section className="academy-card overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Live class calendar
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-card-foreground">
              Your live class timeline
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Track faculty-led sessions, join BBB classes from one place, and
              keep your course schedule clear.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Total classes" value={sessions.length} />
              <Metric
                label="Attended"
                value={`${attendedSessions.length}/${completedSessions.length}`}
              />
              <Metric label="Attendance" value={`${attendancePercent}%`} />
            </div>
            {absentSessions.length ? (
              <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
                <p className="font-semibold">Attendance warning</p>
                <p className="mt-1 leading-6">
                  You missed {absentSessions.length} completed class
                  {absentSessions.length === 1 ? "" : "es"}. Faculty-led and
                  hybrid course exams may stay locked until attendance is clear.
                </p>
              </div>
            ) : null}
          </div>
          <div className="border-t bg-muted/25 p-6 lg:border-l lg:border-t-0">
            {nextClass ? (
              <div className="rounded-2xl border bg-background p-5">
                <Badge variant="secondary">Next class</Badge>
                <h2 className="mt-4 text-lg font-semibold">{nextClass.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {nextClass.course.title}
                </p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <InfoRow icon={Clock} text={formatDateTime(nextClass.startsAt)} />
                  <InfoRow icon={GraduationCap} text={nextClass.batch.name} />
                  {nextClass.faculty ? (
                    <InfoRow
                      icon={UserRound}
                      text={`Faculty: ${[
                        nextClass.faculty.firstName,
                        nextClass.faculty.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ")}`}
                    />
                  ) : null}
                </div>
                <OpenClassroomButton
                  className="mt-5 w-full"
                  sessionId={nextClass.id}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-background p-6 text-center">
                <CalendarDays className="mx-auto size-8 text-primary" />
                <p className="mt-3 text-sm font-semibold">No classes scheduled</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your faculty-led sessions will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="academy-card p-5 md:p-6">
        <div className="flex flex-col gap-3 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Schedule
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-card-foreground">
              Class timeline
            </h2>
          </div>
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Search class, course, batch, faculty"
            />
          </div>
        </div>

        <ReadOnlyClassCalendar
          monthAnchor={monthAnchor}
          sessions={filteredSessions}
          onMonthChange={setMonthAnchor}
          onSelectSession={setSelectedSession}
        />

        {filteredSessions.length ? (
          <div className="mt-5 space-y-5">
            {[...sessionsByDate.entries()].map(([dateKey, daySessions]) => (
              <div key={dateKey} className="grid gap-3 lg:grid-cols-[180px_1fr]">
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <p className="text-sm font-semibold">
                    {formatDate(`${dateKey}T00:00:00.000Z`)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {daySessions.length} class
                    {daySessions.length === 1 ? "" : "es"}
                  </p>
                </div>
                <div className="space-y-3">
                  {daySessions.map((session) => (
                    <ClassCard
                      key={session.id}
                      now={now}
                      session={session}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed bg-background p-10 text-center">
            <CalendarDays className="mx-auto size-10 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">No matching classes</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different search term or check again after your faculty
              schedules a session.
            </p>
          </div>
        )}
      </section>

      <section className="academy-card p-5 md:p-6">
        <ClassRecordings recordings={recordings} />
      </section>

      <ClassDetailSheet
        now={now}
        session={selectedSession}
        onOpenChange={(open) => {
          if (!open) setSelectedSession(null);
        }}
      />
    </div>
  );
}

function ReadOnlyClassCalendar({
  monthAnchor,
  sessions,
  onMonthChange,
  onSelectSession,
}: {
  monthAnchor: Date;
  sessions: FacultyClassSession[];
  onMonthChange: (date: Date) => void;
  onSelectSession: (session: FacultyClassSession) => void;
}) {
  const monthDays = useMemo(() => getMonthDays(monthAnchor), [monthAnchor]);
  const sessionsByDate = useMemo(() => groupSessionsByDate(sessions), [sessions]);
  const monthTitle = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(monthAnchor);

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border bg-background">
      <div className="flex flex-col gap-3 border-b bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Calendar view
          </p>
          <h3 className="mt-1 text-xl font-semibold">{monthTitle}</h3>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(addMonths(monthAnchor, -1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(addMonths(monthAnchor, 1))}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b text-center text-xs font-semibold text-muted-foreground sm:text-sm">
        {WEEK_DAYS.map((day) => (
          <span key={day} className="border-r py-3 last:border-r-0">
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthDays.map((day, index) =>
          day ? (
            <div
              key={day.key}
              className={[
                "min-h-28 border-b border-r p-2 sm:min-h-32 sm:p-3",
                day.isCurrentMonth ? "bg-background" : "bg-muted/20 text-muted-foreground/60",
                index % 7 === 6 ? "border-r-0" : "",
              ].join(" ")}
            >
              <span className="text-sm font-semibold">{day.date}</span>
              <div className="mt-2 space-y-1">
                {(sessionsByDate.get(day.key) ?? []).slice(0, 3).map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => onSelectSession(session)}
                    className="block w-full truncate rounded-md bg-primary/10 px-2 py-1 text-left text-[11px] font-medium text-primary transition hover:bg-primary/15 sm:text-xs"
                  >
                    {formatTime(session.startsAt)} {session.title}
                  </button>
                ))}
                {(sessionsByDate.get(day.key)?.length ?? 0) > 3 ? (
                  <span className="block text-[11px] text-muted-foreground">
                    +{(sessionsByDate.get(day.key)?.length ?? 0) - 3} more
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <span key={`blank-${index}`} className="min-h-28 border-b border-r" />
          ),
        )}
      </div>

      {sessions.length ? (
        <div className="border-t bg-muted/20 p-3 text-xs text-muted-foreground">
          Click any class in the calendar to view details. Upcoming and live
          classes can be opened from the classroom button.
        </div>
      ) : null}
    </div>
  );
}

function ClassDetailSheet({
  now,
  session,
  onOpenChange,
}: {
  now: number;
  session: FacultyClassSession | null;
  onOpenChange: (open: boolean) => void;
}) {
  const facultyName = session?.faculty
    ? [session.faculty.firstName, session.faculty.lastName]
        .filter(Boolean)
        .join(" ")
    : "";
  const isCompleted = session ? isCompletedSession(session, now) : false;
  const canJoin = session ? isJoinableSession(session, now) : false;
  const attended = Boolean(session?.attendance?.attended);

  return (
    <Sheet open={Boolean(session)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="border-b p-6">
          <SheetTitle>Class details</SheetTitle>
        </SheetHeader>
        {session ? (
          <div className="space-y-5 p-6">
            <div>
              <Badge
                variant={
                  isCompleted
                    ? attended
                      ? "default"
                      : "destructive"
                    : "secondary"
                }
              >
                {isCompleted ? (attended ? "Attended" : "Absent") : session.status}
              </Badge>
              <h2 className="mt-3 text-2xl font-semibold">{session.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {session.course.title} · {session.batch.name}
              </p>
            </div>
            <div className="grid gap-3 rounded-2xl border bg-muted/20 p-4 text-sm">
              <InfoRow icon={Clock} text={formatDateTime(session.startsAt)} />
              <InfoRow icon={CalendarDays} text={formatDateTime(session.endsAt)} />
              {facultyName ? (
                <InfoRow icon={UserRound} text={`Faculty: ${facultyName}`} />
              ) : null}
              {attended && session.attendance?.joinedAt ? (
                <InfoRow
                  icon={Video}
                  text={`Joined ${formatDateTime(session.attendance.joinedAt)}`}
                />
              ) : null}
              {session.location ? (
                <InfoRow icon={MapPin} text={session.location} />
              ) : null}
            </div>
            {session.description ? (
              <p className="rounded-2xl border bg-background p-4 text-sm leading-6 text-muted-foreground">
                {session.description}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={`/course/${session.course.slug}`}>Open course</Link>
              </Button>
              <OpenClassroomButton
                disabled={!canJoin}
                disabledLabel={isCompleted ? "Class ended" : undefined}
                sessionId={session.id}
              />
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function ClassCard({
  now,
  session,
}: {
  now: number;
  session: FacultyClassSession;
}) {
  const facultyName = session.faculty
    ? [session.faculty.firstName, session.faculty.lastName]
        .filter(Boolean)
        .join(" ")
    : "";
  const isCompleted = isCompletedSession(session, now);
  const canJoin = isJoinableSession(session, now);
  const attended = Boolean(session.attendance?.attended);

  return (
    <article className="rounded-2xl border bg-background p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                isCompleted
                  ? attended
                    ? "default"
                    : "destructive"
                  : "outline"
              }
            >
              {isCompleted ? (attended ? "Attended" : "Absent") : session.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatTime(session.startsAt)} - {formatTime(session.endsAt)}
            </span>
          </div>
          <h3 className="mt-3 text-base font-semibold">{session.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {session.course.title} · {session.batch.name}
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {facultyName ? <span>Faculty: {facultyName}</span> : null}
            {attended && session.attendance?.joinedAt ? (
              <span>Joined: {formatDateTime(session.attendance.joinedAt)}</span>
            ) : null}
            {session.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {session.location}
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href={`/course/${session.course.slug}`}>Course</Link>
          </Button>
          <OpenClassroomButton
            disabled={!canJoin}
            disabledLabel={isCompleted ? "Class ended" : undefined}
            sessionId={session.id}
            size="sm"
          />
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  text,
}: {
  icon: typeof Clock;
  text: string;
}) {
  return (
    <p className="flex items-center gap-2">
      <Icon className="size-4 text-primary" />
      <span>{text}</span>
    </p>
  );
}

function groupSessionsByDate(sessions: FacultyClassSession[]) {
  return sessions.reduce((map, session) => {
    const key = getDateKey(session.startsAt);
    const items = map.get(key) ?? [];
    items.push(session);
    map.set(key, items);
    return map;
  }, new Map<string, FacultyClassSession[]>());
}

function isCompletedSession(session: FacultyClassSession, now: number) {
  const status = session.status?.toLowerCase();
  return (
    status === "completed" ||
    status === "cancelled" ||
    new Date(session.endsAt).getTime() <= now
  );
}

function isJoinableSession(session: FacultyClassSession, now: number) {
  const status = session.status?.toLowerCase();
  const endsAt = new Date(session.endsAt).getTime();

  return (
    Number.isFinite(endsAt) &&
    endsAt >= now &&
    status !== "completed" &&
    status !== "cancelled"
  );
}

function getMonthDays(monthAnchor: Date) {
  const firstDay = startOfMonth(monthAnchor);
  const startOffset = firstDay.getDay();
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = getDateKey(date);

    return {
      key,
      date: date.getDate(),
      isCurrentMonth: date.getMonth() === monthAnchor.getMonth(),
    };
  });
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function addMonths(value: Date, amount: number) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}
