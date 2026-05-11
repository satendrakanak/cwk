"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock3,
  Download,
  Eye,
  EyeOff,
  ExternalLink,
  Info,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  Users,
  Video,
} from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/lib/error-handler";
import { downloadRemoteFile } from "@/lib/download-file";
import { facultyWorkspaceClient } from "@/services/faculty/faculty-workspace.client";
import type {
  FacultyClassRecording,
  FacultyClassSession,
} from "@/types/faculty-workspace";
import { formatDateTime } from "@/utils/formate-date";

type FacultyRecordingsPageProps = {
  recordings: FacultyClassRecording[];
  sessions?: FacultyClassSession[];
  title?: string;
  description?: string;
  calendarHref?: string;
};

export function FacultyRecordingsPage({
  recordings,
  sessions = [],
  title = "Class Recordings",
  description = "Review past BBB classes, sync processed recordings, and download archived copies.",
  calendarHref = "/faculty/calendar",
}: FacultyRecordingsPageProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [syncingSessionId, setSyncingSessionId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [selectedRecording, setSelectedRecording] =
    useState<FacultyClassRecording | null>(null);
  const [recordingToDelete, setRecordingToDelete] =
    useState<FacultyClassRecording | null>(null);
  const [updatingAccessId, setUpdatingAccessId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [accessOverrides, setAccessOverrides] = useState<Record<number, boolean>>(
    {},
  );

  const syncableSessions = useMemo(() => {
    const recordedSessionIds = new Set(
      recordings
        .map((recording) => recording.session?.id)
        .filter((id): id is number => Boolean(id)),
    );

    return sessions.filter((session) => {
      return (
        session.hasBbbMeeting &&
        session.bbbRecord !== false &&
        (session.status === "completed" || new Date(session.endsAt) <= new Date()) &&
        !recordedSessionIds.has(session.id)
      );
    });
  }, [recordings, sessions]);

  const filteredRecordings = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return recordings.filter((recording) => {
      const matchesStatus = status === "all" || recording.status === status;
      const haystack = [
        recording.name,
        recording.session?.title,
        recording.course?.title,
        recording.batch?.name,
        recording.faculty
          ? [recording.faculty.firstName, recording.faculty.lastName]
              .filter(Boolean)
              .join(" ")
          : "",
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [query, recordings, status]);

  async function handleSync(sessionId?: number | null) {
    if (!sessionId) return;

    try {
      setSyncingSessionId(sessionId);
      await facultyWorkspaceClient.syncSessionRecordings(sessionId);
      toast.success("Recordings synced");
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setSyncingSessionId(null);
    }
  }

  async function handleDownload(recording: FacultyClassRecording) {
    if (!recording.file?.path) return;

    try {
      setDownloadingId(recording.id);
      await downloadRemoteFile(
        recording.file.path,
        getRecordingFileName(recording),
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleSetRecordingAccess(
    recording: FacultyClassRecording,
    allowed: boolean,
  ) {
    if (!recording.session?.id) return;

    try {
      setUpdatingAccessId(recording.id);
      await facultyWorkspaceClient.updateSession(recording.session.id, {
        allowRecordingAccess: allowed,
      });
      setAccessOverrides((current) => ({
        ...current,
        [recording.id]: allowed,
      }));
      setSelectedRecording((current) =>
        current?.id === recording.id
          ? {
              ...current,
              session: current.session
                ? { ...current.session, allowRecordingAccess: allowed }
                : current.session,
              access: current.access
                ? { ...current.access, learnerAccessAllowed: allowed }
                : current.access,
            }
          : current,
      );
      toast.success(
        allowed
          ? "Learner recording access enabled"
          : "Learner recording access disabled",
      );
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingAccessId(null);
    }
  }

  async function handleDeleteRecording() {
    if (!recordingToDelete) return;

    try {
      setDeletingId(recordingToDelete.id);
      await facultyWorkspaceClient.deleteRecording(recordingToDelete.id);
      toast.success("Recording deleted");
      if (selectedRecording?.id === recordingToDelete.id) {
        setSelectedRecording(null);
      }
      setRecordingToDelete(null);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-col gap-5 border-b bg-muted/20 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              BBB archive
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={calendarHref}>
              <CalendarDays className="size-4" />
              Open calendar
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 border-b p-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Search by class, course, batch, or faculty"
            />
          </div>
          <NativeSelect
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <NativeSelectOption value="all">All status</NativeSelectOption>
            <NativeSelectOption value="archived">Archived</NativeSelectOption>
            <NativeSelectOption value="available">Available</NativeSelectOption>
            <NativeSelectOption value="processing">Processing</NativeSelectOption>
            <NativeSelectOption value="failed">Failed</NativeSelectOption>
          </NativeSelect>
        </div>

        <div className="divide-y">
          {filteredRecordings.length ? (
            filteredRecordings.map((recording) => {
              const sessionId = recording.session?.id;
              const facultyName = recording.faculty
                ? [recording.faculty.firstName, recording.faculty.lastName]
                    .filter(Boolean)
                    .join(" ") || recording.faculty.email
                : "Faculty";

              return (
                <article
                  key={recording.id}
                  className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.7fr)_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Video className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold">
                          {recording.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {recording.course?.title ?? "Course"} ·{" "}
                          {recording.batch?.name ?? "Batch"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge label={recording.status} />
                      <span>{recording.format}</span>
                      <span>{formatDuration(recording.durationSeconds)}</span>
                      {recording.participants ? (
                        <span>{recording.participants} participants</span>
                      ) : null}
                    </div>
                    {recording.archiveError ? (
                      <p className="mt-2 text-sm text-destructive">
                        {recording.archiveError}
                      </p>
                    ) : null}
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">
                      {recording.session?.title ?? "Class session"}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {recording.session?.startsAt
                        ? formatDateTime(recording.session.startsAt)
                        : "Date unavailable"}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Faculty: {facultyName}
                    </p>
                  </div>

                  <div className="flex items-start xl:justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <MoreHorizontal className="size-4" />
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onSelect={() => setSelectedRecording(recording)}
                        >
                          <Info className="size-4" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={!sessionId || syncingSessionId === sessionId}
                          onSelect={() => {
                            if (sessionId) void handleSync(sessionId);
                          }}
                        >
                          <RefreshCw
                            className={[
                              "size-4",
                              syncingSessionId === sessionId ? "animate-spin" : "",
                            ].join(" ")}
                          />
                          Sync
                        </DropdownMenuItem>
                        {recording.file?.path ? (
                          <DropdownMenuItem
                            disabled={downloadingId === recording.id}
                            onSelect={() => void handleDownload(recording)}
                          >
                            <Download className="size-4" />
                            {downloadingId === recording.id
                              ? "Downloading"
                              : "Download"}
                          </DropdownMenuItem>
                        ) : null}
                        {recording.playbackUrl ? (
                          <DropdownMenuItem asChild>
                            <a
                              href={recording.playbackUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ExternalLink className="size-4" />
                              Review
                            </a>
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={deletingId === recording.id}
                          onSelect={() => setRecordingToDelete(recording)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="p-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Video className="size-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">No recordings yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Complete a BBB class, then sync recordings from the calendar or this
                archive page.
              </p>
            </div>
          )}
        </div>
      </section>

      <RecordingDetailsDialog
        accessOverride={
          selectedRecording
            ? accessOverrides[selectedRecording.id]
            : undefined
        }
        isUpdatingAccess={
          selectedRecording
            ? updatingAccessId === selectedRecording.id
            : false
        }
        recording={selectedRecording}
        onOpenChange={(open) => {
          if (!open) setSelectedRecording(null);
        }}
        onToggleAccess={handleSetRecordingAccess}
        onDelete={(recording) => {
          setSelectedRecording(null);
          setRecordingToDelete(recording);
        }}
      />

      <ConfirmDeleteDialog
        deleteText="recording"
        open={Boolean(recordingToDelete)}
        onClose={() => {
          if (!deletingId) setRecordingToDelete(null);
        }}
        onConfirm={handleDeleteRecording}
        loading={Boolean(deletingId)}
      />

      {syncableSessions.length ? (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="border-b bg-muted/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Ready to sync
            </p>
            <h2 className="mt-2 text-lg font-semibold">
              Completed classes waiting for BBB processing
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              BBB recordings usually appear after processing. Sync these classes
              once BBB has finished preparing the playback.
            </p>
          </div>
          <div className="divide-y">
            {syncableSessions.map((session) => (
              <article
                key={session.id}
                className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Clock3 className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{session.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {session.course.title} · {session.batch.name}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Ended on {formatDateTime(session.endsAt)}
                  </p>
                </div>
                <div className="flex items-center md:justify-end">
                  <Button
                    type="button"
                    disabled={syncingSessionId === session.id}
                    onClick={() => handleSync(session.id)}
                  >
                    <RefreshCw
                      className={[
                        "size-4",
                        syncingSessionId === session.id ? "animate-spin" : "",
                      ].join(" ")}
                    />
                    {syncingSessionId === session.id ? "Syncing" : "Sync recording"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function RecordingDetailsDialog({
  accessOverride,
  isUpdatingAccess,
  recording,
  onOpenChange,
  onToggleAccess,
  onDelete,
}: {
  accessOverride?: boolean;
  isUpdatingAccess: boolean;
  recording: FacultyClassRecording | null;
  onOpenChange: (open: boolean) => void;
  onToggleAccess: (recording: FacultyClassRecording, allowed: boolean) => void;
  onDelete: (recording: FacultyClassRecording) => void;
}) {
  if (!recording) {
    return <Dialog open={false} onOpenChange={onOpenChange} />;
  }

  const accessAllowed =
    accessOverride ?? recording.access?.learnerAccessAllowed ?? false;
  const readyForLearners = recording.access?.readyForLearners ?? false;
  const attendeeCount =
    recording.access?.attendeeCount ?? recording.attendees?.length ?? 0;
  const bbbParticipantCount = Number(recording.participants ?? 0);
  const hasUntrackedBbbParticipants = bbbParticipantCount > attendeeCount;
  const learnerVisible =
    accessAllowed && readyForLearners && attendeeCount > 0;
  const reasons = getLearnerVisibilityReasons(recording, accessAllowed);
  const facultyName = recording.faculty
    ? [recording.faculty.firstName, recording.faculty.lastName]
        .filter(Boolean)
        .join(" ") || recording.faculty.email
    : "Faculty";

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Recording details</DialogTitle>
          <DialogDescription>
            Check class timing, learner visibility, and assigned batch access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-muted/20 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{recording.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {recording.course?.title ?? "Course"} ·{" "}
                  {recording.batch?.name ?? "Batch"}
                </p>
              </div>
              <Badge label={recording.status} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailStat
                label="Class start"
                value={
                  recording.session?.startsAt
                    ? formatDateTime(recording.session.startsAt)
                    : "Not available"
                }
              />
              <DetailStat
                label="Class end"
                value={
                  recording.session?.endsAt
                    ? formatDateTime(recording.session.endsAt)
                    : "Not available"
                }
              />
              <DetailStat
                label="Duration"
                value={formatDuration(recording.durationSeconds)}
              />
              <DetailStat
                label="Total BBB participants"
                value={`${bbbParticipantCount} total`}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
            <section className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Learner visibility</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Control whether app-tracked learners who attended this class
                    can see this recording in their dashboard.
                  </p>
                </div>
                <Switch
                  checked={accessAllowed}
                  disabled={!recording.session?.id || isUpdatingAccess}
                  onCheckedChange={(checked) =>
                    onToggleAccess(recording, Boolean(checked))
                  }
                />
              </div>

              <div
                className={[
                  "mt-4 rounded-xl border p-4",
                  learnerVisible
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-amber-500/30 bg-amber-500/10",
                ].join(" ")}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {learnerVisible ? (
                    <Eye className="size-4 text-emerald-600" />
                  ) : (
                    <EyeOff className="size-4 text-amber-600" />
                  )}
                  {learnerVisible
                    ? "Visible to learners"
                    : "Not visible to learners"}
                </div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {reasons.length ? (
                    reasons.map((reason) => <p key={reason}>{reason}</p>)
                  ) : (
                    <p>
                      Learners who attended this class can now view this
                      recording.
                    </p>
                  )}
                  {hasUntrackedBbbParticipants ? (
                    <p>
                      BBB reported {bbbParticipantCount} total participant
                      {bbbParticipantCount === 1 ? "" : "s"}, but learner names
                      are available only when they join through the app classroom.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border p-4">
              <p className="text-sm font-semibold">Class summary</p>
              <div className="mt-3 space-y-3 text-sm">
                <SummaryRow label="Faculty" value={facultyName} />
                <SummaryRow
                  label="Synced"
                  value={
                    recording.syncedAt
                      ? formatDateTime(recording.syncedAt)
                      : "Not synced"
                  }
                />
                <SummaryRow
                  label="Recorded"
                  value={
                    recording.recordedAt
                      ? formatDateTime(recording.recordedAt)
                      : "Not available"
                  }
                />
                <SummaryRow label="Format" value={recording.format} />
              </div>
            </section>
          </div>

          <section className="rounded-2xl border">
            <div className="flex items-center justify-between gap-3 border-b p-4">
              <div>
                <p className="text-sm font-semibold">
                  App-tracked learner attendance
                </p>
                <p className="text-sm text-muted-foreground">
                  {attendeeCount} learner{attendeeCount === 1 ? "" : "s"} joined
                  this class through the app.
                </p>
              </div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-5" />
              </span>
            </div>

            {recording.attendees?.length ? (
              <div className="max-h-72 divide-y overflow-y-auto">
                {recording.attendees.map((learner) => (
                  <div
                    key={learner.id}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {[learner.firstName, learner.lastName]
                          .filter(Boolean)
                          .join(" ") || learner.email}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {learner.email}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Joined {formatDateTime(learner.joinedAt)}
                      </p>
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
                        learnerVisible
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {learnerVisible ? "Can view" : "Waiting"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 p-6 text-sm text-muted-foreground">
                <p>
                  No learner attendance has been recorded through the app yet.
                  Attendance is captured when a learner joins through the
                  classroom page.
                </p>
                {bbbParticipantCount ? (
                  <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-200">
                    BBB only exposes the recording participant count here (
                    {bbbParticipantCount} total, including faculty/moderators).
                    It does not give us learner identity from the recording API,
                    so names cannot be reconstructed for direct BBB joins.
                  </p>
                ) : null}
              </div>
            )}
          </section>

          <div className="flex flex-col gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-destructive">
                Delete recording
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Remove this recording and its archived file if it is no longer
                needed.
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(recording)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function getLearnerVisibilityReasons(
  recording: FacultyClassRecording,
  accessAllowed: boolean,
) {
  const reasons = recording.access?.reasons ?? [];

  return [
    accessAllowed
      ? null
      : "Learner recording access is turned off for this class.",
    ...reasons.filter(
      (reason) =>
        reason !== "Learner recording access is turned off for this class." &&
        reason !== "Class end time has not passed yet.",
    ),
  ].filter((reason): reason is string => Boolean(reason));
}

function getRecordingFileName(recording: FacultyClassRecording) {
  const extension = recording.file?.name?.split(".").pop() || "mp4";
  const baseName = [
    recording.session?.title || recording.name || "class-recording",
    recording.course?.title,
  ]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${baseName || "class-recording"}.${extension}`;
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 font-medium capitalize text-foreground">
      {label}
    </span>
  );
}

function formatDuration(seconds?: number | null) {
  if (!seconds) return "Duration unavailable";

  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) return `${minutes} min`;

  return remainingMinutes ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}
