import { apiServer } from "@/lib/api/server";
import { ApiResponse, Paginated } from "@/types/api";
import { Category, CategoryQueryParams } from "@/types/category";

const buildCategoryQuery = (params?: CategoryQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const categoryServerService = {
  list: (params?: CategoryQueryParams) =>
    apiServer.get<ApiResponse<Paginated<Category>>>(
      `/categories${buildCategoryQuery(params)}`,
    ),
  getAll: () => apiServer.get<ApiResponse<{ data: Category[] }>>("/categories"),
  getById: (id: string) =>
    apiServer.get<ApiResponse<Category>>(`/categories/${id}`),
};
