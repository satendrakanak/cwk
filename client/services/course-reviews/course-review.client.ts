import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  CourseReview,
  CourseReviewSummary,
  CreateCourseReviewPayload,
} from "@/types/course-review";

export const courseReviewClientService = {
  getByCourse: (courseId: number) =>
    apiClient.get<ApiResponse<CourseReview[]>>(
      `/api/course-reviews/course/${courseId}`,
    ),

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
