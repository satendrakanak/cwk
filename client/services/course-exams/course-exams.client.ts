import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { UserExamAccessOverview } from "@/types/exam";
import { CourseExamLearnerPayload } from "@/types/course";

export const courseExamsClientService = {
  getForCourse: (courseId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<CourseExamLearnerPayload>>(
        `/api/course-exams/course/${courseId}`,
      ),
    ),
  submitAttempt: (
    courseId: number,
    answers: Array<{
      questionId: string;
      selectedOptionIds: string[];
      answerText?: string;
    }>,
  ) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<CourseExamLearnerPayload["latestAttempt"]>>(
        `/api/course-exams/course/${courseId}/attempts`,
        { answers },
      ),
    ),

  getUserAccessOverview: (userId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<UserExamAccessOverview[]>>(
        `/api/course-exams/admin/users/${userId}/access-overrides`,
      ),
    ),

  upsertUserAccessOverride: (
    userId: number,
    data: {
      courseId: number;
      extraAttempts: number;
      bypassAttendanceRequirement?: boolean;
      note?: string;
    },
  ) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<UserExamAccessOverview[]>>(
        `/api/course-exams/admin/users/${userId}/access-overrides`,
        data,
      ),
    ),
};
