import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  ApplyCouponPayload,
  AutoApplyCouponPayload,
  Coupon,
  CouponApplyResponse,
  CouponMap,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types/coupon";

export const couponClientService = {
  getAll: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<{ data: Coupon[] }>>("/api/coupons"),
    ),
  getById: (id: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Coupon>>(`/api/coupons/${id}`),
    ),
  create: (data: CreateCouponPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Coupon>>("/api/coupons", data),
    ),

  update: (id: number, data: UpdateCouponPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Coupon>>(`/api/coupons/${id}`, data),
    ),
  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(`/api/coupons/${id}`),
    ),

  applyCoupon: (data: ApplyCouponPayload) =>
    apiClient.post<ApiResponse<CouponApplyResponse>>(
      `/api/coupons/apply`,
      data,
    ),

  autoApplyCoupon: (data: AutoApplyCouponPayload) =>
    apiClient.post<ApiResponse<CouponApplyResponse>>(
      `/api/coupons/auto-apply`,
      data,
    ),
  autoApplyBulk: (data: { courses: { id: number; price: number }[] }) =>
    apiClient.post<ApiResponse<{ data: CouponMap }>>(
      `/api/coupons/auto-apply-bulk`,
      data,
    ),
};
