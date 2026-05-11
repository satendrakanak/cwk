import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import {
  AccessControlDashboardData,
} from "@/types/access-control";
import { Permission, Role } from "@/types/user";

export const accessControlServerService = {
  getDashboard: () =>
    apiServer.get<ApiResponse<AccessControlDashboardData>>(
      "/roles-permissions/dashboard",
    ),

  getRoles: () =>
    apiServer.get<ApiResponse<Role[]>>("/roles-permissions"),

  getPermissions: () =>
    apiServer.get<ApiResponse<Permission[]>>("/roles-permissions/permissions"),
};
