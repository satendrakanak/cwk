import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  CreateFacultyReviewPayload,
  FacultyReview,
  FacultyReviewSummary,
} from "@/types/faculty-review";

export const facultyReviewClientService = {
  getByFaculty: (facultyId: number) =>
    apiClient.get<ApiResponse<FacultyReview[]>>(
      `/api/faculty-reviews/faculty/${facultyId}`,
    ),

  getSummary: (facultyId: number) =>
    apiClient.get<ApiResponse<FacultyReviewSummary>>(
      `/api/faculty-reviews/faculty/${facultyId}/summary`,
    ),

  getMine: (facultyId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<FacultyReview | null>>(
        `/api/faculty-reviews/faculty/${facultyId}/mine`,
      ),
    ),

  upsert: (facultyId: number, data: CreateFacultyReviewPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<FacultyReview>>(
        `/api/faculty-reviews/faculty/${facultyId}`,
        data,
      ),
    ),

  update: (id: number, data: CreateFacultyReviewPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<FacultyReview>>(
        `/api/faculty-reviews/${id}`,
        data,
      ),
    ),

  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/faculty-reviews/${id}`,
      ),
    ),
};
