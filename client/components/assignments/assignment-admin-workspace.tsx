"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileCheck2,
  PenLine,
  Plus,
  RotateCcw,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error-handler";
import { assignmentClientService } from "@/services/assignments/assignment.client";
import type {
  Assignment,
  AssignmentPayload,
  AssignmentStatus,
  AssignmentSubmission,
  AssignmentSubmissionStatus,
  AssignmentSubmissionType,
} from "@/types/assignment";
import type { Course } from "@/types/course";
import type { User } from "@/types/user";
import { formatDateTime } from "@/utils/formate-date";

type AssignmentCourseOption = Pick<Course, "id" | "title">;

type AssignmentAdminWorkspaceProps = {
  mode: "admin" | "faculty";
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  courses: AssignmentCourseOption[];
  faculties: User[];
  currentTime: number;
};

const statusLabel: Record<AssignmentStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const submissionStatusLabel: Record<AssignmentSubmissionStatus, string> = {
  submitted: "Submitted",
  in_review: "In review",
  needs_changes: "Needs changes",
  graded: "Graded",
};

const submissionTypeLabel: Record<AssignmentSubmissionType, string> = {
  text: "Text",
  link: "Link",
  file: "File",
  mixed: "Mixed",
};

export function AssignmentAdminWorkspace({
  mode,
  assignments,
  submissions,
  courses,
  faculties,
  currentTime,
}: AssignmentAdminWorkspaceProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [reviewing, setReviewing] = useState<AssignmentSubmission | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const publishedCount = assignments.filter(
    (assignment) => assignment.status === "published",
  ).length;
  const pendingReviews = submissions.filter(
    (submission) =>
      submission.status === "submitted" || submission.status === "in_review",
  ).length;
  const overdueCount = assignments.filter(
    (assignment) =>
      assignment.dueAt &&
      new Date(assignment.dueAt).getTime() < currentTime &&
      assignment.status === "published",
  ).length;

  const heading =
    mode === "admin" ? "Assignments" : "Faculty assignments";
  const description =
    mode === "admin"
      ? "Create course projects, homework, submission rules, and review learner work from one place."
      : "Publish homework for your courses and review learner submissions.";

  const deleteAssignment = (assignment: Assignment) => {
    startTransition(async () => {
      try {
        await assignmentClientService.delete(assignment.id);
        toast.success("Assignment deleted");
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Learning workbench
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {heading}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Create Assignment
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Stat icon={ClipboardList} label="Total" value={assignments.length} />
        <Stat icon={CheckCircle2} label="Published" value={publishedCount} />
        <Stat icon={FileCheck2} label="Pending reviews" value={pendingReviews} />
        <Stat icon={Clock3} label="Past due" value={overdueCount} />
      </section>

      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 rounded-2xl md:w-[420px]">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-3">
          {assignments.length ? (
            assignments.map((assignment) => (
              <article
                key={assignment.id}
                className="rounded-2xl border bg-card p-4 shadow-sm"
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold">
                        {assignment.title}
                      </h2>
                      <Badge variant="outline">
                        {statusLabel[assignment.status]}
                      </Badge>
                      <Badge variant="secondary">
                        {submissionTypeLabel[assignment.submissionType]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {assignment.course?.title || "No course"}{" "}
                      {assignment.dueAt
                        ? `- Due ${formatDateTime(assignment.dueAt)}`
                        : "- No deadline"}
                    </p>
                    {assignment.description ? (
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {assignment.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <Badge>
                      {assignment.submissions?.length ?? 0} submissions
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => deleteAssignment(assignment)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <EmptyState text="No assignments have been created yet." />
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-3">
          {submissions.length ? (
            submissions.map((submission) => (
              <SubmissionRow
                key={submission.id}
                submission={submission}
                onReview={() => setReviewing(submission)}
              />
            ))
          ) : (
            <EmptyState text="Learner submissions will appear here." />
          )}
        </TabsContent>
      </Tabs>

      <CreateAssignmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        courses={courses}
        faculties={faculties}
        mode={mode}
      />

      <ReviewSubmissionDialog
        submission={reviewing}
        onOpenChange={(open) => {
          if (!open) setReviewing(null);
        }}
      />
    </div>
  );
}

function CreateAssignmentDialog({
  open,
  onOpenChange,
  courses,
  faculties,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: AssignmentCourseOption[];
  faculties: User[];
  mode: "admin" | "faculty";
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<AssignmentPayload>({
    title: "",
    description: "",
    instructions: "",
    courseId: courses[0]?.id ?? 0,
    facultyIds: mode === "faculty" ? faculties.map((faculty) => faculty.id) : [],
    status: "draft",
    submissionType: "mixed",
    dueAt: "",
    points: 100,
    allowResubmission: true,
  });

  const facultyOptions = useMemo(
    () =>
      faculties.map((faculty) => ({
        id: faculty.id,
        label:
          [faculty.firstName, faculty.lastName].filter(Boolean).join(" ") ||
          faculty.email,
      })),
    [faculties],
  );

  const update = <K extends keyof AssignmentPayload>(
    key: K,
    value: AssignmentPayload[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await assignmentClientService.create({
        ...form,
        facultyIds: form.facultyIds?.length ? form.facultyIds : undefined,
        dueAt: form.dueAt || undefined,
        points: form.points ? Number(form.points) : undefined,
      });
      toast.success("Assignment created");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create assignment</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <Input
                value={form.title}
                onChange={(event) => update("title", event.target.value)}
                required
              />
            </Field>
            <Field label="Course">
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={form.courseId}
                onChange={(event) => update("courseId", Number(event.target.value))}
                required
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={form.status}
                onChange={(event) =>
                  update("status", event.target.value as AssignmentStatus)
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
            <Field label="Submission type">
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={form.submissionType}
                onChange={(event) =>
                  update(
                    "submissionType",
                    event.target.value as AssignmentSubmissionType,
                  )
                }
              >
                <option value="mixed">Mixed</option>
                <option value="text">Text</option>
                <option value="link">Link</option>
                <option value="file">File</option>
              </select>
            </Field>
            <Field label="Due date">
              <Input
                type="datetime-local"
                value={form.dueAt}
                onChange={(event) => update("dueAt", event.target.value)}
              />
            </Field>
            <Field label="Points">
              <Input
                type="number"
                min={0}
                value={form.points ?? ""}
                onChange={(event) => update("points", Number(event.target.value))}
              />
            </Field>
          </div>

          {mode === "admin" ? (
            <Field label="Review faculties">
              <div className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2">
                {facultyOptions.map((faculty) => {
                  const checked = form.facultyIds?.includes(faculty.id) ?? false;
                  return (
                    <label
                      key={faculty.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const current = form.facultyIds ?? [];
                          update(
                            "facultyIds",
                            checked
                              ? current.filter((id) => id !== faculty.id)
                              : [...current, faculty.id],
                          );
                        }}
                      />
                      {faculty.label}
                    </label>
                  );
                })}
              </div>
            </Field>
          ) : null}

          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              rows={3}
            />
          </Field>
          <Field label="Instructions">
            <Textarea
              value={form.instructions}
              onChange={(event) => update("instructions", event.target.value)}
              rows={5}
              placeholder="Submission expectations, rubric, references, and evaluation rules."
            />
          </Field>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.allowResubmission}
              onChange={(event) =>
                update("allowResubmission", event.target.checked)
              }
            />
            Allow resubmission after feedback
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !courses.length}>
              {isSaving ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmissionRow({
  submission,
  onReview,
}: {
  submission: AssignmentSubmission;
  onReview: () => void;
}) {
  return (
    <article className="grid gap-4 rounded-2xl border bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold">
            {submission.learner
              ? [submission.learner.firstName, submission.learner.lastName]
                  .filter(Boolean)
                  .join(" ")
              : "Learner"}
          </h2>
          <Badge variant="outline">
            {submissionStatusLabel[submission.status]}
          </Badge>
          {submission.score !== null && submission.score !== undefined ? (
            <Badge>{submission.score} pts</Badge>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {submission.assignment?.title} -{" "}
          {submission.assignment?.course?.title || "Course"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Submitted {formatDateTime(submission.submittedAt)}
        </p>
      </div>
      <Button variant="outline" onClick={onReview}>
        <PenLine className="size-4" />
        Review
      </Button>
    </article>
  );
}

function ReviewSubmissionDialog({
  submission,
  onOpenChange,
}: {
  submission: AssignmentSubmission | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<AssignmentSubmissionStatus>("graded");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const open = Boolean(submission);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!submission) return;
    setIsSaving(true);

    try {
      await assignmentClientService.reviewSubmission(submission.id, {
        status,
        score: score ? Number(score) : undefined,
        feedback,
      });
      toast.success("Submission reviewed");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review submission</DialogTitle>
        </DialogHeader>
        {submission ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="font-semibold">{submission.assignment?.title}</p>
              {submission.text ? (
                <p className="mt-3 whitespace-pre-line text-muted-foreground">
                  {submission.text}
                </p>
              ) : null}
              {submission.link ? (
                <a
                  href={submission.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-primary underline"
                >
                  Open submitted link
                </a>
              ) : null}
              {submission.attachmentIds.length ? (
                <p className="mt-3 text-muted-foreground">
                  {submission.attachmentIds.length} file attachment(s)
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Status">
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as AssignmentSubmissionStatus)
                  }
                >
                  <option value="in_review">In review</option>
                  <option value="needs_changes">Needs changes</option>
                  <option value="graded">Graded</option>
                </select>
              </Field>
              <Field label="Score">
                <Input
                  type="number"
                  min={0}
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                />
              </Field>
            </div>
            <Field label="Feedback">
              <Textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                rows={4}
              />
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save review"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
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
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <span className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
      <RotateCcw className="mx-auto mb-3 size-5" />
      {text}
    </div>
  );
}
