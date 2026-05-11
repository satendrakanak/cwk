import { FileType } from "./file";

export interface Attachment {
  id: number;
  lectureId: number;
  name: string;
  file: FileType;
  isTemp?: boolean;
}

export type CreateAttachmentPayload = {
  lectureId: number;
  name: string;
  fileId: number;
};

export type UpdateAttachmentPayload = Partial<CreateAttachmentPayload>;
