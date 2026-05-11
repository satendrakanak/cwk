"use client";

import { useEffect, useState, useTransition } from "react";
import { MessageSquare, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/context/session-context";
import { getErrorMessage } from "@/lib/error-handler";
import { getUserAvatarUrl } from "@/lib/user-avatar";
import { cn } from "@/lib/utils";
import { courseReviewClientService } from "@/services/course-reviews/course-review.client";
import { Course } from "@/types/course";
import { CourseReview, CourseReviewSummary } from "@/types/course-review";
import {
  getReviewInitials,
  getReviewUserName,
  mergeReviews,
} from "@/utils/reviews";
import { RatingStars } from "./rating-star";

const emptySummary: CourseReviewSummary = {
  average: 0,
  total: 0,
  breakdown: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0 })),
};

export function CourseRatingReviews({ course }: { course: Course }) {
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [summary, setSummary] = useState<CourseReviewSummary>(emptySummary);
  const [myReview, setMyReview] = useState<CourseReview | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const { user } = useSession();

  const loadReviews = async () => {
    try {
      const [reviewsResponse, summaryResponse, mineResponse] =
        await Promise.all([
          courseReviewClientService.getByCourse(course.id),
          courseReviewClientService.getSummary(course.id),
          user
            ? courseReviewClientService.getMine(course.id).catch(() => null)
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
    let isMounted = true;

    Promise.all([
      courseReviewClientService.getByCourse(course.id),
      courseReviewClientService.getSummary(course.id),
      user
        ? courseReviewClientService.getMine(course.id).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([reviewsResponse, summaryResponse, mineResponse]) => {
        if (!isMounted) return;

        const ownReview = mineResponse?.data || null;

        setMyReview(ownReview);
        setReviews(mergeReviews(reviewsResponse.data, ownReview));
        setSummary(summaryResponse.data || emptySummary);

        if (ownReview) {
          setRating(ownReview.rating);
          setComment(ownReview.comment || "");
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
  }, [course.id, user]);

  const submitReview = () => {
    startTransition(async () => {
      try {
        if (myReview) {
          await courseReviewClientService.update(myReview.id, {
            rating,
            comment,
          });
        } else {
          await courseReviewClientService.upsert(course.id, {
            rating,
            comment,
          });
        }

        toast.success("Review submitted for approval");
        await loadReviews();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const deleteReview = (reviewId: number) => {
    startTransition(async () => {
      try {
        await courseReviewClientService.delete(reviewId);

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
    <section className="academy-card p-5 md:p-6">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-card-foreground">
          Ratings & Reviews
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          See what learners are saying and share your own experience after
          enrolling.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-3xl border border-border bg-muted/50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Course Rating
          </p>

          <div className="mt-5 flex items-end gap-2">
            <span className="text-5xl font-bold tracking-tight text-card-foreground">
              {summary.average ? summary.average.toFixed(1) : "0.0"}
            </span>

            <span className="pb-2 text-sm text-muted-foreground">/ 5</span>
          </div>

          <div className="mt-3">
            <RatingStars rating={summary.average} />
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            Based on {summary.total} review{summary.total === 1 ? "" : "s"}
          </p>

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
                      className="h-full rounded-full bg-primary"
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
              <h3 className="text-2xl font-semibold text-card-foreground">
                Learner Reviews
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Real feedback from students who joined this course.
              </p>
            </div>
          </div>

          {course.isEnrolled ? (
            <div className="mt-5 rounded-3xl border border-border bg-muted/50 p-4">
              <p className="mb-3 text-sm font-semibold text-card-foreground">
                Share your experience
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
                          ? "fill-primary text-primary"
                          : "text-muted-foreground/40",
                      )}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write a short review about your learning experience..."
                className="min-h-28 resize-none rounded-2xl border-border bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary"
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Reviews may be checked before appearing publicly.
                </p>

                <div className="flex items-center gap-2">
                  {myReview ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => deleteReview(myReview.id)}
                      className="rounded-full border-border bg-background text-destructive hover:border-destructive hover:bg-destructive hover:text-white **:text-inherit"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={submitReview}
                    className="rounded-full bg-primary px-6 text-primary-foreground shadow-[0_12px_30px_color-mix(in_oklab,var(--primary)_18%,transparent)] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending
                      ? "Saving..."
                      : myReview
                        ? "Update Review"
                        : "Submit Review"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-border bg-muted/50 p-5">
              <p className="text-sm font-semibold text-card-foreground">
                Enroll to leave a review
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Once you join this course, you can share your rating and
                learning experience here.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {reviews.length ? (
              reviews.map((review) => {
                const reviewerName = getReviewUserName(review);
                const avatarUrl = getUserAvatarUrl(review.user);
                const isOwnReview = myReview?.id === review.id;

                return (
                  <article
                    key={review.id}
                    className="rounded-3xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/25 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-11 w-11 border border-border">
                          <AvatarImage src={avatarUrl} alt={reviewerName} />

                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getReviewInitials(review)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="truncate text-sm font-semibold text-card-foreground">
                              {reviewerName}
                            </h4>

                            {isOwnReview ? (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                Your review
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-1 flex items-center gap-2">
                            <RatingStars rating={review.rating} />

                            <span className="text-xs text-muted-foreground">
                              {review.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isOwnReview ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => deleteReview(review.id)}
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Delete review"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>

                    {review.comment ? (
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        {review.comment}
                      </p>
                    ) : null}
                  </article>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-8 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground" />

                <p className="mt-3 text-sm font-semibold text-card-foreground">
                  No reviews yet
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Be the first learner to share feedback for this course.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
