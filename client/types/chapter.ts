import { Lecture } from "./lecture";

export interface Chapter {
  id: number;
  courseId: number;
  title: string;
  description?: string | null;
  lectures: Lecture[];
  isFree: boolean;
  isPublished: boolean;
  isTemp?: boolean;
  position: number;
}

export type CreateChapterPayload = {
  courseId: number;
  title: string;
  description?: string;
  isFree?: boolean;
  isPublished?: boolean;
};

export type UpdateChapterPayload = Partial<CreateChapterPayload>;

export type ChapterReorderPayload = {
  items: {
    id: number;
    position: number;
  }[];
};
