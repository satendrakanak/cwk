import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import {
  CourseAnswer,
  CourseQuestion,
  CreateCourseAnswerPayload,
  CreateCourseQuestionPayload,
} from "@/types/course-qa";

export const courseQaClientService = {
  getByCourse: (courseId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<CourseQuestion[]>>(
        `/api/course-qa/course/${courseId}`,
      ),
    ),

  getAllQuestions: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<CourseQuestion[]>>("/api/course-qa/questions"),
    ),

  getAllAnswers: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<CourseAnswer[]>>("/api/course-qa/answers"),
    ),

  createQuestion: (courseId: number, data: CreateCourseQuestionPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<CourseQuestion>>(
        `/api/course-qa/course/${courseId}/questions`,
        data,
      ),
    ),

  createAnswer: (questionId: number, data: CreateCourseAnswerPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<CourseAnswer>>(
        `/api/course-qa/questions/${questionId}/answers`,
        data,
      ),
    ),

  updateQuestion: (questionId: number, data: CreateCourseQuestionPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<CourseQuestion>>(
        `/api/course-qa/questions/${questionId}`,
        data,
      ),
    ),

  updateAnswer: (answerId: number, data: CreateCourseAnswerPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<CourseAnswer>>(
        `/api/course-qa/answers/${answerId}`,
        data,
      ),
    ),

  deleteQuestion: (questionId: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/course-qa/questions/${questionId}`,
      ),
    ),

  deleteAnswer: (answerId: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/course-qa/answers/${answerId}`,
      ),
    ),

  acceptAnswer: (answerId: number) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<CourseAnswer>>(
        `/api/course-qa/answers/${answerId}/accept`,
      ),
    ),

  setQuestionPublished: (questionId: number, isPublished: boolean) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<CourseQuestion>>(
        `/api/course-qa/questions/${questionId}/publish?isPublished=${isPublished}`,
      ),
    ),

  setAnswerPublished: (answerId: number, isPublished: boolean) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<CourseAnswer>>(
        `/api/course-qa/answers/${answerId}/publish?isPublished=${isPublished}`,
      ),
    ),
};
