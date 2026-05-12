import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import { CourseReviewSummary } from "@/types/course-review";

const PUBLIC_REVALIDATE_SECONDS = 60;

export const courseReviewServerService = {
  getSummary: (courseId: number) =>
    apiServer.get<ApiResponse<CourseReviewSummary>>(
      `/course-reviews/course/${courseId}/summary`,
      { next: { revalidate: PUBLIC_REVALIDATE_SECONDS } },
    ),
};
