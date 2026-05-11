"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Course } from "@/types/course";

export const TestimonialsFilterBar = ({ courses }: { courses: Course[] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilters = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (!value || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
    });
  };

  const hasFilters =
    Boolean(searchParams.get("type")) || Boolean(searchParams.get("courseId"));

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <SlidersHorizontal className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-card-foreground">
            Filter testimonials
          </p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Browse written reviews or watch video stories course-wise.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <NativeSelect
          aria-label="Filter by testimonial type"
          className="h-11 w-full rounded-full border-border bg-muted px-4 text-sm font-medium text-foreground shadow-none focus:ring-primary sm:w-52"
          value={searchParams.get("type") || "all"}
          onChange={(event) => updateFilters({ type: event.target.value })}
        >
          <NativeSelectOption value="all">All Types</NativeSelectOption>
          <NativeSelectOption value="TEXT">
            Text Testimonials
          </NativeSelectOption>
          <NativeSelectOption value="VIDEO">
            Video Testimonials
          </NativeSelectOption>
        </NativeSelect>

        <NativeSelect
          aria-label="Filter by course"
          className="h-11 w-full rounded-full border-border bg-muted px-4 text-sm font-medium text-foreground shadow-none focus:ring-primary sm:w-72"
          value={searchParams.get("courseId") || "all"}
          onChange={(event) => updateFilters({ courseId: event.target.value })}
        >
          <NativeSelectOption value="all">All Courses</NativeSelectOption>

          {courses.map((course) => (
            <NativeSelectOption key={course.id} value={String(course.id)}>
              {course.title}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <Button
          type="button"
          variant="outline"
          disabled={!hasFilters}
          className="h-11 rounded-full border-border bg-background px-5 font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          onClick={() =>
            startTransition(() => {
              router.push(pathname);
            })
          }
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};
