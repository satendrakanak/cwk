"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  FileText,
  LinkIcon,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/error-handler";
import { assignmentClientService } from "@/services/assignments/assignment.client";
import type { Assignment, AssignmentSubmissionStatus } from "@/types/assignment";
import { formatDateTime } from "@/utils/formate-date";

type AssignmentsViewProps = {
  assignments: Assignment[];
  currentTime: number;
};

const statusLabel: Record<AssignmentSubmissionStatus, string> = {
  submitted: "Submitted",
  in_review: "In review",
  needs_changes: "Needs changes",
  graded: "Graded",
};

export function AssignmentsView({ assignments, currentTime }: AssignmentsViewProps) {
  const stats = useMemo(() => {
    const submitted = assignments.filter(
      (assignment) => assignment.submissions?.[0],
    ).length;
    const graded = assignments.filter(
      (assignment) => assignment.submissions?.[0]?.status === "graded",
    ).length;
    const dueSoon = assignments.filter((assignment) => {
      if (!assignment.dueAt || assignment.submissions?.[0]?.status === "graded") {
        return false;
      }
      const diff = new Date(assignment.dueAt).getTime() - currentTime;
      return diff > 0 && diff <= 1000 * 60 * 60 * 24 * 3;
    }).length;

    return { submitted, graded, dueSoon };
  }, [assignments, currentTime]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border bg-card p-5 text-center shadow-sm md:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Practice & projects
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Assignments
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Submit course work, track feedback, and improve your projects after
          review.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat icon={FileText} label="Available" value={assignments.length} />
        <Stat icon={RotateCcw} label="Due soon" value={stats.dueSoon} />
        <Stat icon={CheckCircle2} label="Graded" value={stats.graded} />
      </section>

      <section className="space-y-4">
        {assignments.length ? (
          assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              currentTime={currentTime}
            />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
            No assignments are published for your enrolled courses yet.
          </div>
        )}
      </section>
    </div>
  );
}

function AssignmentCard({
  assignment,
  currentTime,
}: {
  assignment: Assignment;
  currentTime: number;
}) {
  const router = useRouter();
  const submission = assignment.submissions?.[0];
  const [text, setText] = useState(submission?.text ?? "");
  const [link, setLink] = useState(submission?.link ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const isPastDue =
    assignment.dueAt && new Date(assignment.dueAt).getTime() < currentTime;
  const canSubmit =
    !isPastDue &&
    (!submission || assignment.allowResubmission || submission.status === "needs_changes");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await assignmentClientService.submit(assignment.id, {
        text,
        link: link || undefined,
      });
      toast.success("Assignment submitted");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{assignment.title}</h2>
            {submission ? (
              <Badge>{statusLabel[submission.status]}</Badge>
            ) : (
              <Badge variant="outline">Pending</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {assignment.course.title}
            {assignment.dueAt ? ` - Due ${formatDateTime(assignment.dueAt)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Clock3 className="size-4" />
          {assignment.points ?? 0} pts
        </div>
      </div>

      {assignment.instructions ? (
        <p className="mt-4 whitespace-pre-line rounded-2xl bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
          {assignment.instructions}
        </p>
      ) : null}

      {submission?.feedback ? (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <p className="font-semibold text-primary">Reviewer feedback</p>
          <p className="mt-2 whitespace-pre-line text-muted-foreground">
            {submission.feedback}
          </p>
          {submission.score !== null && submission.score !== undefined ? (
            <p className="mt-2 font-semibold">Score: {submission.score}</p>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-5 space-y-3">
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          placeholder="Write your answer, notes, or project explanation."
          disabled={!canSubmit}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://your-work-link.com"
              className="pl-9"
              disabled={!canSubmit}
            />
          </div>
          <Button type="submit" disabled={!canSubmit || isSaving}>
            {submission ? "Update submission" : "Submit assignment"}
          </Button>
        </div>
        {isPastDue ? (
          <p className="text-xs text-destructive">
            The deadline has passed. Ask your faculty if you need another
            submission window.
          </p>
        ) : null}
      </form>
    </article>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border bg-card p-5 text-center shadow-sm md:text-left">
      <Icon className="mx-auto size-5 text-primary md:mx-0" />
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
