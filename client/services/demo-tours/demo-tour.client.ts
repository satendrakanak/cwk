import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export type StartDemoTourPayload = {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  businessName?: string;
  useCase?: string;
};

export type StartDemoTourResponse = {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName?: string;
    roles: Array<{ id: number; name: string }>;
  };
  defaultRedirect: string;
  expiresAt: string;
};

export const demoTourClientService = {
  start: (data: StartDemoTourPayload) =>
    apiClient.post<ApiResponse<StartDemoTourResponse>>(
      "/api/demo-tours/start",
      data,
    ),
  cleanupExpired: () =>
    apiClient.post<ApiResponse<{ cleanedUsers: number }>>(
      "/api/demo-tours/cleanup-expired",
    ),
};
