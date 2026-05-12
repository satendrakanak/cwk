import { ArticlesCategoryFilter } from "@/components/articles/articles-category-filter";
import { InfiniteArticlesGrid } from "@/components/articles/infinite-articles-grid";
import Container from "@/components/container";
import { ArticleHeader } from "@/components/layout/article-header";
import { getErrorMessage } from "@/lib/error-handler";
import { buildMetadata } from "@/lib/seo";
import { articleServerService } from "@/services/articles/article.server";
import { Article } from "@/types/article";

const PAGE_SIZE = 9;

export const metadata = buildMetadata({
  title: "Articles",
  description:
    "Read practical coding, learning, projects, and career-oriented articles from CodeWithKasa.",
  path: "/articles",
});

type ArticleCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

function getArticleCategories(articles: Article[]): ArticleCategory[] {
  return Array.from(
    articles
      .flatMap((article) => article.categories || [])
      .reduce(
        (map, category) =>
          map.set(category.id, {
            id: category.id,
            name: category.name,
            slug: category.slug,
            count: (map.get(category.id)?.count || 0) + 1,
          }),
        new Map<number, ArticleCategory>(),
      )
      .values(),
  ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const allArticlesResponse = await articleServerService
    .getPublicArticles({ page: 1, limit: 1000 })
    .catch((error) => {
      throw new Error(getErrorMessage(error));
    });

  const categories = getArticleCategories(allArticlesResponse.data.data);
  const selectedCategory = categories.some((item) => item.slug === category)
    ? category
    : undefined;

  const response = await articleServerService
    .getPublicArticles({
      page: 1,
      limit: PAGE_SIZE,
      category: selectedCategory,
    })
    .catch((error) => {
      throw new Error(getErrorMessage(error));
    });

  const articlesPage = response.data;

  return (
    <div className="relative bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />
      </div>

      <div className="relative z-10">
        <ArticleHeader
          totalArticles={allArticlesResponse.data.meta.totalItems}
          totalCategories={categories.length}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Articles" },
          ]}
        />

        <section className="relative py-12 pb-20">
          <Container>
            <div className="space-y-8">
              <ArticlesCategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                totalArticles={allArticlesResponse.data.meta.totalItems}
              />

              <InfiniteArticlesGrid
                key={selectedCategory || "all"}
                initialPage={articlesPage}
                pageSize={PAGE_SIZE}
                category={selectedCategory}
              />
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
