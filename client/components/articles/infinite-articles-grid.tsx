"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";

import { ArticleCard } from "@/components/articles/article-card";
import { articleClientService } from "@/services/articles/article.client";
import { Article } from "@/types/article";
import { Paginated } from "@/types/api";

type InfiniteArticlesGridProps = {
  initialPage: Paginated<Article>;
  pageSize: number;
  category?: string;
  tag?: string;
};

export function InfiniteArticlesGrid({
  initialPage,
  pageSize,
  category,
  tag,
}: InfiniteArticlesGridProps) {
  const [articles, setArticles] = useState(initialPage.data);
  const [meta, setMeta] = useState(initialPage.meta);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = meta.currentPage < meta.totalPages;

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await articleClientService.getPublicArticles({
        page: meta.currentPage + 1,
        limit: pageSize,
        category,
        tag,
      });

      setArticles((current) => [...current, ...response.data.data]);
      setMeta(response.data.meta);
    } finally {
      setIsLoading(false);
    }
  }, [category, hasMore, isLoading, meta.currentPage, pageSize, tag]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void loadNextPage();
        }
      },
      { rootMargin: "420px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  if (!articles.length) {
    return (
      <div className="academy-card border-dashed p-10 text-center">
        <p className="text-sm font-semibold text-card-foreground">
          No articles found
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Try another topic or come back when more articles are published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      <div ref={sentinelRef} className="flex min-h-12 items-center justify-center">
        {isLoading && (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm">
            <Loader className="h-4 w-4 animate-spin text-primary" />
            Loading more articles
          </div>
        )}
      </div>
    </div>
  );
}
