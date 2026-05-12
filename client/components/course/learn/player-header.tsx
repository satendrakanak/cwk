"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { WebsiteNavUser } from "@/components/auth/website-nav-user";
import Logo from "@/components/logo";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { getCourseProgress } from "@/helpers/course-progress";
import { Course } from "@/types/course";

interface Props {
  course: Course;
}

export const PlayerHeader = ({ course }: Props) => {
  const { total, completed, percent } = getCourseProgress(course);

  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 text-card-foreground shadow-sm sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-4">
        <div className="shrink-0">
          <Logo />
        </div>

        <div className="hidden h-5 w-px bg-border sm:block" />

        <h2 className="hidden max-w-75 truncate text-sm font-medium text-muted-foreground sm:block">
          {course.title}
        </h2>
      </div>

      <div className="relative z-50 flex min-w-0 items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2 py-1 transition-colors hover:border-primary/25 hover:bg-primary/10 sm:gap-2"
          aria-expanded={open}
        >
          <ProgressCircle percent={percent} />

          <span className="hidden whitespace-nowrap text-xs font-semibold text-muted-foreground sm:inline">
            Your progress
          </span>

          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>

        {open && (
          <div className="absolute right-0 top-11 z-99999 w-64 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-[0_24px_80px_color-mix(in_oklab,var(--foreground)_18%,transparent)] sm:right-14 sm:top-12">
            <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 border-l border-t border-border bg-popover" />

            <p className="text-sm font-semibold text-popover-foreground">
              {percent}% completed
            </p>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {completed} of {total} lectures completed
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Finish course to get your certificate.
            </p>
          </div>
        )}

        <WebsiteNavUser />
      </div>
    </header>
  );
};
