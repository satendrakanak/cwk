import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  CreateOrderPayload,
  CreateOrderResponse,
  Order,
  OrderStatus,
  VerifyPaymentPayload,
} from "@/types/order";

export const orderClientService = {
  // 🔥 Create Order
  create: (data: CreateOrderPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<CreateOrderResponse>>("/api/orders", data),
    ),

  updateStatus: (orderId: number, data: { status: OrderStatus }) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Order>>(
        `/api/orders/${orderId}/status`,
        data,
      ),
    ),
  retry: (orderId: number) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<CreateOrderResponse>>(
        `/api/orders/${orderId}/retry`,
      ),
    ),
  cancelPayment: (orderId: number) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<{ success: boolean }>>(
        `/api/orders/${orderId}/cancel-payment`,
      ),
    ),
  reportPaymentFailure: (
    orderId: number,
    data: { paymentId?: string | null; gatewayOrderId?: string | null },
  ) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<{ success: boolean }>>(
        `/api/orders/${orderId}/mark-failed`,
        data,
      ),
    ),
  getPaymentConfig: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<{ keyId: string }>>(
        "/api/settings/payment-config",
      ),
    ),
  verifyPayment: (data: VerifyPaymentPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Order>>("/api/orders/verify", data),
    ),

  getMyOrders: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Order[]>>("/api/orders/my-orders"),
    ),
};
