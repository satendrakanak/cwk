import { User } from "./user";

export type FacultyReview = {
  id: number;
  rating: number;
  comment: string | null;
  isPublished: boolean;
  user: User;
  faculty?: User;
  createdAt: string;
  updatedAt: string;
};

export type FacultyReviewSummary = {
  average: number;
  total: number;
  breakdown: { rating: number; count: number }[];
};

export type CreateFacultyReviewPayload = {
  rating: number;
  comment?: string;
};
