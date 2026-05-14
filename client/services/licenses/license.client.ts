import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { LicenseSummary } from "@/types/license";

export const licenseClientService = {
  getCurrent: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<LicenseSummary>>("/api/licenses/current"),
    ),

  activate: (data: { key: string; purchaserEmail?: string }) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<LicenseSummary>>(
        "/api/licenses/activate",
        data,
      ),
    ),
};
