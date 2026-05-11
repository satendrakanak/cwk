import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import { Coupon } from "@/types/coupon";

type DateRangeQuery = {
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

function withQuery(path: string, query?: DateRangeQuery) {
  const params = new URLSearchParams();

  if (query?.startDate) params.set("startDate", query.startDate);
  if (query?.endDate) params.set("endDate", query.endDate);
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));

  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

export const couponServerService = {
  getAll: (query?: DateRangeQuery) =>
    apiServer.get<ApiResponse<{ data: Coupon[] }>>(
      withQuery("/coupons", query),
    ),
  getById: (id: string) => apiServer.get<ApiResponse<Coupon>>(`/coupons/${id}`),
};
