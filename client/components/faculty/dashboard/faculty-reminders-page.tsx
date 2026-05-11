import Link from "next/link";
import { Bell, CalendarPlus, CheckCircle2, Clock, Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FacultyClassSession } from "@/types/faculty-workspace";
import { formatDateTime } from "@/utils/formate-date";

type FacultyRemindersPageProps = {
  sessions: FacultyClassSession[];
};

export function FacultyRemindersPage({ sessions }: FacultyRemindersPageProps) {
  const scheduled = sessions.filter((session) => session.status === "scheduled");
  const totalOffsets = scheduled.reduce(
    (total, session) => total + getReminderOffsets(session).length,
    0,
  );
  const sentOffsets = scheduled.reduce(
    (total, session) => total + (session.sentReminderOffsetsMinutes?.length ?? 0),
    0,
  );
  const pendingOffsets = Math.max(0, totalOffsets - sentOffsets);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Reminders
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Class reminder queue
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Scheduler sends class reminders to teachers and active batch students.
            </p>
          </div>
          <Button asChild>
            <Link href="/faculty/calendar">
              <CalendarPlus className="size-4" />
              Schedule class
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ReminderStat icon={Bell} label="Scheduled classes" value={scheduled.length} />
        <ReminderStat icon={Mail} label="Pending mails" value={pendingOffsets} />
        <ReminderStat icon={CheckCircle2} label="Sent offsets" value={sentOffsets} />
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="size-5 text-primary" />
          <div>
            <h2 className="text-base font-semibold">
              {pendingOffsets} pending reminder mails
            </h2>
            <p className="text-sm text-muted-foreground">
              Cron checks due reminders every minute and queues emails through the mail worker.
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
          A reminder offset is marked sent only after the scheduler queues both
          teacher and student emails. Updating class time or reminder offsets resets
          the sent offsets for that class.
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="size-5 text-primary" />
          <div>
            <h2 className="text-base font-semibold">
              {scheduled.length} scheduled classes
            </h2>
            <p className="text-sm text-muted-foreground">
              Reminder timings configured from each class session.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {scheduled.length ? (
            scheduled.map((session) => {
              const sent = new Set(session.sentReminderOffsetsMinutes ?? []);

              return (
                <div key={session.id} className="rounded-xl border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{session.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {session.course.title} - {session.batch.name}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {getReminderOffsets(session).map((offset) => (
                        <Badge
                          key={offset}
                          variant={sent.has(offset) ? "default" : "outline"}
                        >
                          {formatReminderOffset(offset)}
                          {sent.has(offset) ? " sent" : ""}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-4" />
                    Class starts {formatDateTime(session.startsAt)}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
              No scheduled reminders yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ReminderStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bell;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function getReminderOffsets(session: FacultyClassSession) {
  return session.reminderOffsetsMinutes?.length
    ? session.reminderOffsetsMinutes
    : [session.reminderBeforeMinutes];
}

function formatReminderOffset(minutes: number) {
  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${days} day${days > 1 ? "s" : ""} before`;
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours > 1 ? "s" : ""} before`;
  }

  return `${minutes} min before`;
}
