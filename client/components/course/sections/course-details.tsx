"use client";

import { useState } from "react";
import {
  Monitor,
  Award,
  ClipboardList,
  Clock,
  BarChart,
  BookOpen,
  Book,
  Languages,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Course } from "@/types/course";

interface CourseDetailsProps {
  course: Course;
}

export const CourseDetails = ({ course }: CourseDetailsProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const items = [
    {
      label: "Course Type",
      value: "100% Online Courses",
      icon: Monitor,
    },
    {
      label: "Certificate",
      value: course.certificate || "Course completion certificate provided",
      icon: Award,
    },
    {
      label: "Exams",
      value: course.exams || "Exam conducted after course completion",
      icon: ClipboardList,
    },
    {
      label: "Duration",
      value: course.duration || "N/A",
      icon: Clock,
    },
    {
      label: "Experience Level",
      value: course.experienceLevel || "No prior experience required",
      icon: BarChart,
    },
    {
      label: "Study Material",
      value: "Included in the course",
      icon: BookOpen,
    },
    {
      label: "Additional Book",
      value: "Everyday Ayurveda : Daily Habits That Can Change Your Life",
      icon: Book,
    },
    {
      label: "Language",
      value: course.language || "English - Hindi",
      icon: Languages,
    },
  ];

  return (
    <div className="academy-card p-5 md:p-6">
      <div className="mb-5 border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-card-foreground">
          Course Details
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Important information about course format, level, certificate, and
          learning resources.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isExpanded = expandedIndex === index;
          const isLong = item.value.length > 80;

          return (
            <div
              key={item.label}
              className="group rounded-2xl border border-border bg-muted/50 p-4 transition-all duration-300 hover:border-primary/25 hover:bg-primary/5 hover:shadow-[0_14px_40px_color-mix(in_oklab,var(--primary)_12%,transparent)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5 stroke-[1.9]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </p>

                  <p className="text-sm font-medium leading-6 text-card-foreground">
                    {isExpanded
                      ? item.value
                      : isLong
                        ? `${item.value.slice(0, 80)}...`
                        : item.value}
                  </p>

                  {isLong && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedIndex(isExpanded ? null : index)
                      }
                      className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      {isExpanded ? "Show less" : "Show more"}

                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
