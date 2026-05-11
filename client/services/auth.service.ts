import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  AuthResponse,
  CompleteSocialAuthPayload,
  CheckoutVerificationOtpPayload,
  CheckoutVerificationStartPayload,
  CheckoutVerificationStartResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  RegisterStartResponse,
  ResetPasswordPayload,
} from "@/types/auth";

export const authService = {
  register: (data: RegisterPayload) =>
    apiClient.post<ApiResponse<RegisterStartResponse>>(
      "/api/auth/sign-up",
      data,
    ),

  login: (data: LoginPayload) =>
    apiClient.post<AuthResponse>("/api/auth/sign-in", data),

  verifyEmail: (token: string) =>
    apiClient.get<AuthResponse>(
      `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
    ),

  forgotPassword: (data: ForgotPasswordPayload) =>
    apiClient.post<AuthResponse>("/api/auth/forgot-password", data),

  resetPassword: (data: ResetPasswordPayload) =>
    apiClient.post<AuthResponse>("/api/auth/reset-password", data),

  refreshToken: () =>
    apiClient.post<{ success: boolean }>("/api/auth/refresh-tokens"),

  startCheckoutVerification: (data: CheckoutVerificationStartPayload) =>
    apiClient.post<ApiResponse<CheckoutVerificationStartResponse>>(
      "/api/auth/checkout/start-verification",
      data,
    ),

  verifyCheckoutOtp: (data: CheckoutVerificationOtpPayload) =>
    apiClient.post<ApiResponse<null>>("/api/auth/checkout/verify-otp", data),

  verifySignupOtp: (data: CheckoutVerificationOtpPayload) =>
    apiClient.post<ApiResponse<null>>("/api/auth/sign-up/verify-otp", data),

  completeSocialAuthEmail: (data: CompleteSocialAuthPayload) =>
    apiClient.post<ApiResponse<{ redirectTo: string }>>(
      "/api/auth/social/complete-email",
      data,
    ),
};
