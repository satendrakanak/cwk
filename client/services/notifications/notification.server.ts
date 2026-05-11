import { apiServer } from "@/lib/api/server";
import type { ApiResponse } from "@/types/api";
import type { AppNotification } from "@/types/notification";

export const notificationServerService = {
  async getMine(limit = 20) {
    const response = await apiServer.get<ApiResponse<AppNotification[]>>(
      `/notifications/my?limit=${limit}`,
    );

    return response.data;
  },

  async getUnreadCount() {
    const response = await apiServer.get<ApiResponse<{ count: number }>>(
      "/notifications/my/unread-count",
    );

    return response.data;
  },
};
