"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";

import { CouponBulkClient } from "@/components/coupon/coupon-bulk-client";
import { courseClientService } from "@/services/courses/course.client";
import { Paginated } from "@/types/api";
import { Course } from "@/types/course";

type InfiniteCoursesGridProps = {
  initialPage: Paginated<Course>;
  pageSize: number;
};

export function InfiniteCoursesGrid({
  initialPage,
  pageSize,
}: InfiniteCoursesGridProps) {
  const [courses, setCourses] = useState(initialPage.data);
  const [meta, setMeta] = useState(initialPage.meta);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = meta.currentPage < meta.totalPages;

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await courseClientService.getPublicCourses({
        page: meta.currentPage + 1,
        limit: pageSize,
      });

      setCourses((current) => [...current, ...response.data.data]);
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

  return (
    <div className="space-y-10">
      <CouponBulkClient courses={courses} />

      <div ref={sentinelRef} className="flex min-h-12 items-center justify-center">
        {isLoading && (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm">
            <Loader className="h-4 w-4 animate-spin text-primary" />
            Loading more courses
          </div>
        )}
      </div>
    </div>
  );
}
