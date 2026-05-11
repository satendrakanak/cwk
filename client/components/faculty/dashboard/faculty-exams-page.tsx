"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipboardCheck, FileText, PenLine, Plus, Settings } from "lucide-react";

import { CreateExamDialog } from "@/components/admin/exams/create-exam-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error-handler";
import { facultyWorkspaceClient } from "@/services/faculty/faculty-workspace.client";
import type {
  FacultyExamAttempt,
  FacultyWorkspaceCourse,
  FacultyWorkspaceData,
} from "@/types/faculty-workspace";
import type { Question, QuestionBankCategory } from "@/types/exam";
import type { User } from "@/types/user";
import { formatDateTime } from "@/utils/formate-date";

type FacultyExamsPageProps = {
  exams: FacultyWorkspaceData["exams"];
  courses: FacultyWorkspaceCourse[];
  faculties: User[];
  questions: Question[];
  categories: QuestionBankCategory[];
  attempts: FacultyExamAttempt[];
  canAssignFaculty: boolean;
};

type GradeFormRow = {
  questionId: number;
  score: string;
  feedback: string;
};

export function FacultyExamsPage({
  exams,
  courses,
  faculties,
  questions,
  categories,
  attempts,
  canAssignFaculty,
}: FacultyExamsPageProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  const pending = attempts.filter((attempt) => attempt.needsManualGrading).length;
  const defaultCourseIds = courses.length === 1 ? [courses[0].id] : [];
  const defaultFacultyIds = faculties.map((faculty) => faculty.id);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Exams
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Exam management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create assessments, tune rules, publish exams, and review learner
            submissions from your faculty workspace.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Create Exam
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat icon={ClipboardCheck} label="Assigned exams" value={exams.length} />
        <Stat icon={FileText} label="Submitted attempts" value={attempts.length} />
        <Stat icon={PenLine} label="Manual reviews" value={pending} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
          <div>
            <h2 className="text-base font-semibold">Assigned exams</h2>
            <p className="text-sm text-muted-foreground">
              Exams mapped to your assigned courses.
            </p>
          </div>
          {exams.length ? (
            exams.map((exam) => (
              <div key={exam.id} className="rounded-xl border bg-background p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{exam.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {exam.courses.map((course) => course.title).join(", ") ||
                        "No course mapped"}
                    </p>
                  </div>
                  <Badge variant="outline">{exam.status}</Badge>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  {exam.attemptsCount} submitted attempts
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/faculty/exams/${exam.id}`}>
                      <Settings className="size-4" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <Empty text="No exams are assigned yet." />
          )}
        </div>

        <div className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
          <div>
            <h2 className="text-base font-semibold">Attempt reviews</h2>
            <p className="text-sm text-muted-foreground">
              Open a submitted attempt to review scores and manual grading.
            </p>
          </div>
          {attempts.length ? (
            attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="grid gap-3 rounded-xl border bg-background p-4 md:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold">
                      {attempt.learnerName}
                    </h3>
                    <Badge variant={attempt.passed ? "default" : "secondary"}>
                      {attempt.passed ? "Passed" : attempt.status}
                    </Badge>
                    {attempt.needsManualGrading ? (
                      <Badge variant="destructive">Manual</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {attempt.examTitle} - {attempt.courseTitle}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {attempt.submittedAt
                      ? formatDateTime(attempt.submittedAt)
                      : "Not submitted"}
                  </p>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <span className="text-sm font-semibold">
                    {Math.round(attempt.percentage)}%
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedAttemptId(attempt.id)}
                  >
                    Review
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <Empty text="No submitted attempts yet." />
          )}
        </div>
      </section>

      <GradeAttemptDialog
        attemptId={selectedAttemptId}
        onOpenChange={(open) => {
          if (!open) setSelectedAttemptId(null);
        }}
      />

      <CreateExamDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        courses={courses}
        faculties={faculties}
        questions={questions}
        categories={categories}
        defaultCourseIds={defaultCourseIds}
        defaultFacultyIds={defaultFacultyIds}
        afterCreateBasePath="/faculty/exams"
        hideFacultySelector={!canAssignFaculty}
      />
    </div>
  );
}

function GradeAttemptDialog({
  attemptId,
  onOpenChange,
}: {
  attemptId: number | null;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<FacultyExamAttempt | null>(null);
  const [rows, setRows] = useState<GradeFormRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!attemptId) {
      setAttempt(null);
      setRows([]);
      return;
    }

    setIsLoading(true);
    facultyWorkspaceClient
      .getExamAttempt(attemptId)
      .then((response) => {
        setAttempt(response.data);
        setRows(
          (response.data.questionResults ?? []).map((result) => ({
            questionId: result.questionId,
            score: String(result.score ?? 0),
            feedback: result.feedback ?? "",
          })),
        );
      })
      .catch((error: unknown) => toast.error(getErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, [attemptId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!attemptId) return;

    try {
      setIsSaving(true);
      await facultyWorkspaceClient.gradeExamAttempt(attemptId, {
        questionResults: rows.map((row) => ({
          questionId: row.questionId,
          score: Number(row.score || 0),
          feedback: row.feedback || undefined,
        })),
      });
      toast.success("Attempt graded");
      onOpenChange(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={Boolean(attemptId)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Review attempt</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="rounded-xl border bg-background p-6 text-sm text-muted-foreground">
            Loading attempt...
          </div>
        ) : attempt ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm font-semibold">{attempt.learnerName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {attempt.examTitle} - {attempt.courseTitle}
              </p>
              <p className="mt-3 text-sm">
                Current score: {attempt.score}/{attempt.maxScore} (
                {Math.round(attempt.percentage)}%)
              </p>
            </div>

            <div className="space-y-3">
              {rows.map((row, index) => {
                const result = attempt.questionResults?.find(
                  (item) => item.questionId === row.questionId,
                );
                const answer = attempt.answers?.find(
                  (item) => item.questionId === row.questionId,
                );

                return (
                  <div key={row.questionId} className="rounded-xl border bg-background p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          Question {index + 1}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Max score: {result?.maxScore ?? 0}
                        </p>
                      </div>
                      {result?.needsManualGrading ? (
                        <Badge variant="destructive">Manual grading</Badge>
                      ) : (
                        <Badge variant="outline">Auto graded</Badge>
                      )}
                    </div>

                    <div className="mt-3 rounded-lg border bg-card p-3 text-sm">
                      <p className="text-xs font-medium text-muted-foreground">
                        Learner answer
                      </p>
                      <pre className="mt-1 whitespace-pre-wrap break-words font-sans text-sm">
                        {formatAnswer(answer?.answer)}
                      </pre>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-[10rem_1fr]">
                      <div className="space-y-2">
                        <Label>Score</Label>
                        <Input
                          type="number"
                          min="0"
                          max={result?.maxScore ?? undefined}
                          step="0.25"
                          value={row.score}
                          onChange={(event) =>
                            setRows((current) =>
                              current.map((item) =>
                                item.questionId === row.questionId
                                  ? { ...item, score: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Feedback</Label>
                        <Textarea
                          value={row.feedback}
                          onChange={(event) =>
                            setRows((current) =>
                              current.map((item) =>
                                item.questionId === row.questionId
                                  ? { ...item, feedback: event.target.value }
                                  : item,
                              ),
                            )
                          }
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save grading"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <Empty text="Attempt not found." />
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatAnswer(answer: unknown) {
  if (answer === null || answer === undefined || answer === "") {
    return "No answer submitted";
  }

  if (typeof answer === "string" || typeof answer === "number" || typeof answer === "boolean") {
    return String(answer);
  }

  return JSON.stringify(answer, null, 2);
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClipboardCheck;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <Icon className="mb-4 size-6 text-primary" />
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-background p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
