"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";

import { CouponBulkClient } from "@/components/coupon/coupon-bulk-client";
import { courseClientService } from "@/services/courses/course.client";
import { Paginated } from "@/types/api";
import { Course } from "@/types/course";
import type { CourseDeliveryMode } from "@/types/license";

type InfiniteCoursesGridProps = {
  initialPage: Paginated<Course>;
  pageSize: number;
  mode?: string;
  category?: string;
  tag?: string;
  allowedModes?: CourseDeliveryMode[];
};

export function InfiniteCoursesGrid({
  initialPage,
  pageSize,
  mode,
  category,
  tag,
  allowedModes = ["self_learning", "faculty_led", "hybrid"],
}: InfiniteCoursesGridProps) {
  const filterAllowedCourses = useCallback(
    (items: Course[]) =>
      items.filter((course) =>
        allowedModes.includes(
          (course.mode || "self_learning") as CourseDeliveryMode,
        ),
      ),
    [allowedModes],
  );
  const [courses, setCourses] = useState(() =>
    filterAllowedCourses(initialPage.data),
  );
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
        mode,
        category,
        tag,
      });

      setCourses((current) => [
        ...current,
        ...filterAllowedCourses(response.data.data),
      ]);
      setMeta(response.data.meta);
    } finally {
      setIsLoading(false);
    }
  }, [
    category,
    filterAllowedCourses,
    hasMore,
    isLoading,
    meta.currentPage,
    mode,
    pageSize,
    tag,
  ]);

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
      {courses.length ? (
        <CouponBulkClient courses={courses} />
      ) : (
        <div className="academy-card border-dashed p-10 text-center">
          <p className="text-sm font-semibold text-card-foreground">
            No courses found
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try another format, topic, or skill filter.
          </p>
        </div>
      )}

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
