import { apiServer } from "@/lib/api/server";
import type { ApiResponse } from "@/types/api";
import type {
  FacultyClassSession,
  FacultyClassRecording,
  FacultyCourseBatch,
  FacultyExamAttempt,
  FacultyWorkspaceData,
} from "@/types/faculty-workspace";

export const facultyWorkspaceServer = {
  async getWorkspace() {
    const response =
      await apiServer.get<ApiResponse<FacultyWorkspaceData>>("/faculty/workspace");

    return response.data;
  },

  async getBatches() {
    const response =
      await apiServer.get<ApiResponse<FacultyCourseBatch[]>>("/faculty/batches");

    return response.data;
  },

  async getCourses() {
    const response =
      await apiServer.get<ApiResponse<FacultyWorkspaceData["courses"]>>(
        "/faculty/courses",
      );

    return response.data;
  },

  async getSessions() {
    const response =
      await apiServer.get<ApiResponse<FacultyClassSession[]>>("/faculty/sessions");

    return response.data;
  },

  async getRecordings() {
    const response =
      await apiServer.get<ApiResponse<FacultyClassRecording[]>>(
        "/faculty/recordings",
      );

    return response.data;
  },

  async getExamAttempts() {
    const response =
      await apiServer.get<ApiResponse<FacultyExamAttempt[]>>(
        "/faculty/exam-attempts",
      );

    return response.data;
  },

  async getMySessions() {
    const response =
      await apiServer.get<ApiResponse<FacultyClassSession[]>>(
        "/class-sessions/my",
      );

    return response.data;
  },

  async getMyRecordings() {
    const response =
      await apiServer.get<ApiResponse<FacultyClassRecording[]>>(
        "/class-sessions/my/recordings",
      );

    return response.data;
  },
};
