import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  CreatePermissionPayload,
  CreateRolePayload,
  UpdatePermissionPayload,
  UpdateRolePayload,
} from "@/types/access-control";
import { Permission, Role } from "@/types/user";

export const accessControlClientService = {
  getDashboard: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<{ roles: Role[]; permissions: Permission[] }>>(
        "/api/roles-permissions/dashboard",
      ),
    ),

  createRole: (data: CreateRolePayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Role>>("/api/roles-permissions/roles", data),
    ),

  updateRole: (id: number, data: UpdateRolePayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Role>>(
        `/api/roles-permissions/roles/${id}`,
        data,
      ),
    ),

  deleteRole: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/roles-permissions/roles/${id}`,
      ),
    ),

  createPermission: (data: CreatePermissionPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Permission>>(
        "/api/roles-permissions/permissions",
        data,
      ),
    ),

  updatePermission: (id: number, data: UpdatePermissionPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Permission>>(
        `/api/roles-permissions/permissions/${id}`,
        data,
      ),
    ),

  deletePermission: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/roles-permissions/permissions/${id}`,
      ),
    ),
};
