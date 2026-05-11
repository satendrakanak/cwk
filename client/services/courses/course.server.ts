import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import { Course } from "@/types/course";

const PUBLIC_REVALIDATE_SECONDS = 60;

type DateRangeQuery = {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

function withQuery(path: string, query?: DateRangeQuery) {
  const params = new URLSearchParams(path.includes("?") ? path.split("?")[1] : "");
  const basePath = path.split("?")[0];

  if (query?.startDate) params.set("startDate", query.startDate);
  if (query?.endDate) params.set("endDate", query.endDate);
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));

  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

export const courseServerService = {
  getAll: () =>
    apiServer.get<ApiResponse<Course[]>>("/courses?isPublished=true"),
  getAllCourses: (query?: DateRangeQuery) =>
    apiServer.get<ApiResponse<{ data: Course[] }>>(
      withQuery("/courses", query),
    ),

  getPopularCourses: () =>
    apiServer.get<ApiResponse<Course[]>>("/courses/featured", {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    }),

  getRealtedCourses: (id: number) =>
    apiServer.get<ApiResponse<Course[]>>(`/courses/related/${id}`, {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    }),

  getById: (id: number) => apiServer.get<ApiResponse<Course>>(`/courses/${id}`),
  getBySlug: (slug: string) =>
    apiServer.get<ApiResponse<Course>>(`/courses/slug/${slug}`),
  getLearningCourseBySlug: (slug: string) =>
    apiServer.get<ApiResponse<Course>>(`/courses/learn/${slug}`),
};
