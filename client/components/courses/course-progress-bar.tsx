"use client";

import Link from "next/link";
import { hasLiveClasses, hasRecordedLearning } from "@/lib/course-delivery";

interface CourseProgressBarProps {
  percent: number;
  slug: string;
  mode?: string | null;
}

export function CourseProgressBar({ percent, slug, mode }: CourseProgressBarProps) {
  const recordedLearning = hasRecordedLearning({ mode });
  const liveClasses = hasLiveClasses({ mode });
  const label = liveClasses && !recordedLearning
    ? "Open classroom →"
    : percent > 0
      ? "Continue Learning →"
      : "Start Learning →";

  return (
    <div className="mt-auto space-y-3 ">
      {recordedLearning ? (
        <div>
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{percent}%</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
          Live classes, batch schedule, and faculty sessions are managed in your
          classroom.
        </div>
      )}
      <Link href={`/course/${slug}/learn`}>
        <span className="text-sm font-medium text-primary">
          {label}
        </span>
      </Link>
    </div>
  );
}
