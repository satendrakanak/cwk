import Link from "next/link";
import { BookOpen, Layers, MonitorPlay, Tags } from "lucide-react";

import { COURSE_DELIVERY_MODES } from "@/lib/course-delivery";
import { cn } from "@/lib/utils";

type FilterItem = {
  id: number | string;
  name: string;
  slug: string;
  count: number;
};

type CoursesFilterBarProps = {
  categories: FilterItem[];
  tags: FilterItem[];
  selectedMode?: string;
  selectedCategory?: string;
  selectedTag?: string;
  totalCourses: number;
};

function buildHref({
  mode,
  category,
  tag,
}: {
  mode?: string;
  category?: string;
  tag?: string;
}) {
  const params = new URLSearchParams();

  if (mode) params.set("mode", mode);
  if (category) params.set("category", category);
  if (tag) params.set("tag", tag);

  const search = params.toString();
  return search ? `/courses?${search}` : "/courses";
}

type FilterTone = "format" | "topic" | "skill";

function formatCount(count: number) {
  if (count <= 0) return "0";
  return `${count}+`;
}

const toneClasses: Record<
  FilterTone,
  { active: string; inactive: string; countActive: string; countInactive: string }
> = {
  format: {
    active:
      "border-emerald-500 bg-emerald-500 text-white shadow-[0_14px_34px_rgba(16,185,129,0.22)] dark:border-emerald-300 dark:bg-emerald-300 dark:text-emerald-950",
    inactive:
      "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-700 hover:border-emerald-500/35 hover:bg-emerald-500/12 dark:text-emerald-200",
    countActive: "bg-white/20 text-white dark:bg-emerald-950/15 dark:text-emerald-950",
    countInactive:
      "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200",
  },
  topic: {
    active:
      "border-sky-500 bg-sky-500 text-white shadow-[0_14px_34px_rgba(14,165,233,0.2)] dark:border-sky-300 dark:bg-sky-300 dark:text-sky-950",
    inactive:
      "border-sky-500/20 bg-sky-500/[0.07] text-sky-700 hover:border-sky-500/35 hover:bg-sky-500/12 dark:text-sky-200",
    countActive: "bg-white/20 text-white dark:bg-sky-950/15 dark:text-sky-950",
    countInactive:
      "bg-sky-500/10 text-sky-700 dark:bg-sky-300/10 dark:text-sky-200",
  },
  skill: {
    active:
      "border-amber-500 bg-amber-500 text-amber-950 shadow-[0_14px_34px_rgba(245,158,11,0.2)] dark:border-amber-300 dark:bg-amber-300 dark:text-amber-950",
    inactive:
      "border-amber-500/25 bg-amber-500/[0.08] text-amber-800 hover:border-amber-500/40 hover:bg-amber-500/14 dark:text-amber-200",
    countActive: "bg-amber-950/10 text-amber-950",
    countInactive:
      "bg-amber-500/12 text-amber-800 dark:bg-amber-300/10 dark:text-amber-200",
  },
};

function FilterChip({
  href,
  isActive,
  label,
  count,
  tone,
}: {
  href: string;
  isActive: boolean;
  label: string;
  count?: number;
  tone: FilterTone;
}) {
  const styles = toneClasses[tone];

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        isActive ? styles.active : styles.inactive,
      )}
    >
      {label}
      {typeof count === "number" ? (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs",
            isActive ? styles.countActive : styles.countInactive,
          )}
        >
          {formatCount(count)}
        </span>
      ) : null}
    </Link>
  );
}

export function CoursesFilterBar({
  categories,
  tags,
  selectedMode,
  selectedCategory,
  selectedTag,
  totalCourses,
}: CoursesFilterBarProps) {
  return (
    <>
      <div className="academy-card flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <BookOpen className="h-5 w-5" />
          </span>

          <div>
            <p className="text-sm font-semibold text-card-foreground">
              Explore courses by format and topic
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Filter by self learning, live faculty batches, hybrid programs,
              categories, or skill tags.
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          <Layers className="h-4 w-4 text-primary" />
          {formatCount(totalCourses)} courses
        </div>
      </div>

      <div className="sticky top-[88px] z-40 space-y-2 rounded-2xl border border-border bg-background/92 p-2 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl md:top-[98px] lg:top-[92px]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-xl bg-emerald-500/[0.055] p-1 ring-1 ring-emerald-500/10">
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-200">
            <MonitorPlay className="h-3.5 w-3.5" />
            Format
          </span>

          <FilterChip
            href={buildHref({ category: selectedCategory, tag: selectedTag })}
            isActive={!selectedMode}
            label="All Formats"
            tone="format"
          />

          {COURSE_DELIVERY_MODES.map((mode) => (
            <FilterChip
              key={mode.value}
              href={buildHref({
                mode: mode.value,
                category: selectedCategory,
                tag: selectedTag,
              })}
              isActive={selectedMode === mode.value}
              label={mode.shortLabel}
              tone="format"
            />
          ))}
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-xl bg-sky-500/[0.055] p-1 ring-1 ring-sky-500/10">
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-200">
            <BookOpen className="h-3.5 w-3.5" />
            Topic
          </span>

          <FilterChip
            href={buildHref({ mode: selectedMode, tag: selectedTag })}
            isActive={!selectedCategory}
            label="All Topics"
            tone="topic"
          />

          {categories.map((category) => (
            <FilterChip
              key={category.id}
              href={buildHref({
                mode: selectedMode,
                category: category.slug,
                tag: selectedTag,
              })}
              isActive={selectedCategory === category.slug}
              label={category.name}
              count={category.count}
              tone="topic"
            />
          ))}
        </div>

        <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-xl bg-amber-500/[0.06] p-1 ring-1 ring-amber-500/10">
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-200">
            <Tags className="h-3.5 w-3.5" />
            Skill
          </span>

          <FilterChip
            href={buildHref({ mode: selectedMode, category: selectedCategory })}
            isActive={!selectedTag}
            label="All Skills"
            tone="skill"
          />

          {tags.slice(0, 14).map((tag) => (
            <FilterChip
              key={tag.id}
              href={buildHref({
                mode: selectedMode,
                category: selectedCategory,
                tag: tag.slug,
              })}
              isActive={selectedTag === tag.slug}
              label={tag.name}
              count={tag.count}
              tone="skill"
            />
          ))}
        </div>
      </div>
    </>
  );
}
