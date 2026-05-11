import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  CreateLecturePayload,
  Lecture,
  LectureReorderPayload,
  UpdateLecturePayload,
} from "@/types/lecture";

export const lectureClientService = {
  create: (data: CreateLecturePayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Lecture>>("/api/lectures", data),
    ),

  update: (id: number, data: UpdateLecturePayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Lecture>>(`/api/lectures/${id}`, data),
    ),

  reorder: (data: LectureReorderPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<void>>("/api/lectures/reorder", data),
    ),

  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(`/api/lectures/${id}`),
    ),
};
