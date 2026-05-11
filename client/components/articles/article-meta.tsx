"use client";

import { CalendarDays, Clock, UserRound } from "lucide-react";

import { Article } from "@/types/article";
import { formatDate } from "@/utils/formate-date";

export function ArticleMeta({ article }: { article: Article }) {
  const publishedDate = article.publishedAt
    ? formatDate(article.publishedAt)
    : null;

  return (
    <div className="academy-card my-6 flex flex-wrap items-center gap-2 p-3 text-sm">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-2 font-semibold text-primary">
        <UserRound className="h-4 w-4" />
        By {article.author?.firstName || "Admin"}
      </span>

      {publishedDate && (
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2 font-medium text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          {publishedDate}
        </span>
      )}

      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2 font-medium text-muted-foreground">
        <Clock className="h-4 w-4 text-primary" />
        {article.readingTime ? `${article.readingTime} min read` : "Article"}
      </span>
    </div>
  );
}
