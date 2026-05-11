import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { FileType } from "@/types/file";
export const uploadClientService = {
  getAll: () =>
    withAuthRetry(() => apiClient.get<ApiResponse<FileType>>("/api/uploads")),

  uploadFile: (file: File) =>
    withAuthRetry(() => {
      const formData = new FormData();
      formData.append("file", file);

      return apiClient.post<ApiResponse<FileType>>(
        "/api/uploads/file",
        formData,
      );
    }),

  deleteFile: (id: number) =>
    withAuthRetry(() => {
      return apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/uploads/${id}`,
      );
    }),
};
