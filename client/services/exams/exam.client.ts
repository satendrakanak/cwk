import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse, Paginated } from "@/types/api";
import {
  CreateExamPayload,
  CreateQuestionBankCategoryPayload,
  CreateQuestionPayload,
  Exam,
  LearnerCourseExamPayload,
  LearnerExamAttempt,
  Question,
  QuestionBankCategory,
  ReplaceExamQuestionRulesPayload,
  UpdateExamPayload,
  UpdateQuestionPayload,
  UpdateQuestionBankCategoryPayload,
} from "@/types/exam";

export const examClientService = {
  getExams: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<Paginated<Exam>>>("/api/exams"),
    ),

  getCourseExamForLearner: (courseId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<LearnerCourseExamPayload>>(
        `/api/exams/course/${courseId}/learner`,
      ),
    ),

  startCourseExamAttempt: (courseId: number) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<LearnerExamAttempt>>(
        `/api/exams/course/${courseId}/attempts/start`,
      ),
    ),

  submitExamAttempt: (
    attemptId: number,
    answers: { questionId: number; answer: unknown }[],
    autoSubmitted?: boolean,
  ) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<LearnerExamAttempt>>(
        `/api/exams/attempts/${attemptId}/submit`,
        { answers, autoSubmitted },
      ),
    ),

  createExam: (data: CreateExamPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Exam>>("/api/exams", data),
    ),

  updateExam: (id: number, data: UpdateExamPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Exam>>(`/api/exams/${id}`, data),
    ),

  replaceQuestionRules: (id: number, data: ReplaceExamQuestionRulesPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Exam>>(`/api/exams/${id}/question-rules`, data),
    ),

  deleteExam: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ deleted: boolean; id: number }>>(
        `/api/exams/${id}`,
      ),
    ),

  createCategory: (data: CreateQuestionBankCategoryPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<QuestionBankCategory>>(
        "/api/exams/question-bank/categories",
        data,
      ),
    ),

  updateCategory: (id: number, data: UpdateQuestionBankCategoryPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<QuestionBankCategory>>(
        `/api/exams/question-bank/categories/${id}`,
        data,
      ),
    ),

  deleteCategory: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ deleted: boolean; id: number }>>(
        `/api/exams/question-bank/categories/${id}`,
      ),
    ),

  createQuestion: (data: CreateQuestionPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Question>>(
        "/api/exams/question-bank/questions",
        data,
      ),
    ),

  updateQuestion: (id: number, data: UpdateQuestionPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Question>>(
        `/api/exams/question-bank/questions/${id}`,
        data,
      ),
    ),

  deleteQuestion: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ deleted: boolean; id: number }>>(
        `/api/exams/question-bank/questions/${id}`,
      ),
    ),
};
