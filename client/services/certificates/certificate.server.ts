import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import { AdminCertificateDashboard, Certificate } from "@/types/certificate";

export const certificateServerService = {
  getMine: () => apiServer.get<ApiResponse<Certificate[]>>("/certificates/my"),

  getAdminDashboard: () =>
    apiServer.get<ApiResponse<AdminCertificateDashboard>>(
      "/certificates/admin/dashboard",
    ),
};
