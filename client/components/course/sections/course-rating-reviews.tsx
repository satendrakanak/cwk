"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Filter, Loader, MessageSquare, Star, Trash2 } from "lucide-react";
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

type ReviewFilter = "recent" | "oldest" | "positive" | "average" | "negative";

const reviewFilters: { value: ReviewFilter; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "positive", label: "Positive" },
  { value: "average", label: "Average" },
  { value: "negative", label: "Negative" },
];

const REVIEWS_PAGE_SIZE = 5;

export function CourseRatingReviews({ course }: { course: Course }) {
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [summary, setSummary] = useState<CourseReviewSummary>(emptySummary);
  const [myReview, setMyReview] = useState<CourseReview | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("recent");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { user } = useSession();

  const loadReviewsPage = useCallback(
    async (page = 1, mode: "replace" | "append" = "replace") => {
      if (mode === "replace") {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const reviewsResponse = await courseReviewClientService.getByCourse(
        course.id,
        {
          page,
          limit: REVIEWS_PAGE_SIZE,
          filter: reviewFilter,
        },
      );

      const nextReviews = reviewsResponse.data.data;
      setReviews((current) =>
        mode === "append"
          ? mergeReviewPages(current, nextReviews)
          : nextReviews,
      );
      setTotalReviews(reviewsResponse.data.meta.totalItems);
      setCurrentPage(reviewsResponse.data.meta.currentPage);
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    },
    [course.id, reviewFilter],
  );

  const loadReviews = async () => {
    try {
      const [reviewsResponse, summaryResponse, mineResponse] =
        await Promise.all([
          courseReviewClientService.getByCourse(course.id, {
            page: 1,
            limit: REVIEWS_PAGE_SIZE,
            filter: reviewFilter,
          }),
          courseReviewClientService.getSummary(course.id),
          user
            ? courseReviewClientService.getMine(course.id).catch(() => null)
            : Promise.resolve(null),
        ]);

      const ownReview = mineResponse?.data || null;

      setMyReview(ownReview);
      setReviews(mergeReviews(reviewsResponse.data.data, ownReview));
      setTotalReviews(reviewsResponse.data.meta.totalItems);
      setCurrentPage(1);
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
    setIsInitialLoading(true);

    Promise.all([
      courseReviewClientService.getByCourse(course.id, {
        page: 1,
        limit: REVIEWS_PAGE_SIZE,
        filter: reviewFilter,
      }),
      courseReviewClientService.getSummary(course.id),
      user
        ? courseReviewClientService.getMine(course.id).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([reviewsResponse, summaryResponse, mineResponse]) => {
        if (!isMounted) return;

        const ownReview = mineResponse?.data || null;

        setMyReview(ownReview);
        setReviews(mergeReviews(reviewsResponse.data.data, ownReview));
        setTotalReviews(reviewsResponse.data.meta.totalItems);
        setCurrentPage(1);
        setSummary(summaryResponse.data || emptySummary);
        setIsInitialLoading(false);

        if (ownReview) {
          setRating(ownReview.rating);
          setComment(ownReview.comment || "");
        }
      })
      .catch((error) => {
        if (isMounted) {
          toast.error(getErrorMessage(error));
          setIsInitialLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [course.id, reviewFilter, user]);

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

  const hasMoreReviews = reviews.length < totalReviews;
  const setFilter = (value: ReviewFilter) => {
    setReviewFilter(value);
  };

  const loadMoreReviews = async () => {
    try {
      await loadReviewsPage(currentPage + 1, "append");
    } catch (error) {
      toast.error(getErrorMessage(error));
      setIsLoadingMore(false);
    }
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
        <div className="rounded-3xl border border-border bg-muted/50 p-5 text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Course Rating
          </p>

          <div className="mt-5 flex items-end justify-center gap-2 lg:justify-start">
            <span className="text-5xl font-bold tracking-tight text-card-foreground">
              {summary.average ? summary.average.toFixed(1) : "0.0"}
            </span>

            <span className="pb-2 text-sm text-muted-foreground">/ 5</span>
          </div>

          <div className="mt-3 flex justify-center lg:justify-start">
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

        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4 text-center sm:text-left">
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
            <div className="relative mt-5 rounded-3xl border border-border bg-muted/50 p-4">
              {myReview ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => deleteReview(myReview.id)}
                  className="absolute right-4 top-4 rounded-full border-border bg-background text-destructive hover:border-destructive hover:bg-destructive hover:text-white **:text-inherit"
                  aria-label="Delete review"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}

              <p className="mb-3 text-sm font-semibold text-card-foreground">
                Share your experience
              </p>

              <div className="mb-4 flex justify-center gap-1 sm:justify-start">
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

                <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
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
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-muted/40 p-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Filter className="h-4 w-4" />
                </span>
              </div>

              <div className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-1 sm:pb-0">
                {reviewFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setFilter(filter.value)}
                    className={cn(
                      "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      reviewFilter === filter.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {isInitialLoading ? (
              <ReviewSkeletonList />
            ) : reviews.length ? (
              reviews.map((review) => {
                const reviewerName = getReviewUserName(review);
                const avatarUrl = getUserAvatarUrl(review.user);
                const isOwnReview = myReview?.id === review.id;

                return (
                  <article
                    key={review.id}
                    className="rounded-3xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/25 hover:bg-primary/5 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

                          <div className="mt-1 flex flex-wrap items-center gap-2">
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
                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center self-end rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
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

            {hasMoreReviews ? (
              <div className="pt-2 text-center">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoadingMore}
                  onClick={loadMoreReviews}
                  className="rounded-full border-border bg-background px-6 font-semibold text-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Loading reviews
                    </>
                  ) : (
                    "Show next reviews"
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewSkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: REVIEWS_PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 animate-pulse rounded-full bg-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-36 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-28 animate-pulse rounded-full bg-muted" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function mergeReviewPages(
  current: CourseReview[],
  nextReviews: CourseReview[],
) {
  const map = new Map<number, CourseReview>();

  [...current, ...nextReviews].forEach((review) => {
    map.set(review.id, review);
  });

  return [...map.values()];
}
