import type { ApiResponse } from "./api";
import type { Role } from "./user";

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type RegisterStartResponse = {
  email: string;
  maskedEmail: string;
  isExistingUser: boolean;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type AuthUserSummary = {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  roles: Pick<Role, "id" | "name">[];
};

export type LoginResponse = {
  user: AuthUserSummary;
  defaultRedirect: string;
};

export type AuthResponse = ApiResponse<LoginResponse>;

export type CheckoutVerificationStartPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
};

export type CheckoutVerificationStartResponse = {
  email: string;
  maskedEmail: string;
  isExistingUser: boolean;
};

export type CheckoutVerificationOtpPayload = {
  email: string;
  code: string;
};

export type CompleteSocialAuthPayload = {
  token: string;
  email: string;
};
