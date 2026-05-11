"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error-handler";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-avatar";
import { articleCommentClientService } from "@/services/article-comments/article-comment.client";
import { courseQaClientService } from "@/services/course-qa/course-qa.client";
import { courseReviewClientService } from "@/services/course-reviews/course-review.client";
import { ArticleComment } from "@/types/article-comment";
import { CourseAnswer, CourseQuestion } from "@/types/course-qa";
import { CourseReview } from "@/types/course-review";
import {
  CheckCircle2,
  MessageSquare,
  Pencil,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

type TabKey = "reviews" | "comments" | "questions" | "answers";
type ModerationItem = CourseReview | ArticleComment | CourseQuestion | CourseAnswer;
type EditState = {
  type: TabKey;
  item: ModerationItem;
  title: string;
  body: string;
  rating: number;
} | null;
type DeleteState = { type: TabKey; id: number; title: string } | null;

export function ModerationDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("comments");
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [questions, setQuestions] = useState<CourseQuestion[]>([]);
  const [answers, setAnswers] = useState<CourseAnswer[]>([]);
  const [editState, setEditState] = useState<EditState>(null);
  const [deleteState, setDeleteState] = useState<DeleteState>(null);
  const [isPending, startTransition] = useTransition();

  const loadAll = async () => {
    const [reviewsRes, commentsRes, questionsRes, answersRes] =
      await Promise.all([
        courseReviewClientService.getAll(),
        articleCommentClientService.getAll(),
        courseQaClientService.getAllQuestions(),
        courseQaClientService.getAllAnswers(),
      ]);

    setReviews(reviewsRes.data);
    setComments(commentsRes.data);
    setQuestions(questionsRes.data);
    setAnswers(answersRes.data);
  };

  useEffect(() => {
    let mounted = true;

    Promise.all([
      courseReviewClientService.getAll(),
      articleCommentClientService.getAll(),
      courseQaClientService.getAllQuestions(),
      courseQaClientService.getAllAnswers(),
    ])
      .then(([reviewsRes, commentsRes, questionsRes, answersRes]) => {
        if (!mounted) return;
        setReviews(reviewsRes.data);
        setComments(commentsRes.data);
        setQuestions(questionsRes.data);
        setAnswers(answersRes.data);
      })
      .catch((error) => {
        if (mounted) toast.error(getErrorMessage(error));
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updatePublish = (
    type: TabKey,
    id: number,
    isPublished: boolean,
  ) => {
    startTransition(async () => {
      try {
        if (type === "reviews") {
          await courseReviewClientService.setPublished(id, isPublished);
        }
        if (type === "comments") {
          await articleCommentClientService.setPublished(id, isPublished);
        }
        if (type === "questions") {
          await courseQaClientService.setQuestionPublished(id, isPublished);
        }
        if (type === "answers") {
          await courseQaClientService.setAnswerPublished(id, isPublished);
        }
        toast.success(isPublished ? "Published" : "Unpublished");
        await loadAll();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const openEdit = (type: TabKey, item: ModerationItem) => {
    setEditState({
      type,
      item,
      title:
        type === "questions"
          ? (item as CourseQuestion).title
          : type === "reviews"
            ? String((item as CourseReview).rating)
            : "",
      body:
        type === "comments"
          ? (item as ArticleComment).content
          : type === "reviews"
            ? (item as CourseReview).comment || ""
            : type === "questions"
              ? (item as CourseQuestion).body
              : (item as CourseAnswer).body,
      rating: type === "reviews" ? (item as CourseReview).rating : 5,
    });
  };

  const submitEdit = () => {
    if (!editState) return;

    startTransition(async () => {
      try {
        if (editState.type === "reviews") {
          await courseReviewClientService.update(editState.item.id, {
            rating: editState.rating,
            comment: editState.body,
          });
        }
        if (editState.type === "comments") {
          await articleCommentClientService.update(editState.item.id, {
            content: editState.body,
          });
        }
        if (editState.type === "questions") {
          await courseQaClientService.updateQuestion(editState.item.id, {
            title: editState.title,
            body: editState.body,
          });
        }
        if (editState.type === "answers") {
          await courseQaClientService.updateAnswer(editState.item.id, {
            body: editState.body,
          });
        }
        toast.success("Updated successfully");
        setEditState(null);
        await loadAll();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const deleteItem = () => {
    if (!deleteState) return;

    startTransition(async () => {
      try {
        if (deleteState.type === "reviews") {
          await courseReviewClientService.delete(deleteState.id);
        }
        if (deleteState.type === "comments") {
          await articleCommentClientService.delete(deleteState.id);
        }
        if (deleteState.type === "questions") {
          await courseQaClientService.deleteQuestion(deleteState.id);
        }
        if (deleteState.type === "answers") {
          await courseQaClientService.deleteAnswer(deleteState.id);
        }
        toast.success("Deleted successfully");
        setDeleteState(null);
        await loadAll();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const pendingCount =
    reviews.filter((item) => !item.isPublished).length +
    comments.filter((item) => !item.isPublished).length +
    questions.filter((item) => !item.isPublished).length +
    answers.filter((item) => !item.isPublished).length;

  const tabs = [
    { id: "comments" as const, label: "Comments", count: comments.length },
    { id: "reviews" as const, label: "Reviews", count: reviews.length },
    { id: "questions" as const, label: "Q&A Questions", count: questions.length },
    { id: "answers" as const, label: "Q&A Answers", count: answers.length },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-[var(--brand-100)] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_55%,#eef4ff_100%)] p-6 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-[var(--brand-200)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)] dark:border-white/10 dark:bg-white/8 dark:text-[var(--brand-200)]">
              Moderation
            </span>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
              Content approval dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Review course ratings, article comments, and course Q&A before
              anything appears publicly.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Pending approval" value={pendingCount} />
            <StatCard
              label="Published items"
              value={
                reviews.length +
                comments.length +
                questions.length +
                answers.length -
                pendingCount
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-[var(--brand-600)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-[var(--brand-50)] dark:bg-white/8 dark:text-slate-300 dark:hover:bg-white/12"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {activeTab === "comments" &&
            comments.map((comment) => (
              <ModerationCard
                key={comment.id}
                icon={<MessageSquare className="h-5 w-5" />}
                user={comment.user}
                title={comment.article?.title || "Article comment"}
                body={comment.content}
                isPublished={comment.isPublished}
                meta={comment.parent ? "Reply comment" : "Top-level comment"}
                disabled={isPending}
                onPublish={(value) => updatePublish("comments", comment.id, value)}
                onEdit={() => openEdit("comments", comment)}
                onDelete={() =>
                  setDeleteState({
                    type: "comments",
                    id: comment.id,
                    title: comment.article?.title || "comment",
                  })
                }
              />
            ))}

          {activeTab === "reviews" &&
            reviews.map((review) => (
              <ModerationCard
                key={review.id}
                icon={<Star className="h-5 w-5" />}
                user={review.user}
                title={review.course?.title || "Course review"}
                body={review.comment || "No written feedback"}
                isPublished={review.isPublished}
                meta={`${review.rating}/5 rating`}
                disabled={isPending}
                onPublish={(value) => updatePublish("reviews", review.id, value)}
                onEdit={() => openEdit("reviews", review)}
                onDelete={() =>
                  setDeleteState({
                    type: "reviews",
                    id: review.id,
                    title: review.course?.title || "review",
                  })
                }
              />
            ))}

          {activeTab === "questions" &&
            questions.map((question) => (
              <ModerationCard
                key={question.id}
                icon={<ShieldCheck className="h-5 w-5" />}
                user={question.user}
                title={question.title}
                body={question.body}
                isPublished={question.isPublished}
                meta={question.course?.title || "Course question"}
                disabled={isPending}
                onPublish={(value) =>
                  updatePublish("questions", question.id, value)
                }
                onEdit={() => openEdit("questions", question)}
                onDelete={() =>
                  setDeleteState({
                    type: "questions",
                    id: question.id,
                    title: question.title,
                  })
                }
              />
            ))}

          {activeTab === "answers" &&
            answers.map((answer) => (
              <ModerationCard
                key={answer.id}
                icon={<CheckCircle2 className="h-5 w-5" />}
                user={answer.user}
                title={answer.question?.title || "Q&A answer"}
                body={answer.body}
                isPublished={answer.isPublished}
                meta={answer.question?.course?.title || "Course answer"}
                disabled={isPending}
                onPublish={(value) => updatePublish("answers", answer.id, value)}
                onEdit={() => openEdit("answers", answer)}
                onDelete={() =>
                  setDeleteState({
                    type: "answers",
                    id: answer.id,
                    title: answer.question?.title || "answer",
                  })
                }
              />
            ))}
        </div>
      </section>

      <ModerationEditDialog
        editState={editState}
        isPending={isPending}
        onOpenChange={(open) => {
          if (!open) setEditState(null);
        }}
        onChange={setEditState}
        onSubmit={submitEdit}
      />

      <AlertDialog
        open={!!deleteState}
        onOpenChange={(open) => {
          if (!open) setDeleteState(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove “{deleteState?.title}” from moderation and public
              views. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={deleteItem}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ModerationEditDialog({
  editState,
  isPending,
  onOpenChange,
  onChange,
  onSubmit,
}: {
  editState: EditState;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (state: EditState) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={!!editState} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit moderation item</DialogTitle>
        </DialogHeader>

        {editState ? (
          <div className="space-y-4">
            {editState.type === "reviews" ? (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Rating
                </label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={editState.rating}
                  onChange={(event) =>
                    onChange({
                      ...editState,
                      rating: Number(event.target.value),
                    })
                  }
                />
              </div>
            ) : null}

            {editState.type === "questions" ? (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Question title
                </label>
                <Input
                  value={editState.title}
                  onChange={(event) =>
                    onChange({ ...editState, title: event.target.value })
                  }
                />
              </div>
            ) : null}

            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700">
                {editState.type === "reviews"
                  ? "Review"
                  : editState.type === "comments"
                    ? "Comment"
                    : editState.type === "questions"
                      ? "Question details"
                      : "Answer"}
              </label>
              <Textarea
                value={editState.body}
                onChange={(event) =>
                  onChange({ ...editState, body: event.target.value })
                }
                className="min-h-32"
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={isPending} onClick={onSubmit}>
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-white/80 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/8">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function ModerationCard({
  icon,
  user,
  title,
  body,
  meta,
  isPublished,
  disabled,
  onPublish,
  onEdit,
  onDelete,
}: {
  icon: React.ReactNode;
  user: { firstName: string; lastName?: string; avatar?: { path: string } | null };
  title: string;
  body: string;
  meta: string;
  isPublished: boolean;
  disabled: boolean;
  onPublish: (isPublished: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const name = getUserDisplayName(user);

  return (
    <article className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3">
          <Avatar className="h-11 w-11 border border-white dark:border-white/10">
            <AvatarImage src={getUserAvatarUrl(user)} alt={name} />
            <AvatarFallback className="bg-[var(--brand-50)] text-[var(--brand-700)]">
              {name.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-[var(--brand-700)] dark:bg-white/10 dark:text-[var(--brand-200)]">
                {icon}
              </span>
              <h3 className="font-semibold text-slate-950 dark:text-white">
                {title}
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isPublished
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {isPublished ? "Published" : "Pending"}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {meta} by {name}
            </p>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {body}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" disabled={disabled} onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            type="button"
            disabled={disabled || isPublished}
            onClick={() => onPublish(true)}
          >
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || !isPublished}
            onClick={() => onPublish(false)}
          >
            Unpublish
          </Button>
          <Button type="button" variant="outline" disabled={disabled} onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
