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

export function ArticlesCategoryFilter({
  categories,
  selectedCategory,
  totalArticles,
}: ArticleCategoryFilterProps) {
  return (
    <div className="space-y-3">
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
          {totalArticles} published
        </div>
      </div>

      <div className="sticky top-[64px] z-40 rounded-2xl border border-border bg-background/92 p-2 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl md:top-[76px]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <Link
            href="/articles"
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
              !selectedCategory
                ? "border-primary bg-primary text-primary-foreground shadow-[0_14px_34px_color-mix(in_oklab,var(--primary)_24%,transparent)]"
                : "border-border bg-background text-muted-foreground hover:border-primary/35 hover:bg-primary/10 hover:text-primary",
            )}
          >
            All Articles
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                !selectedCategory
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {totalArticles}
            </span>
          </Link>

          {categories.map((category) => {
            const isActive = selectedCategory === category.slug;

            return (
              <Link
                key={category.id}
                href={`/articles?category=${category.slug}`}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_14px_34px_color-mix(in_oklab,var(--primary)_24%,transparent)]"
                    : "border-border bg-background text-muted-foreground hover:border-primary/35 hover:bg-primary/10 hover:text-primary",
                )}
              >
                {category.name}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {category.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
