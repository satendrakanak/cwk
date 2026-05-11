import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse, Paginated } from "@/types/api";
import {
  Category,
  CategoryQueryParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category";

const buildCategoryQuery = (params?: CategoryQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const categoryClientService = {
  list: (params?: CategoryQueryParams) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Paginated<Category>>>(
        `/api/categories${buildCategoryQuery(params)}`,
      ),
    ),
  getAllBy: (type: string) =>
    withAuthRetry(() =>
      apiClient.get<Promise<{ data: Category[] }>>(
        `/api/categories/by-type?type=${type}`,
      ),
    ),

  create: (data: CreateCategoryPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Category>>("/api/categories", data),
    ),
  createBulk: (categories: CreateCategoryPayload[]) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Category[]>>("/api/categories/bulk", {
        categories,
      }),
    ),
  update: (id: number, data: UpdateCategoryPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Category>>(`/api/categories/${id}`, data),
    ),

  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/categories/${id}`,
      ),
    ),
  deleteBulk: (ids: number[]) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<{ message: string }>>(
        "/api/categories/bulk-delete",
        { ids },
      ),
    ),
};
