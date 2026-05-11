"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Heart,
  MessageCircle,
  Pencil,
  Reply,
  Trash2,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/context/session-context";
import { getErrorMessage } from "@/lib/error-handler";
import { getUserAvatarUrl, getUserDisplayName } from "@/lib/user-avatar";
import { articleCommentClientService } from "@/services/article-comments/article-comment.client";
import { ArticleComment } from "@/types/article-comment";
import { formatDateTime } from "@/utils/formate-date";

export function ArticleComments({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [content, setContent] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [openReplies, setOpenReplies] = useState<Record<number, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDrafts, setEditDrafts] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();

  const { user } = useSession();

  const isOwner = (comment: ArticleComment) => comment.user.id === user?.id;

  const loadComments = async () => {
    try {
      const [publicResponse, mineResponse] = await Promise.all([
        articleCommentClientService.getByArticle(articleId),
        user
          ? articleCommentClientService
              .getMineByArticle(articleId)
              .catch(() => null)
          : Promise.resolve(null),
      ]);

      setComments(mergeComments(publicResponse.data, mineResponse?.data || []));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      articleCommentClientService.getByArticle(articleId),
      user
        ? articleCommentClientService
            .getMineByArticle(articleId)
            .catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([publicResponse, mineResponse]) => {
        if (!isMounted) return;

        setComments(
          mergeComments(publicResponse.data, mineResponse?.data || []),
        );
      })
      .catch((error) => {
        if (isMounted) toast.error(getErrorMessage(error));
      });

    return () => {
      isMounted = false;
    };
  }, [articleId, user]);

  const submitComment = () => {
    if (!content.trim()) {
      toast.error("Please write a comment first");
      return;
    }

    startTransition(async () => {
      try {
        await articleCommentClientService.create(articleId, {
          content: content.trim(),
        });

        setContent("");
        toast.success("Comment submitted for approval");
        await loadComments();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const submitReply = (commentId: number) => {
    const replyContent = replyDrafts[commentId]?.trim();

    if (!replyContent) {
      toast.error("Please write a reply first");
      return;
    }

    startTransition(async () => {
      try {
        await articleCommentClientService.reply(commentId, {
          content: replyContent,
        });

        setReplyDrafts((current) => ({ ...current, [commentId]: "" }));
        setOpenReplies((current) => ({ ...current, [commentId]: false }));

        toast.success("Reply submitted for approval");
        await loadComments();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const updateComment = (commentId: number) => {
    const updatedContent = editDrafts[commentId]?.trim();

    if (!updatedContent) {
      toast.error("Comment cannot be empty");
      return;
    }

    startTransition(async () => {
      try {
        await articleCommentClientService.update(commentId, {
          content: updatedContent,
        });

        setEditingId(null);
        toast.success("Comment updated and sent for approval");
        await loadComments();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const deleteComment = (commentId: number) => {
    startTransition(async () => {
      try {
        await articleCommentClientService.delete(commentId);

        toast.success("Comment deleted");
        await loadComments();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const toggleLike = (commentId: number) => {
    startTransition(async () => {
      try {
        await articleCommentClientService.toggleLike(commentId);
        await loadComments();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  return (
    <section className="academy-card mt-8 p-5 md:p-6">
      <div className="mb-6 flex items-start gap-3 border-b border-border pb-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <MessageCircle className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-card-foreground">
            Comments & Discussion
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Share your thoughts, like helpful comments, and reply to readers.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-muted/50 p-4">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a thoughtful comment..."
          className="min-h-28 resize-none border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        />

        <Button
          type="button"
          disabled={isPending}
          onClick={submitComment}
          className="mt-3 rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
          {isPending ? "Posting..." : "Post comment"}
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {comments.length ? (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary/25 hover:bg-primary/5"
            >
              <CommentNode
                comment={comment}
                level={0}
                isPending={isPending}
                replyDrafts={replyDrafts}
                openReplies={openReplies}
                onToggleLike={toggleLike}
                onToggleReply={(commentId) =>
                  setOpenReplies((current) => ({
                    ...current,
                    [commentId]: !current[commentId],
                  }))
                }
                onReplyChange={(commentId, value) =>
                  setReplyDrafts((current) => ({
                    ...current,
                    [commentId]: value,
                  }))
                }
                onSubmitReply={submitReply}
                editingId={editingId}
                editDrafts={editDrafts}
                getCanEdit={isOwner}
                onStartEdit={(currentComment) => {
                  setEditingId(currentComment.id);
                  setEditDrafts((current) => ({
                    ...current,
                    [currentComment.id]: currentComment.content,
                  }));
                }}
                onEditChange={(commentId, value) =>
                  setEditDrafts((current) => ({
                    ...current,
                    [commentId]: value,
                  }))
                }
                onUpdate={updateComment}
                onDelete={deleteComment}
                onCancelEdit={() => setEditingId(null)}
              />
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageCircle className="h-6 w-6" />
            </div>

            <p className="text-sm font-semibold text-card-foreground">
              No comments yet
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Start the discussion by posting the first comment.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function CommentNode({
  comment,
  level,
  isPending,
  replyDrafts,
  openReplies,
  onToggleLike,
  onToggleReply,
  onReplyChange,
  onSubmitReply,
  editingId,
  editDrafts,
  getCanEdit,
  onStartEdit,
  onEditChange,
  onUpdate,
  onDelete,
  onCancelEdit,
}: {
  comment: ArticleComment;
  level: number;
  isPending: boolean;
  replyDrafts: Record<number, string>;
  openReplies: Record<number, boolean>;
  onToggleLike: (commentId: number) => void;
  onToggleReply: (commentId: number) => void;
  onReplyChange: (commentId: number, value: string) => void;
  onSubmitReply: (commentId: number) => void;
  editingId: number | null;
  editDrafts: Record<number, string>;
  getCanEdit: (comment: ArticleComment) => boolean;
  onStartEdit: (comment: ArticleComment) => void;
  onEditChange: (commentId: number, value: string) => void;
  onUpdate: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  onCancelEdit: () => void;
}) {
  const canManage = getCanEdit(comment);
  const isEditing = editingId === comment.id;
  const replies = comment.replies || [];
  const likeCount = comment.likedBy?.length || 0;

  return (
    <div className={level ? "mt-4 border-l border-border pl-4" : ""}>
      <div
        className={
          level ? "rounded-2xl border border-border bg-muted/50 p-4" : undefined
        }
      >
        <CommentHeader comment={comment} />

        {!comment.isPublished ? (
          <p className="mt-3 inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Waiting for admin approval
          </p>
        ) : null}

        {isEditing ? (
          <div className="mt-4">
            <Textarea
              value={editDrafts[comment.id] || ""}
              onChange={(event) => onEditChange(comment.id, event.target.value)}
              className="min-h-24 resize-none border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => onUpdate(comment.id)}
                disabled={isPending}
                className="rounded-full bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Save
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                className="rounded-full border-border bg-background px-4 font-semibold text-foreground hover:bg-muted"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {comment.content}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleLike(comment.id)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary disabled:opacity-70 cursor-pointer"
          >
            <Heart className="h-4 w-4" />
            {likeCount}
          </button>

          <button
            type="button"
            onClick={() => onToggleReply(comment.id)}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary disabled:opacity-70 cursor-pointer"
          >
            <Reply className="h-4 w-4" />
            Reply
          </button>

          {canManage ? (
            <>
              <button
                type="button"
                onClick={() => onStartEdit(comment)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary disabled:opacity-70 cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-white disabled:opacity-70 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          ) : null}
        </div>

        {openReplies[comment.id] ? (
          <div className="mt-4 rounded-2xl border border-border bg-muted/50 p-4">
            <Textarea
              value={replyDrafts[comment.id] || ""}
              onChange={(event) =>
                onReplyChange(comment.id, event.target.value)
              }
              placeholder="Reply to this comment..."
              className="min-h-24 resize-none border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />

            <Button
              type="button"
              className="mt-3 rounded-full bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
              disabled={isPending}
              onClick={() => onSubmitReply(comment.id)}
            >
              <Reply className="h-4 w-4" />
              Post reply
            </Button>
          </div>
        ) : null}

        {replies.length > 0 && (
          <div className="mt-4">
            {replies.map((reply) => (
              <CommentNode
                key={reply.id}
                comment={reply}
                level={level + 1}
                isPending={isPending}
                replyDrafts={replyDrafts}
                openReplies={openReplies}
                onToggleLike={onToggleLike}
                onToggleReply={onToggleReply}
                onReplyChange={onReplyChange}
                onSubmitReply={onSubmitReply}
                editingId={editingId}
                editDrafts={editDrafts}
                getCanEdit={getCanEdit}
                onStartEdit={onStartEdit}
                onEditChange={onEditChange}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onCancelEdit={onCancelEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentHeader({ comment }: { comment: ArticleComment }) {
  const name = getUserDisplayName(comment.user);

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10 border border-border bg-muted">
        <AvatarImage src={getUserAvatarUrl(comment.user)} alt={name} />

        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
          {name.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0">
        <p className="truncate font-semibold text-card-foreground">{name}</p>

        <p className="text-xs text-muted-foreground">
          {formatDateTime(comment.createdAt)}
        </p>
      </div>
    </div>
  );
}

function mergeComments(
  publicComments: ArticleComment[],
  mine: ArticleComment[],
) {
  const map = new Map<number, ArticleComment>();

  const add = (comment: ArticleComment) => {
    map.set(comment.id, {
      ...comment,
      replies: comment.replies?.map((reply) => ({ ...reply })) || [],
    });

    comment.replies?.forEach(add);
  };

  publicComments.forEach(add);

  const roots = publicComments.map((comment) => map.get(comment.id)!);

  mine.forEach((comment) => {
    if (map.has(comment.id)) return;

    const nextComment = { ...comment, replies: [] };
    map.set(comment.id, nextComment);

    const parentId = comment.parent?.id;
    const parent = parentId ? map.get(parentId) : null;

    if (parent) {
      parent.replies = [...(parent.replies || []), nextComment];
    } else {
      roots.unshift(nextComment);
    }
  });

  return roots;
}
