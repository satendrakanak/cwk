import { apiClient, withAuthRetry } from "@/lib/api/client";
import { ApiResponse, Paginated } from "@/types/api";
import {
  ArticleComment,
  CreateArticleCommentPayload,
} from "@/types/article-comment";

export const articleCommentClientService = {
  getByArticle: (
    articleId: number,
    params?: { page?: number; limit?: number; sort?: "recent" | "oldest" },
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.sort) searchParams.set("sort", params.sort);
    const query = searchParams.toString();

    return apiClient.get<ApiResponse<Paginated<ArticleComment>>>(
      `/api/article-comments/article/${articleId}${query ? `?${query}` : ""}`,
    );
  },

  getAll: () =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<ArticleComment[]>>("/api/article-comments"),
    ),

  getMineByArticle: (articleId: number) =>
    withAuthRetry(() =>
      apiClient.get<ApiResponse<ArticleComment[]>>(
        `/api/article-comments/article/${articleId}/mine`,
      ),
    ),

  create: (articleId: number, data: CreateArticleCommentPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<ArticleComment>>(
        `/api/article-comments/article/${articleId}`,
        data,
      ),
    ),

  reply: (commentId: number, data: CreateArticleCommentPayload) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<ArticleComment>>(
        `/api/article-comments/${commentId}/replies`,
        data,
      ),
    ),

  toggleLike: (commentId: number) =>
    withAuthRetry(() =>
      apiClient.post<ApiResponse<ArticleComment>>(
        `/api/article-comments/${commentId}/like`,
      ),
    ),

  update: (commentId: number, data: CreateArticleCommentPayload) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<ArticleComment>>(
        `/api/article-comments/${commentId}`,
        data,
      ),
    ),

  delete: (commentId: number) =>
    withAuthRetry(() =>
      apiClient.delete<ApiResponse<{ message: string }>>(
        `/api/article-comments/${commentId}`,
      ),
    ),

  setPublished: (commentId: number, isPublished: boolean) =>
    withAuthRetry(() =>
      apiClient.patch<ApiResponse<ArticleComment>>(
        `/api/article-comments/${commentId}/publish?isPublished=${isPublished}`,
      ),
    ),
};
