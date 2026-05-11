import type { Course } from "./course";
import { FileType } from "./file";

export type Permission = {
  id: number;
  name: string;
};

export type Role = {
  id: number;
  name: string;
  permissions?: Permission[];
};

export type UserProfile = {
  id: number;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  isPublic: boolean;
  showCourses: boolean;
  showCertificates: boolean;
  location?: string;
  website?: string;
  headline?: string;
  company?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
};
export type FacultyProfile = {
  id: number;
  expertise?: string;
  experience?: string;
  designation?: string;
  linkedin: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  isApproved: boolean;
};

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  username: string;
  avatar: FileType | null;
  coverImage: FileType | null;
  avatarUrl: string | null;
  canRequestRefund: boolean;

  roles?: Role[];

  profile: UserProfile;
  facultyProfile: FacultyProfile;
  taughtCourses?: Course[];

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CreateUserPayload = {
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  password: string;
  username?: string;
  roleIds?: number[];
};

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  avatarId?: number;
  coverImageId?: number;
  roleIds?: number[];
  canRequestRefund?: boolean;
};

export type UpdateProfilePayload = {
  bio?: string;
  isPublic?: boolean;
  showCourses?: boolean;
  showCertificates?: boolean;
  location?: string;
  website?: string;
  headline?: string;
  company?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
};

export type UpdateFacultyProfilePayload = {
  expertise?: string;
  experience?: string;
  designation?: string;
  linkedin?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  isApproved?: boolean;
};

export type CreateBulkUsersPayload = {
  users: CreateUserPayload[];
};

export type UsersQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: number;
  includeDeleted?: boolean;
  startDate?: string;
  endDate?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type DashboardStats = {
  courses: number;
  completed: number;
  progress: number;
  examsTaken: number;
  examsPassed: number;
  certificatesEarned: number;
  learningSummary?: LearningSummary;
};

export type LearningCourseSummary = {
  courseId: number;
  title: string;
  slug: string;
  mode: string;
  overallProgress: number;
  recorded: {
    enabled: boolean;
    totalLectures: number;
    completedLectures: number;
    progress: number;
  };
  live: {
    enabled: boolean;
    completedClasses: number;
    attendedClasses: number;
    missedClasses: number;
    upcomingClasses: number;
    progress: number;
  };
};

export type LearningSummary = {
  totalCourses: number;
  completedCourses: number;
  averageProgress: number;
  recordedCourses: number;
  liveCourses: number;
  upcomingLiveClasses: number;
  completedLiveClasses: number;
  attendedLiveClasses: number;
  missedLiveClasses: number;
  courses: LearningCourseSummary[];
};

export type WeeklyProgress = {
  day: string;
  progress: number;
};

export type PublicCertificateSummary = {
  id: number;
  certificateNumber: string;
  issuedAt: string;
  course: {
    id: number;
    title: string;
    slug: string;
  };
};

export type PublicProfileBundle = {
  user: User;
  stats: DashboardStats;
  weeklyProgress: WeeklyProgress[];
  courses: Course[];
  certificates: PublicCertificateSummary[];
  examHistory: Array<{
    courseId: number;
    courseTitle: string;
    courseSlug: string;
    attempts: number;
    bestPercentage: number;
    latestPercentage: number;
    passed: boolean;
  }>;
};
