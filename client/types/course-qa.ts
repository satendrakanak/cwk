import { User } from "./user";
import { Course } from "./course";

export type CourseAnswer = {
  id: number;
  body: string;
  isAccepted: boolean;
  isPublished: boolean;
  user: User;
  question?: CourseQuestion;
  createdAt: string;
  updatedAt: string;
};

export type CourseQuestion = {
  id: number;
  title: string;
  body: string;
  isResolved: boolean;
  isPublished: boolean;
  user: User;
  course?: Course;
  answers: CourseAnswer[];
  createdAt: string;
  updatedAt: string;
};

export type CreateCourseQuestionPayload = {
  title: string;
  body: string;
};

export type CreateCourseAnswerPayload = {
  body: string;
};
