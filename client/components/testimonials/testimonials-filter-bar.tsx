"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition } from "react";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TestimonialCourseOption = {
  id: number;
  title: string;
};

const selectTriggerClass =
  "h-11 w-full rounded-full border-border bg-background/80 px-4 text-sm font-semibold text-foreground shadow-none transition hover:border-primary/35 hover:bg-primary/5 focus:ring-primary/20 sm:w-56";

const selectContentClass =
  "rounded-2xl border-border bg-popover p-1 shadow-[0_20px_55px_rgba(15,23,42,0.18)]";

export const TestimonialsFilterBar = ({
  courses,
}: {
  courses: TestimonialCourseOption[];
}) => {
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
        <Select
          value={searchParams.get("type") || "all"}
          onValueChange={(value) => updateFilters({ type: value })}
        >
          <SelectTrigger
            aria-label="Filter by testimonial type"
            className={selectTriggerClass}
          >
            <SelectValue placeholder="All Types" />
          </SelectTrigger>

          <SelectContent className={selectContentClass}>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="TEXT">Text Testimonials</SelectItem>
            <SelectItem value="VIDEO">Video Testimonials</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("courseId") || "all"}
          onValueChange={(value) => updateFilters({ courseId: value })}
        >
          <SelectTrigger
            aria-label="Filter by course"
            className={`${selectTriggerClass} sm:w-72`}
          >
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>

          <SelectContent className={selectContentClass}>
            <SelectItem value="all">All Courses</SelectItem>

            {courses.map((course) => (
              <SelectItem key={course.id} value={String(course.id)}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
