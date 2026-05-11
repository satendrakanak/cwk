"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, RadioTower, SplitSquareHorizontal } from "lucide-react";

import type { AdminDashboardData } from "@/types/admin-dashboard";

export function LearningOpsCard({ data }: { data: AdminDashboardData }) {
  const items = [
    {
      label: "Self-learning",
      value: data.learningOps.selfLearningCourses,
      href: "/admin/courses",
      icon: BookOpen,
    },
    {
      label: "Faculty-led",
      value: data.learningOps.facultyLedCourses,
      href: "/admin/courses",
      icon: RadioTower,
    },
    {
      label: "Hybrid",
      value: data.learningOps.hybridCourses,
      href: "/admin/courses",
      icon: SplitSquareHorizontal,
    },
  ];

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Learning operations
          </p>
          <h2 className="mt-2 text-lg font-semibold text-foreground">
            Course delivery mix
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Compact view of the three learning modes. Open course management for
            deeper configuration.
          </p>
        </div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          Manage <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-xl border bg-background p-4 transition hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <item.icon className="size-4" />
            </div>
            <p className="text-2xl font-semibold">{item.value}</p>
            <p className="text-sm text-muted-foreground">{item.label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
