"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/context/session-context";
import { getErrorMessage } from "@/lib/error-handler";
import { getUserAvatarUrl } from "@/lib/user-avatar";
import { cn } from "@/lib/utils";
import { facultyReviewClientService } from "@/services/faculty-reviews/faculty-review.client";
import { FacultyReview, FacultyReviewSummary } from "@/types/faculty-review";
import { User } from "@/types/user";
import { formatDate } from "@/utils/formate-date";

const emptySummary: FacultyReviewSummary = {
  average: 0,
  total: 0,
  breakdown: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0 })),
};

export function FacultyReviewsSection({ faculty }: { faculty: User }) {
  const [reviews, setReviews] = useState<FacultyReview[]>([]);
  const [summary, setSummary] = useState<FacultyReviewSummary>(emptySummary);
  const [myReview, setMyReview] = useState<FacultyReview | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const { user } = useSession();

  const loadReviews = async () => {
    try {
      const [reviewsResponse, summaryResponse, mineResponse] =
        await Promise.all([
          facultyReviewClientService.getByFaculty(faculty.id),
          facultyReviewClientService.getSummary(faculty.id),
          user
            ? facultyReviewClientService.getMine(faculty.id).catch(() => null)
            : Promise.resolve(null),
        ]);

      const ownReview = mineResponse?.data || null;

      setMyReview(ownReview);
      setReviews(mergeReviews(reviewsResponse.data, ownReview));
      setSummary(summaryResponse.data || emptySummary);

      if (ownReview) {
        setRating(ownReview.rating);
        setComment(ownReview.comment || "");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  useEffect(() => {
    void loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faculty.id, user?.id]);

  const submitReview = () => {
    startTransition(async () => {
      try {
        if (myReview) {
          await facultyReviewClientService.update(myReview.id, {
            rating,
            comment,
          });
        } else {
          await facultyReviewClientService.upsert(faculty.id, {
            rating,
            comment,
          });
        }

        toast.success("Faculty review saved");
        await loadReviews();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const deleteReview = (reviewId: number) => {
    startTransition(async () => {
      try {
        await facultyReviewClientService.delete(reviewId);

        setMyReview(null);
        setRating(5);
        setComment("");

        toast.success("Review deleted");
        await loadReviews();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  return (
    <section className="academy-card p-5 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="rounded-3xl border border-border bg-muted/50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Faculty rating
          </p>

          <div className="mt-5 flex items-end gap-2">
            <span className="text-5xl font-bold tracking-tight text-card-foreground">
              {summary.average ? summary.average.toFixed(1) : "0.0"}
            </span>

            <span className="pb-2 text-sm text-muted-foreground">
              / 5 from {summary.total} review
              {summary.total === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-3">
            <RatingStars rating={summary.average} />
          </div>

          <div className="mt-6 space-y-3">
            {summary.breakdown.map((item) => {
              const width = summary.total
                ? Math.round((item.count / summary.total) * 100)
                : 0;

              return (
                <div key={item.rating} className="flex items-center gap-2">
                  <span className="w-10 text-xs font-semibold text-muted-foreground">
                    {item.rating} star
                  </span>

                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${width}%` }}
                    />
                  </div>

                  <span className="w-7 text-right text-xs text-muted-foreground">
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-card-foreground">
                Learner feedback
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Honest reviews from learners who interacted with this faculty.
              </p>
            </div>
          </div>

          {user ? (
            <div className="mt-5 rounded-3xl border border-border bg-muted/50 p-4">
              <p className="mb-3 text-sm font-semibold text-card-foreground">
                Share your rating
              </p>

              <div className="mb-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="cursor-pointer rounded-full p-1 transition hover:scale-105"
                    aria-label={`${value} star rating`}
                  >
                    <Star
                      className={cn(
                        "h-6 w-6",
                        value <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/35",
                      )}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What stood out in the teaching style, clarity, or support?"
                className="min-h-28 resize-none rounded-2xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  disabled={isPending}
                  onClick={submitReview}
                  className="rounded-full bg-primary px-5 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {isPending
                    ? "Saving..."
                    : myReview
                      ? "Update review"
                      : "Submit review"}
                </Button>

                {myReview ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => deleteReview(myReview.id)}
                    className="rounded-full border-border text-destructive hover:border-destructive hover:bg-destructive hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-border bg-muted/50 p-5 text-sm text-muted-foreground">
              Sign in to rate this faculty and share your experience.
              <Link
                href={`/auth/sign-in?callbackUrl=/our-faculty/${faculty.id}`}
                className="ml-2 font-semibold text-primary underline-offset-4 hover:underline"
              >
                Go to sign in
              </Link>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {reviews.length ? (
              reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary/25 hover:bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-11 w-11 border border-border">
                        <AvatarImage
                          src={getUserAvatarUrl(review.user)}
                          alt={review.user.firstName}
                        />

                        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                          {review.user.firstName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-card-foreground">
                          {review.user.firstName} {review.user.lastName || ""}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    <RatingStars rating={review.rating} compact />
                  </div>

                  {review.comment ? (
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {review.comment}
                    </p>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-8 text-center">
                <p className="text-sm font-semibold text-card-foreground">
                  No ratings yet
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Be the first learner to review this faculty.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function RatingStars({
  rating,
  compact = false,
}: {
  rating: number;
  compact?: boolean;
}) {
  const roundedRating = Math.round(rating || 0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={cn(
            compact ? "h-4 w-4" : "h-5 w-5",
            value <= roundedRating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/35",
          )}
        />
      ))}
    </div>
  );
}

function mergeReviews(
  publicReviews: FacultyReview[],
  ownReview: FacultyReview | null,
) {
  if (!ownReview) return publicReviews;

  const exists = publicReviews.some((review) => review.id === ownReview.id);

  if (exists) {
    return publicReviews.map((review) =>
      review.id === ownReview.id ? ownReview : review,
    );
  }

  return [ownReview, ...publicReviews];
}
