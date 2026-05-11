"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  Pencil,
  Layers,
  Search,
  Trash2,
  Users,
  Video,
} from "lucide-react";

import { OpenClassroomButton } from "@/components/classroom/open-classroom-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { getErrorMessage } from "@/lib/error-handler";
import { facultyWorkspaceClient } from "@/services/faculty/faculty-workspace.client";
import type {
  FacultyClassSession,
  FacultyCourseBatch,
} from "@/types/faculty-workspace";
import { formatDateTime, getDateKey } from "@/utils/formate-date";
import { SessionSheet } from "./faculty-calendar-page";

type FacultyClassesPageProps = {
  batches: FacultyCourseBatch[];
  nowIso: string;
  sessions: FacultyClassSession[];
  todayKey: string;
};

type ClassBucket = "live" | "upcoming" | "past";

const buckets: Array<{ key: ClassBucket; label: string; empty: string }> = [
  {
    key: "live",
    label: "Live now",
    empty: "No class is live right now.",
  },
  {
    key: "upcoming",
    label: "Upcoming classes",
    empty: "No upcoming class sessions found.",
  },
  {
    key: "past",
    label: "Recent and completed",
    empty: "Completed classes will appear here.",
  },
];

export function FacultyClassesPage({
  batches,
  nowIso,
  sessions,
  todayKey,
}: FacultyClassesPageProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentQuery, setRecentQuery] = useState("");
  const [deleteItem, setDeleteItem] = useState<FacultyClassSession | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<FacultyClassSession | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);
  const now = new Date(nowIso).getTime();

  const filteredSessions = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return sessions.filter((session) => {
      if (!needle) return true;

      return [
        session.title,
        session.course.title,
        session.batch.name,
        session.status,
        session.faculty
          ? [session.faculty.firstName, session.faculty.lastName]
              .filter(Boolean)
              .join(" ")
          : "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [query, sessions]);

  const grouped = useMemo(() => {
    return filteredSessions.reduce<Record<ClassBucket, FacultyClassSession[]>>(
      (acc, session) => {
        acc[getClassBucket(session, now)].push(session);
        return acc;
      },
      { live: [], upcoming: [], past: [] },
    );
  }, [filteredSessions, now]);

  const visibleGrouped = useMemo(() => {
    const needle = recentQuery.trim().toLowerCase();

    if (!needle) return grouped;

    return {
      ...grouped,
      past: grouped.past.filter((session) =>
        [
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
          .toLowerCase()
          .includes(needle),
      ),
    };
  }, [grouped, recentQuery]);

  const todayClasses = sessions.filter(
    (session) => getDateKey(session.startsAt) === todayKey,
  ).length;

  async function deleteSession() {
    if (!deleteItem) return;

    try {
      setDeleting(true);
      await facultyWorkspaceClient.deleteSession(deleteItem.id);
      toast.success("Class deleted");
      setDeleteItem(null);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Live Classes
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Class sessions
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage every scheduled class from a clean list view. Use calendar
              for planning, and this page for daily operations.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/faculty/calendar">Open calendar</Link>
            </Button>
            <Button
              type="button"
              onClick={() => {
                setSelectedDate(todayKey);
                setSelectedSession(null);
                setSheetOpen(true);
              }}
            >
              <CalendarDays className="mr-2 size-4" />
              Add class
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard icon={Video} label="Live now" value={grouped.live.length} />
          <StatCard
            icon={CalendarDays}
            label="Today"
            value={todayClasses}
          />
          <StatCard
            icon={Layers}
            label="Scheduled"
            value={sessions.length}
          />
        </div>
      </section>

      <section className="rounded-3xl border bg-card p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by class, course, batch, faculty..."
            className="pl-9"
          />
        </div>
      </section>

      {buckets.map((bucket) => (
        <section key={bucket.key} className="rounded-3xl border bg-card shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">{bucket.label}</h2>
              <p className="text-sm text-muted-foreground">
                {visibleGrouped[bucket.key].length} class
                {visibleGrouped[bucket.key].length === 1 ? "" : "es"}
              </p>
            </div>
            {bucket.key === "past" ? (
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={recentQuery}
                  onChange={(event) => setRecentQuery(event.target.value)}
                  placeholder="Search recent classes..."
                  className="pl-9"
                />
              </div>
            ) : null}
          </div>

          {visibleGrouped[bucket.key].length ? (
            <div className="divide-y">
              {visibleGrouped[bucket.key].map((session) => (
                <ClassRow
                  key={session.id}
                  now={now}
                  session={session}
                  onDelete={() => setDeleteItem(session)}
                  onEdit={() => {
                    setSelectedDate(getDateKey(session.startsAt));
                    setSelectedSession(session);
                    setSheetOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {bucket.empty}
            </div>
          )}
        </section>
      ))}

      <ConfirmDeleteDialog
        deleteText={deleteItem?.title || "class"}
        loading={deleting}
        open={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={deleteSession}
      />
      <SessionSheet
        batches={batches}
        initialBatchId={selectedSession?.batch.id}
        nowIso={nowIso}
        open={sheetOpen}
        selectedDate={selectedDate}
        session={selectedSession}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setSelectedSession(null);
          }
        }}
      />
    </div>
  );
}

function ClassRow({
  now,
  onDelete,
  onEdit,
  session,
}: {
  now: number;
  onDelete: () => void;
  onEdit: () => void;
  session: FacultyClassSession;
}) {
  const facultyName = session.faculty
    ? [session.faculty.firstName, session.faculty.lastName]
        .filter(Boolean)
        .join(" ")
    : "";

  const bucket = getClassBucket(session, now);
  const canStart = bucket !== "past" && session.status !== "cancelled";
  const statusLabel =
    session.bbbIsRunning
      ? "Live running"
      : bucket === "past"
      ? "Completed"
      : session.status === "completed"
        ? "Ready to restart"
        : session.status;

  return (
    <article className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={session.bbbIsRunning ? "default" : "secondary"}>
            {statusLabel}
          </Badge>
          {session.bbbIsRunning ? (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">
              {session.bbbParticipantCount ?? 0} online
            </span>
          ) : null}
          <span className="text-xs font-medium text-muted-foreground">
            {session.course.title}
          </span>
        </div>

        <h3 className="mt-2 truncate text-base font-semibold">
          {session.title}
        </h3>

        <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
          <span className="flex items-center gap-2">
            <Clock className="size-4" />
            {formatDateTime(session.startsAt)}
          </span>
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            Ends {formatDateTime(session.endsAt)}
          </span>
          <span className="flex items-center gap-2">
            <Users className="size-4" />
            {session.batch.name}
          </span>
          {facultyName ? <span>Faculty: {facultyName}</span> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 xl:justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="mr-2 size-4" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDelete}
        >
          <Trash2 className="mr-2 size-4" />
          Delete
        </Button>
        {canStart ? (
          <OpenClassroomButton
            label={session.bbbIsRunning ? "Open classroom" : "Start classroom"}
            role="faculty"
            sessionId={session.id}
            size="sm"
          />
        ) : null}
      </div>
    </article>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Video;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function getClassBucket(
  session: FacultyClassSession,
  now: number,
): ClassBucket {
  const startsAt = new Date(session.startsAt).getTime();
  const endsAt = new Date(session.endsAt).getTime();

  if (startsAt <= now && endsAt >= now) {
    return "live";
  }

  if (startsAt > now) {
    return "upcoming";
  }

  return "past";
}
