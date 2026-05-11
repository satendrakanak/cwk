import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import { RefundRequest } from "@/types/order";

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

export const refundServerService = {
  getAdminList: (query?: DateRangeQuery) =>
    apiServer.get<ApiResponse<RefundRequest[]>>(
      withQuery("/refund-requests/admin", query),
    ),

  getMine: () =>
    apiServer.get<ApiResponse<RefundRequest[]>>("/refund-requests/my"),

  getById: (refundRequestId: number) =>
    apiServer.get<ApiResponse<RefundRequest>>(
      `/refund-requests/${refundRequestId}`,
    ),
};
