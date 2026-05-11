import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { CartItem, CartSyncItem } from "@/types/cart";

type CartResponse = {
  id: number;
  items: CartItem[];
};

export const cartClientService = {
  getMine: () =>
    withAuthRetry(() => apiClient.get<ApiResponse<CartResponse>>("/api/cart")),

  sync: (items: CartSyncItem[]) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<CartResponse>>("/api/cart/sync", {
        items,
      }),
    ),

  clear: () =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ success: boolean }>>("/api/cart"),
    ),
};
