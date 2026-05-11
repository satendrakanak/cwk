"use client";

import { CalendarDays, Clock, MapPin } from "lucide-react";
import Link from "next/link";

import { OpenClassroomButton } from "@/components/classroom/open-classroom-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FacultyClassSession } from "@/types/faculty-workspace";
import { formatDateTime } from "@/utils/formate-date";

type UpcomingClassesProps = {
  sessions: FacultyClassSession[];
  limit?: number;
  showViewAll?: boolean;
};

export function UpcomingClasses({
  sessions,
  limit,
  showViewAll = true,
}: UpcomingClassesProps) {
  const visibleSessions = sessions
    .filter((classSession) => {
      const status = classSession.status?.toLowerCase();
      return status !== "completed" && status !== "cancelled";
    })
    .slice(0, limit ?? sessions.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Live Classes
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-card-foreground">
            Upcoming & live classes
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {visibleSessions.length ? (
            <Badge variant="secondary">{visibleSessions.length} upcoming</Badge>
          ) : null}
          {showViewAll ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/classes">View calendar</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {visibleSessions.length ? (
        <div className="space-y-3">
          {visibleSessions.map((session) => (
            <div
              key={session.id}
              className="grid gap-4 rounded-2xl border bg-background p-4 lg:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  <h4 className="truncate text-sm font-semibold">
                    {session.title}
                  </h4>
                  <Badge variant="outline">{session.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {session.course.title} - {session.batch.name}
                </p>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <span className="flex items-center gap-2">
                    <Clock className="size-4" />
                    {formatDateTime(session.startsAt)} to{" "}
                    {formatDateTime(session.endsAt)}
                  </span>
                  {session.location ? (
                    <span className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      {session.location}
                    </span>
                  ) : null}
                  {session.faculty ? (
                    <span>
                      Faculty: {session.faculty.firstName}{" "}
                      {session.faculty.lastName ?? ""}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/course/${session.course.slug}`}>Course</Link>
                </Button>
                <OpenClassroomButton sessionId={session.id} size="sm" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed bg-background p-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarDays className="size-6" />
          </div>
          <p className="text-sm font-semibold">No upcoming classes yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Faculty-led class schedules will appear here when your batch is
            scheduled.
          </p>
        </div>
      )}
    </div>
  );
}
