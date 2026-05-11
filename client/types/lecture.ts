import { Attachment } from "./attachment";
import { FileType } from "./file";

export interface LectureProgress {
  isCompleted: boolean;
  progress: number; // %
  lastTime: number; // seconds
}

export interface Lecture {
  id: number;
  chapterId: number;
  title: string;
  description?: string | null;
  video?: FileType | null;
  attachments?: Attachment[] | null;
  isFree: boolean;
  isPublished: boolean;
  position: number;
  isTemp?: boolean;
  progress?: LectureProgress;
}

export type CreateLecturePayload = {
  chapterId: number;
  title: string;
  description?: string;
  videoId?: number;
  isFree?: boolean;
  isPublished?: boolean;
};

export type UpdateLecturePayload = Partial<CreateLecturePayload>;

export type LectureReorderPayload = {
  items: {
    id: number;
    position: number;
  }[];
};

export interface UpdateLectureProgressPayload {
  lectureId: number;
  progress: number;
  lastTime: number;
}

export type LectureStats = {
  total: number;
  completed: number;
  totalSeconds: number;
};
