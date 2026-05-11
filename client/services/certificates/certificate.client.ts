import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { Certificate } from "@/types/certificate";

export const certificateClientService = {
  getMine: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Certificate[]>>("/api/certificates/my"),
    ),

  getForCourse: (courseId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Certificate | null>>(
        `/api/certificates/course/${courseId}`,
      ),
    ),

  generateForCourse: (courseId: number) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Certificate>>(
        `/api/certificates/course/${courseId}/generate`,
      ),
    ),

  generateForUserCourse: (userId: number, courseId: number) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Certificate>>(
        `/api/certificates/admin/users/${userId}/courses/${courseId}/generate`,
      ),
    ),
};
