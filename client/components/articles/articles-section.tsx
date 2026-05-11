"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Container from "@/components/container";
import { Article } from "@/types/article";
import { ArticleCard } from "./article-card";

interface ArticlesSectionProps {
  articles: Article[];
}

export default function ArticlesSection({ articles }: ArticlesSectionProps) {
  if (!articles?.length) return null;

  const visibleArticles = articles.slice(0, 3);

  return (
    <section className="academy-section relative bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />

        <div className="absolute -left-40 top-10 h-105 w-105 rounded-full bg-primary/10 blur-[120px]" />

        <div className="absolute -right-40 bottom-8 h-105 w-105 rounded-full bg-primary/10 blur-[120px]" />

        <div className="academy-grid-mask absolute inset-0 opacity-40" />
      </div>

      <Container className="relative z-10">
        <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="academy-badge mb-4">Latest Articles</span>

            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              Insights, essays, and practical guidance from our team.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Read useful ideas, expert-backed perspectives, and practical
              guidance to support your learning journey.
            </p>
          </div>

          <Link
            href="/articles"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card/80 px-6 text-sm font-semibold text-primary shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            Explore All Articles
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </Container>
    </section>
  );
}
