import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import { LicenseSummary } from "@/types/license";

export const licenseServerService = {
  getCurrent: () =>
    apiServer.get<ApiResponse<LicenseSummary>>("/licenses/current"),
};
