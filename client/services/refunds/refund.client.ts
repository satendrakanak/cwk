import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  RefundDecision,
  RefundRequest,
} from "@/types/order";

export const refundClientService = {
  createRequest: (
    orderId: number,
    data: { reason: string; customerNote?: string },
  ) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<RefundRequest>>(
        `/api/refund-requests/orders/${orderId}`,
        data,
      ),
    ),

  getMine: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<RefundRequest[]>>("/api/refund-requests/my"),
    ),

  getAdminList: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<RefundRequest[]>>("/api/refund-requests/admin"),
    ),

  review: (
    refundRequestId: number,
    data: {
      decision: RefundDecision;
      approvedAmount?: number;
      adminNote?: string;
    },
  ) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<RefundRequest>>(
        `/api/refund-requests/${refundRequestId}/review`,
        data,
      ),
    ),

  sync: (refundRequestId: number) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<RefundRequest>>(
        `/api/refund-requests/${refundRequestId}/sync`,
      ),
    ),
};
