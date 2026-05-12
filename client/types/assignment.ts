import type { Course } from "./course";
import type { User } from "./user";

export type AssignmentStatus = "draft" | "published" | "archived";
export type AssignmentSubmissionType = "text" | "link" | "file" | "mixed";
export type AssignmentSubmissionStatus =
  | "submitted"
  | "in_review"
  | "needs_changes"
  | "graded";

export type AssignmentSubmission = {
  id: number;
  status: AssignmentSubmissionStatus;
  text?: string | null;
  link?: string | null;
  attachmentIds: number[];
  score?: number | null;
  feedback?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  learner?: User;
  reviewedBy?: User | null;
  assignment?: Assignment;
};

export type Assignment = {
  id: number;
  title: string;
  description?: string | null;
  instructions?: string | null;
  course: Course;
  chapter?: { id: number; title: string } | null;
  lecture?: { id: number; title: string } | null;
  batch?: { id: number; name: string } | null;
  faculties?: User[];
  status: AssignmentStatus;
  submissionType: AssignmentSubmissionType;
  dueAt?: string | null;
  points?: number | null;
  allowResubmission: boolean;
  resourceIds: number[];
  submissions?: AssignmentSubmission[];
  createdAt: string;
  updatedAt: string;
};

export type AssignmentPayload = {
  title: string;
  description?: string;
  instructions?: string;
  courseId: number;
  facultyIds?: number[];
  status?: AssignmentStatus;
  submissionType?: AssignmentSubmissionType;
  dueAt?: string;
  points?: number;
  allowResubmission?: boolean;
  resourceIds?: number[];
};

export type SubmitAssignmentPayload = {
  text?: string;
  link?: string;
  attachmentIds?: number[];
};

export type ReviewAssignmentPayload = {
  status: AssignmentSubmissionStatus;
  score?: number;
  feedback?: string;
};
