import { User } from "./user";
import { Course } from "./course";

export type CourseReview = {
  id: number;
  rating: number;
  comment: string | null;
  isPublished: boolean;
  user: User;
  course?: Course;
  createdAt: string;
  updatedAt: string;
};

export type CourseReviewSummary = {
  average: number;
  total: number;
  breakdown: { rating: number; count: number }[];
};

export type CreateCourseReviewPayload = {
  rating: number;
  comment?: string;
};
