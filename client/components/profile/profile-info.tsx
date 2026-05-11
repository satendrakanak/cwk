"use client";

import { Award, BookOpenCheck, ClipboardCheck, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { DashboardStats } from "@/types/user";

interface ProfileInfoProps {
  name: string;
  email?: string;
  stats?: DashboardStats;
}

export function ProfileInfo({ name, email, stats }: ProfileInfoProps) {
  const statItems = stats
    ? [
        {
          label: "Courses Completed",
          value: `${stats.completed || 0}/${stats.courses || 0}`,
          icon: BookOpenCheck,
          featured: false,
        },
        {
          label: "Exam Attempts",
          value: stats.examsTaken || 0,
          icon: ClipboardCheck,
          featured: false,
        },
        {
          label: "Progress",
          value: `${stats.progress || 0}%`,
          icon: TrendingUp,
          featured: true,
        },
        {
          label: "Certificates",
          value: stats.certificatesEarned || 0,
          icon: Award,
          featured: false,
        },
      ]
    : [];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">
          Learner Profile
        </p>

        <h1 className="mt-2 wrap-break-word text-2xl font-semibold tracking-tight text-card-foreground md:text-4xl">
          {name || "Learner"}
        </h1>

        {email ? (
          <p className="mt-2 wrap-break-word text-sm text-muted-foreground md:text-base">
            {email}
          </p>
        ) : null}
      </div>

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
                  item.featured
                    ? "border-primary/20 bg-primary/10"
                    : "border-border bg-muted/50",
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background text-primary ring-1 ring-primary/15">
                  <Icon className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0">
                  <p className="text-lg font-semibold leading-none text-card-foreground">
                    {item.value}
                  </p>

                  <p
                    className={cn(
                      "mt-1.5 line-clamp-1 text-[10px] font-bold uppercase tracking-[0.14em]",
                      item.featured ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
