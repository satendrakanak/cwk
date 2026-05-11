import { apiServer } from "@/lib/api/server";
import { ApiResponse, Paginated } from "@/types/api";
import { Course } from "@/types/course";
import {
  DashboardStats,
  PublicProfileBundle,
  User,
  UsersQueryParams,
  WeeklyProgress,
} from "@/types/user";

const PUBLIC_REVALIDATE_SECONDS = 60;

const buildUsersQuery = (params?: UsersQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.roleId) searchParams.set("roleId", String(params.roleId));
  if (params?.includeDeleted) searchParams.set("includeDeleted", "true");
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const userServerService = {
  getAll: (params?: UsersQueryParams) =>
    apiServer.get<ApiResponse<Paginated<User>>>(
      `/users${buildUsersQuery(params)}`,
    ),
  getById: (userId: number) =>
    apiServer.get<ApiResponse<User>>(`/users/${userId}`),
  getEnrolledCourses: (userId: number) =>
    apiServer.get<ApiResponse<Course[]>>(`/courses/enrolled/${userId}`),

  getDashboardStats: (userId: number) =>
    apiServer.get<ApiResponse<DashboardStats>>(
      `/users/dashboard-stats/${userId}`,
    ),

  getWeeklyProgress: (userId: number) =>
    apiServer.get<ApiResponse<WeeklyProgress[]>>(
      `/users/weekly-progress/${userId}`,
    ),

  getMe: () => apiServer.get<ApiResponse<User>>("/users/me"),

  getFaculties: () =>
    apiServer.get<ApiResponse<User[]>>("/users/all-faculty", {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    }),
  getFacultyProfile: (facultyId: number) =>
    apiServer.get<ApiResponse<User>>(`/users/faculty-profile/${facultyId}`, {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    }),
  getPublicProfile: (username: string) =>
    apiServer.get<ApiResponse<PublicProfileBundle | null>>(
      `/users/public-profile/${username}`,
    ),
};
