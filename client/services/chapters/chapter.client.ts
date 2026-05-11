import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  Chapter,
  ChapterReorderPayload,
  CreateChapterPayload,
  UpdateChapterPayload,
} from "@/types/chapter";

export const chapterClientService = {
  create: (data: CreateChapterPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Chapter>>("/api/chapters", data),
    ),

  update: (id: number, data: UpdateChapterPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Chapter>>(`/api/chapters/${id}`, data),
    ),

  reorder: (data: ChapterReorderPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<void>>("/api/chapters/reorder", data),
    ),

  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(`/api/chapters/${id}`),
    ),
};
