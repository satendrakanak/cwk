import { CourseReview } from "@/types/course-review";

export function mergeReviews(
  reviews: CourseReview[],
  ownReview: CourseReview | null,
): CourseReview[] {
  if (!ownReview) return reviews;

  const exists = reviews.some((review) => review.id === ownReview.id);

  if (exists) return reviews;

  return [ownReview, ...reviews];
}

export function getReviewUserName(review: CourseReview) {
  const firstName = review.user?.firstName || "";
  const lastName = review.user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Learner";
}

export function getReviewInitials(review: CourseReview) {
  const name = getReviewUserName(review);

  return name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
