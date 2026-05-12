import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import type { Paginated } from "@/types/api";
import {
  Course,
  CreateCoursePayload,
  UpdateCoursePayload,
} from "@/types/course";
export const courseClientService = {
  getAll: () =>
    apiClient.get<ApiResponse<{ data: Course[] }>>("/api/courses"),
  getPublicCourses: (
    query: {
      page?: number;
      limit?: number;
      mode?: string;
      category?: string;
      tag?: string;
    } = {},
  ) => {
    const params = new URLSearchParams({ isPublished: "true" });

    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.mode) params.set("mode", query.mode);
    if (query.category) params.set("category", query.category);
    if (query.tag) params.set("tag", query.tag);

    return apiClient.get<ApiResponse<Paginated<Course>>>(
      `/api/courses?${params.toString()}`,
    );
  },
  getMegaMenuCourses: () =>
    apiClient.get<ApiResponse<Course[]>>("/api/courses/mega-menu"),
  getById: (id: number) =>
    apiClient.get<ApiResponse<Course>>(`/api/courses/${id}`),
  create: (data: CreateCoursePayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Course>>("/api/courses", data),
    ),

  update: (id: number, data: UpdateCoursePayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Course>>(`/api/courses/${id}`, data),
    ),
  duplicate: (id: number) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Course>>(`/api/courses/${id}/duplicate`),
    ),
  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(`/api/courses/${id}`),
    ),
};
