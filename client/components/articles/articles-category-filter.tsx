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
  tags: {
    id: number;
    name: string;
    slug: string;
    count: number;
  }[];
  selectedCategory?: string;
  selectedTag?: string;
  totalArticles: number;
};

function formatCount(count: number) {
  if (count <= 0) return "0";
  return `${count}+`;
}

export function ArticlesCategoryFilter({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  totalArticles,
}: ArticleCategoryFilterProps) {
  return (
    <>
      <div className="academy-card flex flex-col items-center gap-5 p-5 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-3 md:flex-row md:items-start">
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

      <div className="sticky top-[88px] z-40 space-y-2 rounded-2xl border border-border bg-background/92 p-2 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl md:top-[98px] lg:top-[92px]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-xl bg-sky-500/[0.055] p-1 ring-1 ring-sky-500/10">
          <Link
            href="/articles"
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              !selectedCategory && !selectedTag
                ? "border-sky-500 bg-sky-500 text-white shadow-[0_14px_34px_rgba(14,165,233,0.2)] dark:border-sky-300 dark:bg-sky-300 dark:text-sky-950"
                : "border-sky-500/20 bg-sky-500/[0.07] text-sky-700 hover:border-sky-500/35 hover:bg-sky-500/12 dark:text-sky-200",
            )}
          >
            All Articles
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                !selectedCategory && !selectedTag
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
                href={`/articles?category=${category.slug}${selectedTag ? `&tag=${selectedTag}` : ""}`}
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

        {tags.length ? (
          <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-xl bg-amber-500/[0.06] p-1 ring-1 ring-amber-500/10">
            {tags.slice(0, 14).map((tag) => {
              const isActive = selectedTag === tag.slug;
              const categoryQuery = selectedCategory
                ? `category=${selectedCategory}&`
                : "";

              return (
                <Link
                  key={tag.id}
                  href={`/articles?${categoryQuery}tag=${tag.slug}`}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    isActive
                      ? "border-amber-500 bg-amber-500 text-amber-950 shadow-[0_14px_34px_rgba(245,158,11,0.2)] dark:border-amber-300 dark:bg-amber-300 dark:text-amber-950"
                      : "border-amber-500/25 bg-amber-500/[0.08] text-amber-800 hover:border-amber-500/40 hover:bg-amber-500/14 dark:text-amber-200",
                  )}
                >
                  #{tag.name}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      isActive
                        ? "bg-amber-950/10 text-amber-950"
                        : "bg-amber-500/12 text-amber-800 dark:bg-amber-300/10 dark:text-amber-200",
                    )}
                  >
                    {formatCount(tag.count)}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
