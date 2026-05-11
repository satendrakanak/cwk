import { ArticleContent } from "@/components/articles/article-content";
import { ArticleComments } from "@/components/articles/article-comments";
import { ArticleHero } from "@/components/articles/article-hero";
import { ArticleMeta } from "@/components/articles/article-meta";
import { ArticleSidebar } from "@/components/articles/article-sidebar";
import { RelatedArticles } from "@/components/articles/related-articles";
import Container from "@/components/container";
import { getErrorMessage } from "@/lib/error-handler";
import { buildMetadata } from "@/lib/seo";
import { articleServerService } from "@/services/articles/article.server";
import { Article } from "@/types/article";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type ArticlePageProps = {
  params: Promise<{ articleSlug: string }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { articleSlug } = await params;

  try {
    const response = await articleServerService.getBySlug(articleSlug);
    const article = response.data;

    return buildMetadata({
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      path: `/article/${article.slug}`,
      image: article.featuredImage?.path,
    });
  } catch {
    return buildMetadata({
      title: "Article not found",
      description: "This article is not currently available.",
      path: `/article/${articleSlug}`,
    });
  }
}

export default async function ArticleSlugPage({ params }: ArticlePageProps) {
  const { articleSlug } = await params;

  if (!articleSlug) {
    notFound();
  }

  let article: Article;

  try {
    const response = await articleServerService.getBySlug(articleSlug);
    article = response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error).toLowerCase();

    if (message.includes("not found") || message.includes("404")) {
      notFound();
    }

    throw new Error(getErrorMessage(error));
  }

  let relatedArticles: Article[] = [];

  try {
    const response = await articleServerService.getRealtedArticles(article.id);
    relatedArticles = response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  let allArticles: Article[] = [];

  try {
    const response = await articleServerService.getAll();
    allArticles = response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  const categories = Array.from(
    allArticles
      .flatMap((item) => item.categories || [])
      .reduce(
        (map, category) =>
          map.set(category.id, {
            id: category.id,
            name: category.name,
            slug: category.slug,
            count: (map.get(category.id)?.count || 0) + 1,
          }),
        new Map<
          number,
          { id: number; name: string; slug: string; count: number }
        >(),
      )
      .values(),
  ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <div className="relative bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />
      </div>

      <div className="relative z-10">
        <ArticleHero article={article} />

        <Container>
          <div className="flex flex-col items-start gap-10 py-10 lg:flex-row">
            <div className="min-w-0 max-w-4xl flex-1">
              <div className="space-y-8">
                <ArticleContent article={article} />
                <ArticleMeta article={article} />
                <ArticleComments articleId={article.id} />
              </div>
            </div>

            <aside className="w-full self-start lg:sticky lg:top-24 lg:w-80">
              <ArticleSidebar article={article} categories={categories} />
            </aside>
          </div>
        </Container>

        {relatedArticles.length > 0 && (
          <Container>
            <RelatedArticles articles={relatedArticles} />
          </Container>
        )}
      </div>
    </div>
  );
}
