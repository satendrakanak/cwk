import { FileType } from "./file";

export type CategoryType = "course" | "article";

export type CreateCategoryPayload = {
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
  imageId?: number;
  imageAlt?: string;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

export type Category = {
  id: number;
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
  image?: FileType | null;
  imageAlt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryQueryParams = {
  page?: number;
  limit?: number;
};
