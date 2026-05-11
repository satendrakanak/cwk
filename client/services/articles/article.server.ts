import { apiServer } from "@/lib/api/server";
import { ApiResponse, Paginated } from "@/types/api";
import { Article } from "@/types/article";

const PUBLIC_REVALIDATE_SECONDS = 60;

export const articleServerService = {
  getAll: () =>
    apiServer.get<ApiResponse<Article[]>>("/articles?isPublished=true", {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    }),
  getPublicArticles: (query: { page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();

    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));

    const search = params.toString();

    return apiServer.get<ApiResponse<Paginated<Article>>>(
      `/articles?isPublished=true${search ? `&${search}` : ""}`,
      {
        next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
      },
    );
  },
  getAllArticles: () =>
    apiServer.get<ApiResponse<{ data: Article[] }>>("/articles"),

  getFeaturedArticles: () =>
    apiServer.get<ApiResponse<Article[]>>("/articles/featured", {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    }),

  getRealtedArticles: (id: number) =>
    apiServer.get<ApiResponse<Article[]>>(`/articles/related/${id}`, {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    }),

  getById: (id: number) =>
    apiServer.get<ApiResponse<Article>>(`/articles/${id}`),
  getBySlug: (slug: string) =>
    apiServer.get<ApiResponse<Article>>(`/articles/slug/${slug}`, {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
    }),
};
