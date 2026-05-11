import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { LectureProgress, UpdateLectureProgressPayload } from "@/types/lecture";

export const userProgressClientService = {
  // ✅ GET single lecture progress
  getLecture: (lectureId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<LectureProgress>>(
        `/api/user-progress/lecture/${lectureId}`,
      ),
    ),

  // ✅ GET full course progress (🔥 important)
  getCourse: (courseId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Record<number, LectureProgress>>>(
        `/api/user-progress/course/${courseId}`,
      ),
    ),
  // ✅ UPDATE progress
  update: (data: UpdateLectureProgressPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<LectureProgress>>(
        "/api/user-progress/update",
        data,
      ),
    ),
};
