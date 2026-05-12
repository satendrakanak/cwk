import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse, Paginated } from "@/types/api";
import {
  CreateFacultyReviewPayload,
  FacultyReviewFilter,
  FacultyReview,
  FacultyReviewSummary,
} from "@/types/faculty-review";

type FacultyReviewsQuery = {
  page?: number;
  limit?: number;
  filter?: FacultyReviewFilter;
};

const buildQueryString = (params: Record<string, string | number | undefined>) =>
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");

export const facultyReviewClientService = {
  getByFaculty: (facultyId: number, query: FacultyReviewsQuery = {}) => {
    const queryString = buildQueryString(query);

    return apiClient.get<ApiResponse<Paginated<FacultyReview>>>(
      `/api/faculty-reviews/faculty/${facultyId}${queryString ? `?${queryString}` : ""}`,
    );
  },

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
