import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse, Paginated } from "@/types/api";
import {
  CreateEmailTemplatePayload,
  EmailTemplate,
  UpdateEmailTemplatePayload,
} from "@/types/email-template";

export const emailTemplateClientService = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const suffix = query.toString() ? `?${query.toString()}` : "";

    return withAuthRetry(() =>
      apiClient.get<ApiResponse<Paginated<EmailTemplate>>>(
        `/api/email-templates${suffix}`,
      ),
    );
  },

  create: (data: CreateEmailTemplatePayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<EmailTemplate>>("/api/email-templates", data),
    ),

  update: (id: number, data: UpdateEmailTemplatePayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<EmailTemplate>>(
        `/api/email-templates/${id}`,
        data,
      ),
    ),

  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/email-templates/${id}`,
      ),
    ),
};
