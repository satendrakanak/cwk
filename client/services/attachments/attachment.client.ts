import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  Attachment,
  CreateAttachmentPayload,
  UpdateAttachmentPayload,
} from "@/types/attachment";

export const attachmentClientService = {
  create: (data: CreateAttachmentPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Attachment>>("/api/attachments", data),
    ),

  update: (id: number, data: UpdateAttachmentPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Attachment>>(`/api/attachments/${id}`, data),
    ),

  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/attachments/${id}`,
      ),
    ),
};
