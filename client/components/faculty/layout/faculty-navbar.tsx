"use client";

import { NavUser } from "@/components/admin/layout/nav-user";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function FacultyNavbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/86 px-3 backdrop-blur-xl transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16 sm:px-4">
      <div className="flex items-center gap-2 px-1 sm:px-3">
        <SidebarTrigger className="-ml-1 -mt-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <div className="hidden md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)] dark:text-[var(--brand-300)]">
            Faculty workspace
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Manage your courses, exams, batches, and schedule.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle compact />
        <NavUser variant="navbar" />
      </div>
    </header>
  );
}
