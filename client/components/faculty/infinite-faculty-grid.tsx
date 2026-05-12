"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";

import { userClientService } from "@/services/users/user.client";
import { Paginated } from "@/types/api";
import { User } from "@/types/user";
import { FacultyGrid } from "./faculty-grid";

type InfiniteFacultyGridProps = {
  initialPage: Paginated<User>;
  pageSize: number;
};

export function InfiniteFacultyGrid({
  initialPage,
  pageSize,
}: InfiniteFacultyGridProps) {
  const [faculties, setFaculties] = useState(initialPage.data);
  const [meta, setMeta] = useState(initialPage.meta);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = meta.currentPage < meta.totalPages;

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await userClientService.getFacultyPage({
        page: meta.currentPage + 1,
        limit: pageSize,
      });

      setFaculties((current) => [...current, ...response.data.data]);
      setMeta(response.data.meta);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, meta.currentPage, pageSize]);

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

  if (!faculties.length) {
    return (
      <div className="academy-card border-dashed p-10 text-center">
        <p className="text-sm font-semibold text-card-foreground">
          No instructor profiles found
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Instructor profiles will appear here once they are added.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <FacultyGrid faculties={faculties} />

      <div ref={sentinelRef} className="flex min-h-12 items-center justify-center">
        {isLoading && (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm">
            <Loader className="h-4 w-4 animate-spin text-primary" />
            Loading more faculty
          </div>
        )}
      </div>
    </div>
  );
}
