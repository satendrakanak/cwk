import Link from "next/link";

import { ArticleCard } from "@/components/articles/article-card";
import Container from "@/components/container";
import { ArticleHeader } from "@/components/layout/article-header";
import { getErrorMessage } from "@/lib/error-handler";
import { buildMetadata } from "@/lib/seo";
import { articleServerService } from "@/services/articles/article.server";
import { Article } from "@/types/article";
import { cn } from "@/lib/utils";

type ArticleCategorySummary = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

export const metadata = buildMetadata({
  title: "Articles",
  description:
    "Read practical coding, learning, projects, and career-oriented articles from CodeWithKasa.",
  path: "/articles",
});

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  let articles: Article[] = [];

  try {
    const response = await articleServerService.getAll();
    articles = response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  const categoryMap = new Map<number, ArticleCategorySummary>();

  for (const currentArticle of articles) {
    for (const cat of currentArticle.categories || []) {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: (categoryMap.get(cat.id)?.count || 0) + 1,
      });
    }
  }

  const categories = Array.from(categoryMap.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );

  const filteredArticles = category
    ? articles.filter((article) =>
        article.categories?.some((item) => item.slug === category),
      )
    : articles;

  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <div className="relative bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />
      </div>

      <div className="relative z-10">
        <ArticleHeader />

        <section className="relative py-12 pb-20">
          <Container>
            <div className="academy-card mb-8 p-4">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/articles"
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    !activeCategory
                      ? "bg-primary text-primary-foreground shadow-[0_12px_30px_color-mix(in_oklab,var(--primary)_24%,transparent)]"
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  All Articles
                </Link>

                {categories.map((item) => {
                  const isActive = activeCategory?.id === item.id;

                  return (
                    <Link
                      key={item.id}
                      href={`/articles?category=${item.slug}`}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-[0_12px_30px_color-mix(in_oklab,var(--primary)_24%,transparent)]"
                          : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary",
                      )}
                    >
                      {item.name} ({item.count})
                    </Link>
                  );
                })}
              </div>

              {activeCategory && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Showing articles in{" "}
                  <span className="font-semibold text-card-foreground">
                    {activeCategory.name}
                  </span>
                  .
                </p>
              )}
            </div>

            {filteredArticles.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="academy-card border-dashed p-10 text-center">
                <p className="text-sm font-semibold text-card-foreground">
                  No articles found
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Try selecting another category.
                </p>
              </div>
            )}
          </Container>
        </section>
      </div>
    </div>
  );
}
