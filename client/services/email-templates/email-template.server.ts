import { apiServer } from "@/lib/api/server";
import { ApiResponse, Paginated } from "@/types/api";
import { EmailTemplate } from "@/types/email-template";

export const emailTemplateServerService = {
  getAll: (params?: { page?: number; limit?: number }) => {
    const query = new URLSearchParams();

    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const suffix = query.toString() ? `?${query.toString()}` : "";

    return apiServer.get<ApiResponse<Paginated<EmailTemplate>>>(
      `/email-templates${suffix}`,
    );
  },
};
