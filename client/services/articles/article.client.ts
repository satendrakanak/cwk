import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  Article,
  CreateArticePayload,
  UpdateArticlePayload,
} from "@/types/article";

export const articleClientService = {
  getAll: () =>
    apiClient.get<ApiResponse<{ data: Article[] }>>("/api/articles"),
  getById: (id: number) =>
    apiClient.get<ApiResponse<Article>>(`/api/articles/${id}`),
  create: (data: CreateArticePayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Article>>("/api/articles", data),
    ),

  update: (id: number, data: UpdateArticlePayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Article>>(`/api/articles/${id}`, data),
    ),
  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(`/api/articles/${id}`),
    ),
};
