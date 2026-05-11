import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import { Order } from "@/types/order";

type DateRangeQuery = {
  startDate?: string;
  endDate?: string;
};

function withQuery(path: string, query?: DateRangeQuery) {
  const params = new URLSearchParams();

  if (query?.startDate) params.set("startDate", query.startDate);
  if (query?.endDate) params.set("endDate", query.endDate);

  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

export const orderServerService = {
  getAll: (query?: DateRangeQuery) =>
    apiServer.get<ApiResponse<Order[]>>(withQuery("/orders", query)),
  getMine: (query?: DateRangeQuery) =>
    apiServer.get<ApiResponse<Order[]>>(withQuery("/orders/my-orders", query)),
  getById: (orderId: number) =>
    apiServer.get<ApiResponse<Order>>(`/orders/${orderId}`),
};
