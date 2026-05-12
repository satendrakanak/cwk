import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse, Paginated } from "@/types/api";
import {
  CourseReview,
  CourseReviewSummary,
  CreateCourseReviewPayload,
} from "@/types/course-review";

export const courseReviewClientService = {
  getByCourse: (
    courseId: number,
    params?: {
      page?: number;
      limit?: number;
      filter?: "recent" | "oldest" | "positive" | "average" | "negative";
    },
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.filter) searchParams.set("filter", params.filter);
    const query = searchParams.toString();

    return apiClient.get<ApiResponse<Paginated<CourseReview>>>(
      `/api/course-reviews/course/${courseId}${query ? `?${query}` : ""}`,
    );
  },

  getSummary: (courseId: number) =>
    apiClient.get<ApiResponse<CourseReviewSummary>>(
      `/api/course-reviews/course/${courseId}/summary`,
    ),

  getAll: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<CourseReview[]>>("/api/course-reviews"),
    ),

  getMine: (courseId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<CourseReview | null>>(
        `/api/course-reviews/course/${courseId}/mine`,
      ),
    ),

  upsert: (courseId: number, data: CreateCourseReviewPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<CourseReview>>(
        `/api/course-reviews/course/${courseId}`,
        data,
      ),
    ),

  update: (id: number, data: CreateCourseReviewPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<CourseReview>>(
        `/api/course-reviews/${id}`,
        data,
      ),
    ),

  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/course-reviews/${id}`,
      ),
    ),

  setPublished: (id: number, isPublished: boolean) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<CourseReview>>(
        `/api/course-reviews/${id}/publish?isPublished=${isPublished}`,
      ),
    ),
};
