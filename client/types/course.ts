import { Category } from "./category";
import { Chapter } from "./chapter";
import { FileType } from "./file";
import { Tag } from "./tag";
import type { Testimonial } from "./testimonial";
import { User } from "./user";

export type CourseFaqItem = {
  question: string;
  answer: string;
};

export type CourseExamQuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type CourseExamQuestion = {
  id: string;
  prompt: string;
  type: "single" | "multiple" | "true_false" | "short_text" | "drag_drop";
  points: number;
  explanation?: string;
  options: CourseExamQuestionOption[];
  acceptedAnswers?: string[];
};

export type CourseExam = {
  title: string;
  description?: string;
  instructions?: string;
  passingPercentage: number;
  maxAttempts: number;
  timeLimitMinutes?: number | null;
  showResultImmediately: boolean;
  isPublished: boolean;
  questions: CourseExamQuestion[];
};

export type CourseExamAttemptQuestionResult = {
  questionId: string;
  prompt: string;
  selectedOptionIds: string[];
  correctOptionIds: string[];
  answerText?: string;
  acceptedAnswers?: string[];
  isCorrect: boolean;
  earnedPoints: number;
  totalPoints: number;
  explanation?: string;
};

export type CourseExamAttempt = {
  id: number;
  attemptNumber: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  submittedAt: string | null;
  createdAt: string;
  questionResults: CourseExamAttemptQuestionResult[];
};

export type CourseExamLearnerPayload = {
  exam: Omit<CourseExam, "questions"> & {
    questions: Array<{
      id: string;
      prompt: string;
      type: "single" | "multiple" | "true_false" | "short_text" | "drag_drop";
      points: number;
      explanation?: string;
      options: Array<{
        id: string;
        text: string;
      }>;
    }>;
  };
  attempts: CourseExamAttempt[];
  latestAttempt: CourseExamAttempt | null;
  passedAttempt: CourseExamAttempt | null;
  attemptsUsed: number;
  attemptsRemaining: number | null;
  canAttempt: boolean;
  isPassed: boolean;
  isUnlocked: boolean;
  unlockProgress: number;
  unlockMessage: string;
};

export type CreateCoursePayload = {
  title: string;
  slug?: string;

  description?: string;
  shortDescription?: string;

  imageId?: number;
  imageAlt?: string;
  videoId?: number;
  isFree?: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  priceInr?: string;
  priceUsd?: string;

  duration?: string;
  mode?: string;
  monthlyLiveClassLimit?: number | null;
  liveClassAttendanceRequirementType?: string | null;
  liveClassAttendanceRequirementValue?: number | null;

  certificate?: string;

  exams?: string;
  experienceLevel?: string;

  studyMaterial?: string;
  additionalBook?: string;

  language?: string;

  technologyRequirements?: string;
  eligibilityRequirements?: string;

  disclaimer?: string;
  faqs?: CourseFaqItem[];
  exam?: CourseExam | null;

  metaTitle?: string;
  metaSlug?: string;

  metaDescription?: string;

  categories?: number[];
  tags?: number[];
  facultyIds?: number[];
};

export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export type Course = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  image: FileType | null;
  imageAlt: string | null;
  video: FileType | null;
  isFree: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  priceInr: string | null;
  priceUsd: string | null;
  duration: string | null;
  mode: string | null;
  monthlyLiveClassLimit: number | null;
  liveClassAttendanceRequirementType: string | null;
  liveClassAttendanceRequirementValue: number | null;
  certificate: string | null;
  exams: string | null;
  experienceLevel: string | null;
  studyMaterial: string | null;
  additionalBook: string | null;
  language: string | null;
  technologyRequirements: string | null;
  eligibilityRequirements: string | null;
  disclaimer: string | null;
  faqs?: CourseFaqItem[];
  exam?: CourseExam | null;
  metaTitle: string | null;
  metaSlug: string | null;
  metaDescription: string | null;
  categories: Category[];
  tags: Tag[];
  isEnrolled?: boolean;
  progress: {
    isCompleted: boolean;
    progress: number;
    lastTime: number;
  };
  chapters: Chapter[];
  faculties: User[];
  testimonials?: Testimonial[];
  createdBy: User;
  updatedBy: User;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type PublishCheckResult = {
  canPublish: boolean;
  reasons: string[];
};
