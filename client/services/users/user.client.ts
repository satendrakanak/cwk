import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse, Paginated } from "@/types/api";
import {
  ChangePasswordPayload,
  CreateBulkUsersPayload,
  CreateUserPayload,
  PublicProfileBundle,
  Role,
  UpdateFacultyProfilePayload,
  UpdateProfilePayload,
  UpdateUserPayload,
  User,
  UsersQueryParams,
} from "@/types/user";

const buildUsersQuery = (params?: UsersQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.roleId) searchParams.set("roleId", String(params.roleId));
  if (params?.includeDeleted) searchParams.set("includeDeleted", "true");

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const userClientService = {
  list: (params?: UsersQueryParams) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Paginated<User>>>(`/api/users${buildUsersQuery(params)}`),
    ),

  create: (data: CreateUserPayload) =>
    withAuthRetry(() => apiClient.post<ApiResponse<User>>("/api/users", data)),

  createBulk: (data: CreateBulkUsersPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<User[]>>("/api/users/bulk", data),
    ),

  update: (id: number, data: UpdateUserPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<User>>(`/api/users/update/${id}`, data),
    ),
  updateProfile: (id: number, data: UpdateProfilePayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<User>>(
        `/api/users/update-profile/${id}`,
        data,
      ),
    ),

  updateFacultyProfile: (id: number, data: UpdateFacultyProfilePayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<User>>(
        `/api/users/faculty-profile/${id}`,
        data,
      ),
    ),
  updateUser: (data: UpdateUserPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<User>>(`/api/users/me`, data),
    ),

  changePassword: (data: ChangePasswordPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<User>>(`/api/users/change-password`, data),
    ),

  getAllRoles: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Role[]>>(`/api/roles-permissions`),
    ),

  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(`/api/users/${id}`),
    ),

  deleteBulk: (ids: number[]) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<{ message: string }>>("/api/users/bulk-delete", {
        ids,
      }),
    ),

  getAllFaculties: () =>
    apiClient.get<ApiResponse<User[]>>(`/api/users/all-faculty`),

  getFacultyProfile: (id: number) =>
    apiClient.get<ApiResponse<User>>(`/api/users/faculty-profile/${id}`),

  getPublicProfile: (username: string) =>
    apiClient.get<ApiResponse<PublicProfileBundle | null>>(
      `/api/users/public-profile/${username}`,
    ),
};
