import { Course } from "./course";
import { FileType } from "./file";
import { User } from "./user";

export type Certificate = {
  id: number;
  certificateNumber: string;
  issuedAt: string;
  emailedAt: string | null;
  file: FileType | null;
  course: Pick<Course, "id" | "title" | "slug">;
  user: Pick<User, "id" | "firstName" | "lastName" | "email">;
};

export type AdminCertificateStatus =
  | "issued"
  | "ready_to_generate"
  | "exam_pending"
  | "course_incomplete";

export type AdminCertificateRow = {
  id: number;
  enrolledAt: string;
  learner: Pick<User, "id" | "firstName" | "lastName" | "email">;
  course: Pick<Course, "id" | "title" | "slug">;
  progress: number;
  totalLectures: number;
  completedLectures: number;
  examRequired: boolean;
  examPassed: boolean;
  courseCompleted: boolean;
  status: AdminCertificateStatus;
  actionHint: string;
  certificate: Certificate | null;
};

export type AdminCertificateDashboard = {
  summary: {
    enrolledLearners: number;
    issuedCertificates: number;
    readyToGenerate: number;
    examPending: number;
    courseIncomplete: number;
  };
  rows: AdminCertificateRow[];
};
