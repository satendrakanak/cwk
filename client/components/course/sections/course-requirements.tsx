"use client";

import { Course } from "@/types/course";
import { Check, Info } from "lucide-react";

interface CourseRequirementsProps {
  course: Course;
}

const parseToArray = (value?: string): string[] => {
  if (!value) return [];

  return value
    .split("#")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const CourseRequirements = ({ course }: CourseRequirementsProps) => {
  const sections = [
    {
      title: "Technology Requirement",
      items: parseToArray(course.technologyRequirements!),
      fallback: ["Laptop and high speed internet."],
    },
    {
      title: "Eligibility Requirements",
      items: parseToArray(course.eligibilityRequirements!),
      fallback: ["Anybody with a zeal for healthy nutrition."],
    },
    {
      title: "Disclaimer",
      items: parseToArray(course.disclaimer!),
      fallback: ["Not for clinical practice."],
    },
  ];

  return (
    <div className="academy-card p-5 md:p-6">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-card-foreground">
          Course Requirements
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Review the requirements, eligibility, and important notes before
          starting this course.
        </p>
      </div>

      <div className="space-y-5">
        {sections.map((section) => {
          const items = section.items.length ? section.items : section.fallback;

          return (
            <div
              key={section.title}
              className="rounded-2xl border border-border bg-muted/50 p-4"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <Info className="h-5 w-5" />
                </div>

                <h3 className="text-base font-semibold text-card-foreground">
                  {section.title}
                </h3>
              </div>

              <div className="grid gap-3">
                {items.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/25 hover:bg-primary/5"
                  >
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-4 w-4 stroke-3" />
                    </div>

                    <p className="text-sm leading-6 text-muted-foreground">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
