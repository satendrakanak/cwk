"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader } from "lucide-react";

import { testimonialClientService } from "@/services/testimonials/testimonial.client";
import { Paginated } from "@/types/api";
import { Testimonial, TestimonialType } from "@/types/testimonial";
import { TestimonialCard } from "./testimonial-card";

type InfiniteTestimonialsGridProps = {
  initialPage: Paginated<Testimonial>;
  pageSize: number;
  type?: TestimonialType;
  courseId?: number;
};

export function InfiniteTestimonialsGrid({
  initialPage,
  pageSize,
  type,
  courseId,
}: InfiniteTestimonialsGridProps) {
  const [testimonials, setTestimonials] = useState(initialPage.data);
  const [meta, setMeta] = useState(initialPage.meta);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = meta.currentPage < meta.totalPages;

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await testimonialClientService.getPublic({
        type,
        courseId,
        page: meta.currentPage + 1,
        limit: pageSize,
      });

      setTestimonials((current) => [...current, ...response.data.data]);
      setMeta(response.data.meta);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, hasMore, isLoading, meta.currentPage, pageSize, type]);

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

  if (!testimonials.length) {
    return (
      <div className="academy-card border-dashed p-10 text-center">
        <p className="text-sm font-semibold text-card-foreground">
          No testimonials found
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Try changing the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
            variant="featured"
          />
        ))}
      </div>

      <div ref={sentinelRef} className="flex min-h-12 items-center justify-center">
        {isLoading && (
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm">
            <Loader className="h-4 w-4 animate-spin text-primary" />
            Loading more testimonials
          </div>
        )}
      </div>
    </div>
  );
}
