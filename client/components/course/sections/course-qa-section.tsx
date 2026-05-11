"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  MessageCircleQuestion,
  Pencil,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/context/session-context";
import { getErrorMessage } from "@/lib/error-handler";
import { cn } from "@/lib/utils";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-avatar";
import { courseQaClientService } from "@/services/course-qa/course-qa.client";
import { Course } from "@/types/course";
import { CourseQuestion } from "@/types/course-qa";

type QaEditState =
  | { type: "question"; id: number; title: string; body: string }
  | { type: "answer"; id: number; body: string }
  | null;

type QaDeleteState =
  | { type: "question"; id: number; title: string }
  | { type: "answer"; id: number; title: string }
  | null;

export function CourseQaSection({ course }: { course: Course }) {
  const [questions, setQuestions] = useState<CourseQuestion[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editState, setEditState] = useState<QaEditState>(null);
  const [deleteState, setDeleteState] = useState<QaDeleteState>(null);
  const [answerDrafts, setAnswerDrafts] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();

  const { user } = useSession();

  const loadQuestions = async () => {
    try {
      const response = await courseQaClientService.getByCourse(course.id);
      setQuestions(response.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    if (!course.isEnrolled) return;

    let isMounted = true;

    courseQaClientService
      .getByCourse(course.id)
      .then((response) => {
        if (isMounted) {
          setQuestions(response.data);
        }
      })
      .catch((error) => {
        if (isMounted) {
          toast.error(getErrorMessage(error));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [course.id, course.isEnrolled]);

  const submitQuestion = () => {
    startTransition(async () => {
      try {
        await courseQaClientService.createQuestion(course.id, { title, body });

        setTitle("");
        setBody("");
        setDialogOpen(false);

        toast.success("Question submitted for approval");
        await loadQuestions();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const submitAnswer = (questionId: number) => {
    startTransition(async () => {
      try {
        await courseQaClientService.createAnswer(questionId, {
          body: answerDrafts[questionId] || "",
        });

        setAnswerDrafts((current) => ({ ...current, [questionId]: "" }));

        toast.success("Answer submitted for approval");
        await loadQuestions();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const submitEdit = () => {
    if (!editState) return;

    startTransition(async () => {
      try {
        if (editState.type === "question") {
          await courseQaClientService.updateQuestion(editState.id, {
            title: editState.title,
            body: editState.body,
          });

          toast.success("Question updated and sent for approval");
        } else {
          await courseQaClientService.updateAnswer(editState.id, {
            body: editState.body,
          });

          toast.success("Answer updated and sent for approval");
        }

        setEditState(null);
        await loadQuestions();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const submitDelete = () => {
    if (!deleteState) return;

    startTransition(async () => {
      try {
        if (deleteState.type === "question") {
          await courseQaClientService.deleteQuestion(deleteState.id);
          toast.success("Question deleted");
        } else {
          await courseQaClientService.deleteAnswer(deleteState.id);
          toast.success("Answer deleted");
        }

        setDeleteState(null);
        await loadQuestions();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  if (!course.isEnrolled) return null;

  return (
    <section className="rounded-[28px] border border-border bg-card p-6 shadow-(--shadow-card)">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary ring-1 ring-primary/15">
            <MessageCircleQuestion className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-card-foreground">
              Course Q&A
            </h3>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Browse approved questions from enrolled learners and ask your own
              doubt from the button.
            </p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-primary text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_20%,transparent)] hover:bg-primary/90">
              <MessageCircleQuestion className="h-4 w-4" />
              Add your question
            </Button>
          </DialogTrigger>

          <DialogContent className="overflow-hidden rounded-3xl border border-border bg-card p-0 text-card-foreground shadow-[0_35px_120px_color-mix(in_oklab,var(--foreground)_18%,transparent)] sm:max-w-xl">
            <div className="p-5 md:p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-card-foreground">
                  Ask a course question
                </DialogTitle>
              </DialogHeader>

              <div className="mt-5 space-y-3">
                <Input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Short question title"
                  className="h-12 rounded-2xl border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary"
                />

                <Textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className="min-h-32 resize-none rounded-2xl border-border bg-muted px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary"
                  placeholder="Explain what you need help with..."
                />

                <Button
                  type="button"
                  className="h-11 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isPending}
                  onClick={submitQuestion}
                >
                  {isPending ? "Posting..." : "Submit for approval"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {questions.length ? (
          questions.map((question) => (
            <article
              key={question.id}
              className="rounded-3xl border border-border bg-background p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-card-foreground">
                    {question.title}
                  </h4>

                  <AuthorLine user={question.user} label="Asked by" />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!question.isPublished ? (
                    <StatusPill variant="pending">
                      Waiting for approval
                    </StatusPill>
                  ) : null}

                  {question.isResolved ? (
                    <StatusPill variant="success">
                      <CheckCircle2 className="h-4 w-4" />
                      Resolved
                    </StatusPill>
                  ) : null}

                  {question.user.id === user?.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-border bg-background text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground **:text-inherit"
                        onClick={() =>
                          setEditState({
                            type: "question",
                            id: question.id,
                            title: question.title,
                            body: question.body,
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-border bg-background text-foreground hover:border-destructive hover:bg-destructive hover:text-white **:text-inherit"
                        onClick={() =>
                          setDeleteState({
                            type: "question",
                            id: question.id,
                            title: question.title,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {question.body}
              </p>

              <div className="mt-4 space-y-3">
                {question.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="rounded-2xl border border-border bg-muted/50 p-4 text-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <AuthorLine
                        user={answer.user}
                        label="Answered by"
                        small
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        {!answer.isPublished ? (
                          <StatusPill variant="pending" small>
                            Waiting approval
                          </StatusPill>
                        ) : null}

                        {answer.isAccepted ? (
                          <StatusPill variant="success" small>
                            Accepted
                          </StatusPill>
                        ) : null}

                        {answer.user.id === user?.id ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setEditState({
                                  type: "answer",
                                  id: answer.id,
                                  body: answer.body,
                                })
                              }
                              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                              aria-label="Edit answer"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteState({
                                  type: "answer",
                                  id: answer.id,
                                  title: question.title,
                                })
                              }
                              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-white"
                              aria-label="Delete answer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <p className="mt-2 leading-6 text-muted-foreground">
                      {answer.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Textarea
                  value={answerDrafts[question.id] || ""}
                  onChange={(event) =>
                    setAnswerDrafts((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="Write an answer..."
                  className="min-h-24 resize-none rounded-2xl border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary"
                />

                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 rounded-full border-border bg-background px-5 font-semibold text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground **:text-inherit"
                  disabled={isPending}
                  onClick={() => submitAnswer(question.id)}
                >
                  Reply
                </Button>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-3xl border border-dashed border-border bg-muted/50 p-5 text-sm text-muted-foreground">
            No questions yet. Ask the first question for this course.
          </p>
        )}
      </div>

      <Dialog
        open={Boolean(editState)}
        onOpenChange={(open) => {
          if (!open) setEditState(null);
        }}
      >
        <DialogContent className="overflow-hidden rounded-3xl border border-border bg-card p-0 text-card-foreground shadow-[0_35px_120px_color-mix(in_oklab,var(--foreground)_18%,transparent)] sm:max-w-xl">
          <div className="p-5 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-card-foreground">
                Edit {editState?.type === "question" ? "question" : "answer"}
              </DialogTitle>
            </DialogHeader>

            {editState ? (
              <div className="mt-5 space-y-3">
                {editState.type === "question" ? (
                  <Input
                    value={editState.title}
                    onChange={(event) =>
                      setEditState({ ...editState, title: event.target.value })
                    }
                    placeholder="Question title"
                    className="h-12 rounded-2xl border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary"
                  />
                ) : null}

                <Textarea
                  value={editState.body}
                  onChange={(event) =>
                    setEditState({ ...editState, body: event.target.value })
                  }
                  className="min-h-32 resize-none rounded-2xl border-border bg-muted px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary"
                  placeholder="Write details..."
                />
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/50 p-5 sm:justify-end">
            <Button
              variant="outline"
              className="rounded-full border-border bg-background text-foreground hover:bg-muted"
              onClick={() => setEditState(null)}
            >
              Cancel
            </Button>

            <Button
              disabled={isPending}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={submitEdit}
            >
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteState)}
        onOpenChange={(open) => {
          if (!open) setDeleteState(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl border border-border bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">
              Delete this {deleteState?.type}?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-muted-foreground">
              This will remove “{deleteState?.title}”. You cannot undo this
              action.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isPending}
              className="rounded-full border-border bg-background text-foreground hover:bg-muted"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isPending}
              onClick={submitDelete}
              className="rounded-full bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

function AuthorLine({
  user,
  label,
  small = false,
}: {
  user: CourseQuestion["user"];
  label: string;
  small?: boolean;
}) {
  const name = getUserDisplayName(user);

  return (
    <div className="mt-2 flex items-center gap-2">
      <Avatar className={small ? "h-7 w-7" : "h-9 w-9"}>
        <AvatarImage src={getUserAvatarUrl(user)} alt={name} />

        <AvatarFallback className="bg-primary/10 text-primary">
          {name.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>

      <p className={cn(small ? "text-xs" : "text-sm", "text-muted-foreground")}>
        {label}{" "}
        <span className="font-semibold text-card-foreground">{name}</span>
      </p>
    </div>
  );
}

function StatusPill({
  children,
  variant,
  small = false,
}: {
  children: React.ReactNode;
  variant: "pending" | "success";
  small?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs",
        variant === "success"
          ? "border-primary/15 bg-primary/10 text-primary"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
