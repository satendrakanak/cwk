import { User } from "./user";
import { Article } from "./article";

export type ArticleComment = {
  id: number;
  content: string;
  isPublished: boolean;
  user: User;
  article?: Article;
  parent?: ArticleComment | null;
  likedBy: User[];
  replies: ArticleComment[];
  createdAt: string;
  updatedAt: string;
};

export type CreateArticleCommentPayload = {
  content: string;
};
