import { apiServer } from "@/lib/api/server";
import type { ApiResponse } from "@/types/api";
import type { EngagementDashboard } from "@/types/engagement";

export const engagementServerService = {
  getDashboard: () =>
    apiServer.get<ApiResponse<EngagementDashboard>>("/engagement/dashboard"),
};
