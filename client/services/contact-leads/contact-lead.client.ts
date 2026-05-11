import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  ContactLead,
  CreateContactLeadPayload,
  UpdateContactLeadPayload,
} from "@/types/contact-lead";

export const contactLeadClientService = {
  create: (data: CreateContactLeadPayload) =>
    apiClient.post<ApiResponse<ContactLead>>("/api/contact-leads", data),

  list: (query?: string) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<ContactLead[]>>(
        `/api/contact-leads${query ? `?${query}` : ""}`,
      ),
    ),

  update: (id: number, data: UpdateContactLeadPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<ContactLead>>(`/api/contact-leads/${id}`, data),
    ),
};
