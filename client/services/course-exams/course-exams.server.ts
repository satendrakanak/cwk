import { apiServer } from "@/lib/api/server";
import { ApiResponse } from "@/types/api";
import {
  AdminExamOverview,
  ExamHistoryRecord,
  UserExamAccessOverview,
} from "@/types/exam";

type DateRangeQuery = {
  startDate?: string;
  endDate?: string;
};

function withQuery(path: string, query?: DateRangeQuery) {
  const params = new URLSearchParams();

  if (query?.startDate) params.set("startDate", query.startDate);
  if (query?.endDate) params.set("endDate", query.endDate);

  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

export const courseExamsServerService = {
  getMyHistory: (query?: DateRangeQuery) =>
    apiServer.get<ApiResponse<ExamHistoryRecord[]>>(
      withQuery("/course-exams/my-history", query),
    ),

  getAdminOverview: () =>
    apiServer.get<ApiResponse<AdminExamOverview>>(
      "/course-exams/admin-overview",
    ),

  getUserAccessOverview: (userId: number) =>
    apiServer.get<ApiResponse<UserExamAccessOverview[]>>(
      `/course-exams/admin/users/${userId}/access-overrides`,
    ),
};
