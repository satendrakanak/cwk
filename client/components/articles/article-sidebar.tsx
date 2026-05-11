"use client";

import Link from "next/link";
import { Hash, Layers } from "lucide-react";

import { Article } from "@/types/article";
import { cn } from "@/lib/utils";

type SidebarCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

export function ArticleSidebar({
  article,
  categories,
}: {
  article: Article;
  categories: SidebarCategory[];
}) {
  return (
    <aside className="space-y-5">
      <div className="academy-card p-5">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Layers className="h-5 w-5" />
          </span>

          <div>
            <h4 className="font-semibold text-card-foreground">Categories</h4>
            <p className="text-xs text-muted-foreground">Browse by topic</p>
          </div>
        </div>

        <div className="space-y-2">
          {categories.length ? (
            categories.map((cat) => {
              const isActive = article.categories?.some(
                (item) => item.id === cat.id,
              );

              return (
                <Link
                  key={cat.id}
                  href={`/articles?category=${cat.slug}`}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_12px_30px_color-mix(in_oklab,var(--primary)_22%,transparent)]"
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  <span className="line-clamp-1">{cat.name}</span>

                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-background text-muted-foreground",
                    )}
                  >
                    {cat.count}
                  </span>
                </Link>
              );
            })
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              No categories available.
            </p>
          )}
        </div>
      </div>

      <div className="academy-card p-5">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Hash className="h-5 w-5" />
          </span>

          <div>
            <h4 className="font-semibold text-card-foreground">Tags</h4>
            <p className="text-xs text-muted-foreground">Related keywords</p>
          </div>
        </div>

        {article.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            No tags added.
          </p>
        )}
      </div>
    </aside>
  );
}
