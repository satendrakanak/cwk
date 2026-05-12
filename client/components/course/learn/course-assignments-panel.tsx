"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, LinkIcon, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error-handler";
import { assignmentClientService } from "@/services/assignments/assignment.client";
import type { Assignment, AssignmentSubmissionStatus } from "@/types/assignment";
import { formatDateTime } from "@/utils/formate-date";

type CourseAssignmentsPanelProps = {
  assignments: Assignment[];
  currentTime: number;
  compact?: boolean;
};

const statusLabel: Record<AssignmentSubmissionStatus, string> = {
  submitted: "Submitted",
  in_review: "In review",
  needs_changes: "Needs changes",
  graded: "Graded",
};

export function CourseAssignmentsPanel({
  assignments,
  currentTime,
  compact,
}: CourseAssignmentsPanelProps) {
  const submitted = assignments.filter((item) => item.submissions?.[0]).length;
  const graded = assignments.filter(
    (item) => item.submissions?.[0]?.status === "graded",
  ).length;
  const pending = assignments.length - graded;

  return (
    <section className={compact ? "space-y-4" : "space-y-5"}>
      <div className="flex flex-col gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Course assignments
          </p>
          <h3 className="mt-2 text-xl font-semibold text-card-foreground">
            Submit coursework before your final exam
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            These assignments belong to this course only. Submit text, links, or
            project notes here and track faculty feedback from the same screen.
          </p>
        </div>

        {assignments.length ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Total" value={assignments.length} />
            <MiniStat label="Pending" value={pending} />
            <MiniStat label="Submitted" value={submitted} />
          </div>
        ) : null}
      </div>

      {assignments.length ? (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <CourseAssignmentCard
              key={assignment.id}
              assignment={assignment}
              currentTime={currentTime}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed bg-muted/30 p-8 text-center">
          <CheckCircle2 className="mx-auto mb-3 size-8 text-primary" />
          <p className="font-semibold text-card-foreground">
            No assignments published yet
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            If faculty publishes coursework for this course, it will appear here
            before the final exam step.
          </p>
        </div>
      )}
    </section>
  );
}

function CourseAssignmentCard({
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
    (!submission ||
      assignment.allowResubmission ||
      submission.status === "needs_changes");

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
    <article className="rounded-3xl border bg-card p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-lg font-semibold text-card-foreground">
              {assignment.title}
            </h4>
            <Badge variant={submission ? "default" : "outline"}>
              {submission ? statusLabel[submission.status] : "Pending"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {assignment.dueAt ? `Due ${formatDateTime(assignment.dueAt)}` : "No due date"}
          </p>
        </div>

        <div className="inline-flex items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold text-muted-foreground md:justify-start">
          <Clock3 className="size-4 text-primary" />
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
          <p className="font-semibold text-primary">Faculty feedback</p>
          <p className="mt-2 whitespace-pre-line text-muted-foreground">
            {submission.feedback}
          </p>
          {submission.score !== null && submission.score !== undefined ? (
            <p className="mt-2 font-semibold text-card-foreground">
              Score: {submission.score}
            </p>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-5 space-y-3">
        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          placeholder="Write your answer, implementation notes, or project explanation."
          disabled={!canSubmit}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://your-project-link.com"
              className="pl-9"
              disabled={!canSubmit}
            />
          </div>
          <Button type="submit" disabled={!canSubmit || isSaving}>
            {isSaving ? (
              "Saving..."
            ) : submission ? (
              <>
                <RotateCcw className="size-4" />
                Update
              </>
            ) : (
              "Submit"
            )}
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border bg-background px-3 py-2">
      <p className="text-lg font-semibold text-card-foreground">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
