import Link from "next/link";
import { Newspaper, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type ArticleCategoryFilterProps = {
  categories: {
    id: number;
    name: string;
    slug: string;
    count: number;
  }[];
  selectedCategory?: string;
  totalArticles: number;
};

function formatCount(count: number) {
  if (count <= 0) return "0";
  return `${count}+`;
}

export function ArticlesCategoryFilter({
  categories,
  selectedCategory,
  totalArticles,
}: ArticleCategoryFilterProps) {
  return (
    <>
      <div className="academy-card flex flex-col gap-5 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Sparkles className="h-5 w-5" />
          </span>

          <div>
            <p className="text-sm font-semibold text-card-foreground">
              Explore by topic
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Pick a learning lane and the article feed will keep loading from
              that topic.
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          <Newspaper className="h-4 w-4 text-primary" />
          {formatCount(totalArticles)} published
        </div>
      </div>

      <div className="sticky top-[88px] z-40 rounded-2xl border border-border bg-background/92 p-2 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl md:top-[98px] lg:top-[92px]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-xl bg-sky-500/[0.055] p-1 ring-1 ring-sky-500/10">
          <Link
            href="/articles"
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              !selectedCategory
                ? "border-sky-500 bg-sky-500 text-white shadow-[0_14px_34px_rgba(14,165,233,0.2)] dark:border-sky-300 dark:bg-sky-300 dark:text-sky-950"
                : "border-sky-500/20 bg-sky-500/[0.07] text-sky-700 hover:border-sky-500/35 hover:bg-sky-500/12 dark:text-sky-200",
            )}
          >
            All Articles
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                !selectedCategory
                  ? "bg-white/20 text-white dark:bg-sky-950/15 dark:text-sky-950"
                  : "bg-sky-500/10 text-sky-700 dark:bg-sky-300/10 dark:text-sky-200",
              )}
            >
              {formatCount(totalArticles)}
            </span>
          </Link>

          {categories.map((category) => {
            const isActive = selectedCategory === category.slug;

            return (
              <Link
                key={category.id}
                href={`/articles?category=${category.slug}`}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  isActive
                    ? "border-sky-500 bg-sky-500 text-white shadow-[0_14px_34px_rgba(14,165,233,0.2)] dark:border-sky-300 dark:bg-sky-300 dark:text-sky-950"
                    : "border-sky-500/20 bg-sky-500/[0.07] text-sky-700 hover:border-sky-500/35 hover:bg-sky-500/12 dark:text-sky-200",
                )}
              >
                {category.name}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    isActive
                      ? "bg-white/20 text-white dark:bg-sky-950/15 dark:text-sky-950"
                      : "bg-sky-500/10 text-sky-700 dark:bg-sky-300/10 dark:text-sky-200",
                  )}
                >
                  {formatCount(category.count)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
