import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { UpdateProfilePayload, User } from "@/types/user";

export const profileClientService = {
  updateProfile: (data: UpdateProfilePayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<User>>(`/api/profiles/me`, data),
    ),
};
