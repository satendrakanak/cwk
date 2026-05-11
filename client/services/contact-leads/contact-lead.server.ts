import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import { ContactLead } from "@/types/contact-lead";

export const contactLeadServerService = {
  list: (query?: string) =>
    apiServer.get<ApiResponse<ContactLead[]>>(
      `/contact-leads${query ? `?${query}` : ""}`,
    ),
};
