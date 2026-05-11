import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  Course,
  CreateCoursePayload,
  UpdateCoursePayload,
} from "@/types/course";
export const courseClientService = {
  getAll: () =>
    apiClient.get<ApiResponse<{ data: Course[] }>>("/api/courses"),
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
