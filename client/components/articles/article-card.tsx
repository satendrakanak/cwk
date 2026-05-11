"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";

import { Article } from "@/types/article";
import { formatDate } from "@/utils/formate-date";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const category = article.categories?.[0]?.name;

  const publishedDate = article.publishedAt
    ? formatDate(article.publishedAt)
    : "Draft";

  return (
    <Link
      href={`/article/${article.slug}`}
      className="academy-card group relative block h-full overflow-hidden p-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_30px_90px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_65%)]" />
      </div>

      <div className="relative h-52 w-full overflow-hidden rounded-[24px] bg-muted">
        <Image
          src={article.featuredImage?.path || "/assets/placeholder.jpg"}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent opacity-70 transition-opacity group-hover:opacity-85" />

        {category && (
          <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
            {category}
          </span>
        )}

        <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
          <CalendarDays className="h-3.5 w-3.5" />
          {publishedDate}
        </div>
      </div>

      <div className="relative z-10 flex min-h-47.5 flex-col px-3 pb-3 pt-5">
        <h3 className="line-clamp-2 text-lg font-semibold leading-7 text-card-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {article.excerpt || "No description available"}
        </p>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-sm font-semibold text-primary">
            Read Article
          </span>

          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-primary transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
