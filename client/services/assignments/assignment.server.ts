import { apiServer } from "@/lib/api/server";
import type { ApiResponse } from "@/types/api";
import type { Assignment, AssignmentSubmission } from "@/types/assignment";

type AssignmentQuery = {
  search?: string;
  status?: string;
  courseId?: number;
  facultyId?: number;
};

function withQuery(path: string, query?: AssignmentQuery) {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

export const assignmentServerService = {
  getAssignments: (query?: AssignmentQuery) =>
    apiServer.get<ApiResponse<Assignment[]>>(withQuery("/assignments", query)),

  getMyAssignments: () =>
    apiServer.get<ApiResponse<Assignment[]>>("/assignments/my"),

  getSubmissions: () =>
    apiServer.get<ApiResponse<AssignmentSubmission[]>>(
      "/assignments/submissions",
    ),
};
