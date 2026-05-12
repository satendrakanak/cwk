import { apiClient, withAuthRetry } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  Assignment,
  AssignmentPayload,
  AssignmentSubmission,
  ReviewAssignmentPayload,
  SubmitAssignmentPayload,
} from "@/types/assignment";

export const assignmentClientService = {
  create: (data: AssignmentPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<Assignment>>("/api/assignments", data),
    ),

  update: (id: number, data: Partial<AssignmentPayload>) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<Assignment>>(`/api/assignments/${id}`, data),
    ),

  delete: (id: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/assignments/${id}`,
      ),
    ),

  submit: (id: number, data: SubmitAssignmentPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<AssignmentSubmission>>(
        `/api/assignments/${id}/submissions`,
        data,
      ),
    ),

  reviewSubmission: (id: number, data: ReviewAssignmentPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<AssignmentSubmission>>(
        `/api/assignments/submissions/${id}/review`,
        data,
      ),
    ),
};
