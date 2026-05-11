import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import { Tag } from "@/types/tag";

export const tagServerService = {
  getAll: () => apiServer.get<ApiResponse<{ data: Tag[] }>>("/tags"),
  getById: (id: string) => apiServer.get<ApiResponse<Tag>>(`/tags/${id}`),
};
