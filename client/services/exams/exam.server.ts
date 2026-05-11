import { apiServer } from "@/lib/api/server";
import { ApiResponse, Paginated } from "@/types/api";
import { Exam, Question, QuestionBankCategory } from "@/types/exam";

type ExamQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  courseId?: number;
  facultyId?: number;
};

function withQuery(path: string, query?: ExamQuery) {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

export const examServerService = {
  getExams: (query?: ExamQuery) =>
    apiServer.get<ApiResponse<Paginated<Exam>>>(withQuery("/exams", query)),

  getExamById: (id: number) =>
    apiServer.get<ApiResponse<Exam>>(`/exams/${id}`),

  getQuestionBankCategories: (query?: ExamQuery) =>
    apiServer.get<ApiResponse<Paginated<QuestionBankCategory>>>(
      withQuery("/exams/question-bank/categories", query),
    ),

  getQuestions: (query?: ExamQuery) =>
    apiServer.get<ApiResponse<Paginated<Question>>>(
      withQuery("/exams/question-bank/questions", query),
    ),
};
