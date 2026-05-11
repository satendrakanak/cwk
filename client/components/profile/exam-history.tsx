"use client";

import Link from "next/link";
import {
  BadgeCheck,
  ClipboardCheck,
  MoveRight,
  RotateCcw,
  Trophy,
} from "lucide-react";

import { ExamHistoryRecord } from "@/types/exam";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/formate-date";

export function ExamHistory({ records }: { records: ExamHistoryRecord[] }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Final Exam History
          </p>

          <h3 className="mt-2 text-2xl font-semibold text-card-foreground">
            Track every exam you have attempted
          </h3>
        </div>

        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Review your latest exam scores, attempt counts, and cleared courses in
          one place.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-muted/50 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <ClipboardCheck className="h-8 w-8" />
          </div>

          <h4 className="mt-5 text-xl font-semibold text-card-foreground">
            No final exam attempts yet
          </h4>

          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
            Complete your course lessons and take the final exam when it
            unlocks. Your results will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {records.map((record) => (
            <article
              key={record.course.id}
              className="academy-card p-5 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_26px_80px_color-mix(in_oklab,var(--primary)_12%,transparent)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                    {record.attemptsCount} attempt
                    {record.attemptsCount > 1 ? "s" : ""}
                  </p>

                  <h4 className="mt-2 line-clamp-2 text-lg font-semibold leading-7 text-card-foreground">
                    {record.course.title}
                  </h4>
                </div>

                <ExamStatusBadge passed={record.passed} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Metric
                  icon={ClipboardCheck}
                  label="Latest Score"
                  value={`${record.latestScore}/${record.latestMaxScore}`}
                />

                <Metric
                  icon={RotateCcw}
                  label="Latest %"
                  value={`${record.latestPercentage}%`}
                  featured
                />

                <Metric
                  icon={Trophy}
                  label="Best Score"
                  value={`${record.bestScore}%`}
                />
              </div>

              <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-border bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Last attempted
                  </p>

                  <p className="mt-1 text-sm font-semibold text-card-foreground">
                    {formatDateTime(record.lastAttemptedAt)}
                  </p>
                </div>

                <Link
                  href={`/course/${record.course.slug}/learn`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Open course
                  <MoveRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ExamStatusBadge({ passed }: { passed: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border px-3 text-xs font-bold uppercase tracking-[0.14em]",
        passed
          ? "border-primary/15 bg-primary/10 text-primary"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      {passed ? (
        <BadgeCheck className="h-4 w-4" />
      ) : (
        <ClipboardCheck className="h-4 w-4" />
      )}

      {passed ? "Passed" : "In Progress"}
    </span>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  featured = false,
}: {
  icon: typeof ClipboardCheck;
  label: string;
  value: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3",
        featured
          ? "border-primary/15 bg-primary/10"
          : "border-border bg-muted/50",
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-primary ring-1 ring-primary/15">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0">
        <p className="text-lg font-semibold leading-none text-card-foreground">
          {value}
        </p>

        <p
          className={cn(
            "mt-1.5 line-clamp-1 text-[10px] font-bold uppercase tracking-[0.14em]",
            featured ? "text-primary" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
