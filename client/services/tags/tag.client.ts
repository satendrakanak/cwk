import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { CreateTagPayload, Tag, UpdateTagPayload } from "@/types/tag";
export const tagClientService = {
  getAll: () =>
    apiClient.get<Promise<{ data: Tag[] }>>("/api/tags/"),

  create: (data: CreateTagPayload) =>
    withAuthRetry(() => apiClient.post<ApiResponse<Tag>>("/api/tags", data)),
  bulkCreate: (names: string[]) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Tag[]>>("/api/tags/bulk", {
        names,
      }),
    ),

  update: (id: number, data: UpdateTagPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Tag>>(`/api/tags/${id}`, data),
    ),

  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(`/api/tags/${id}`),
    ),
  deleteBulk: async (ids: number[]) =>
    Promise.all(ids.map((id) => tagClientService.delete(id))),
};
