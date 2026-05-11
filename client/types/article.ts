import { Category } from "./category";
import { FileType } from "./file";
import { Tag } from "./tag";
import { User } from "./user";

export type CreateArticePayload = {
  title: string;
  slug: string;
};

export type UpdateArticlePayload = {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;

  featuredImageId?: number;
  imageAlt?: string;

  status?: "draft" | "published";

  metaTitle?: string;
  metaDescription?: string;
  metaSlug?: string;

  categoryIds?: number[];
  tagIds?: number[];
  auhorId?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
};

export type Article = {
  id: number;

  title: string;
  slug: string;

  excerpt: string | null;
  content: string;

  featuredImage: FileType | null;
  imageAlt: string | null;

  status: "draft" | "published";

  metaTitle: string | null;
  metaDescription: string | null;
  metaSlug: string | null;

  viewCount: number;
  readingTime: number | null;

  categories: Category[];
  tags: Tag[];

  author: User;
  createdBy: User;
  updatedBy: User;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type PublishCheckResult = {
  canPublish: boolean;
  reasons: string[];
};
