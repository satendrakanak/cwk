"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Filter, Loader, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/context/session-context";
import { getErrorMessage } from "@/lib/error-handler";
import { getFacultyHref } from "@/lib/faculty-slug";
import { getUserAvatarUrl } from "@/lib/user-avatar";
import { cn } from "@/lib/utils";
import { facultyReviewClientService } from "@/services/faculty-reviews/faculty-review.client";
import {
  FacultyReview,
  FacultyReviewFilter,
  FacultyReviewSummary,
} from "@/types/faculty-review";
import { User } from "@/types/user";
import { formatDate } from "@/utils/formate-date";

const emptySummary: FacultyReviewSummary = {
  average: 0,
  total: 0,
  breakdown: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0 })),
};

const REVIEWS_PAGE_SIZE = 5;

const reviewFilters: { value: FacultyReviewFilter; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "positive", label: "Positive" },
  { value: "average", label: "Average" },
  { value: "negative", label: "Negative" },
];

export function FacultyReviewsSection({ faculty }: { faculty: User }) {
  const [reviews, setReviews] = useState<FacultyReview[]>([]);
  const [summary, setSummary] = useState<FacultyReviewSummary>(emptySummary);
  const [myReview, setMyReview] = useState<FacultyReview | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewFilter, setReviewFilter] =
    useState<FacultyReviewFilter>("recent");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();

  const { user } = useSession();

  const loadReviewsPage = useCallback(
    async (page = 1, mode: "replace" | "append" = "replace") => {
      if (mode === "replace") {
        setIsInitialLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const reviewsResponse = await facultyReviewClientService.getByFaculty(
        faculty.id,
        {
          page,
          limit: REVIEWS_PAGE_SIZE,
          filter: reviewFilter,
        },
      );

      setReviews((current) =>
        mode === "append"
          ? mergeReviewPages(current, reviewsResponse.data.data)
          : reviewsResponse.data.data,
      );
      setTotalReviews(reviewsResponse.data.meta.totalItems);
      setCurrentPage(reviewsResponse.data.meta.currentPage);
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    },
    [faculty.id, reviewFilter],
  );

  const loadReviews = async () => {
    try {
      const [reviewsResponse, summaryResponse, mineResponse] =
        await Promise.all([
          facultyReviewClientService.getByFaculty(faculty.id, {
            page: 1,
            limit: REVIEWS_PAGE_SIZE,
            filter: reviewFilter,
          }),
          facultyReviewClientService.getSummary(faculty.id),
          user
            ? facultyReviewClientService.getMine(faculty.id).catch(() => null)
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
      facultyReviewClientService.getByFaculty(faculty.id, {
        page: 1,
        limit: REVIEWS_PAGE_SIZE,
        filter: reviewFilter,
      }),
      facultyReviewClientService.getSummary(faculty.id),
      user
        ? facultyReviewClientService.getMine(faculty.id).catch(() => null)
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
  }, [faculty.id, reviewFilter, user]);

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

        toast.success("Instructor review saved");
        await loadReviews();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  const hasMoreReviews = reviews.length < totalReviews;

  const loadMoreReviews = async () => {
    try {
      await loadReviewsPage(currentPage + 1, "append");
    } catch (error) {
      toast.error(getErrorMessage(error));
      setIsLoadingMore(false);
    }
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
        <div className="rounded-3xl border border-border bg-muted/50 p-5 text-center lg:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Instructor rating
          </p>

          <div className="mt-5 flex items-end justify-center gap-2 lg:justify-start">
            <span className="text-5xl font-bold tracking-tight text-card-foreground">
              {summary.average ? summary.average.toFixed(1) : "0.0"}
            </span>

            <span className="pb-2 text-sm text-muted-foreground">
              / 5 from {summary.total} review
              {summary.total === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-3 flex justify-center lg:justify-start">
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

        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4 text-center sm:text-left">
            <div>
              <h2 className="text-2xl font-semibold text-card-foreground">
                Learner feedback
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Honest reviews from learners who interacted with this instructor.
              </p>
            </div>
          </div>

          {user ? (
            <div className="relative mt-5 rounded-3xl border border-border bg-muted/50 p-4">
              {myReview ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={isPending}
                  onClick={() => deleteReview(myReview.id)}
                  className="absolute right-4 top-4 rounded-full border-border bg-background text-destructive hover:border-destructive hover:bg-destructive hover:text-white"
                  aria-label="Delete review"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}

              <p className="mb-3 text-sm font-semibold text-card-foreground">
                Share your rating
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

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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

              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-border bg-muted/50 p-5 text-sm text-muted-foreground">
              Sign in to rate this instructor and share your experience.
              <Link
                href={`/auth/sign-in?callbackUrl=${getFacultyHref(faculty)}`}
                className="ml-2 font-semibold text-primary underline-offset-4 hover:underline"
              >
                Go to sign in
              </Link>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Filter className="h-4 w-4" />
                </span>
                Filter reviews
              </div>

              <div className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-1 sm:pb-0">
                {reviewFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setReviewFilter(filter.value)}
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
              reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-3xl border border-border bg-card p-4 transition-colors hover:border-primary/25 hover:bg-primary/5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

                    <div className="self-start sm:self-auto">
                      <RatingStars rating={review.rating} compact />
                    </div>
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
                  Be the first learner to review this instructor.
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
        <div key={index} className="rounded-3xl border border-border bg-card p-4">
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

function mergeReviewPages(
  current: FacultyReview[],
  nextReviews: FacultyReview[],
) {
  const map = new Map<number, FacultyReview>();
  [...current, ...nextReviews].forEach((review) => {
    map.set(review.id, review);
  });
  return [...map.values()];
}
