export type FileType = {
  id: number;
  name: string;
  path: string;
  type: string;
  mime: string;
  size: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

export type UploadingFile = {
  file: File;
  preview: string;
  progress: number;
  uploading: boolean;
};

export type PreviewType = "image" | "video" | "file";

export interface InitUploadResponse {
  uploadId: number;
  url: string;
  key: string;
}
