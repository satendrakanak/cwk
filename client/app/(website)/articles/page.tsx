import { InfiniteArticlesGrid } from "@/components/articles/infinite-articles-grid";
import Container from "@/components/container";
import { ArticleHeader } from "@/components/layout/article-header";
import { getErrorMessage } from "@/lib/error-handler";
import { buildMetadata } from "@/lib/seo";
import { articleServerService } from "@/services/articles/article.server";

const PAGE_SIZE = 9;

export const metadata = buildMetadata({
  title: "Articles",
  description:
    "Read practical coding, learning, projects, and career-oriented articles from CodeWithKasa.",
  path: "/articles",
});

export default async function ArticlesPage() {
  const response = await articleServerService
    .getPublicArticles({ page: 1, limit: PAGE_SIZE })
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
        <ArticleHeader />

        <section className="relative py-12 pb-20">
          <Container>
            <InfiniteArticlesGrid
              initialPage={articlesPage}
              pageSize={PAGE_SIZE}
            />
          </Container>
        </section>
      </div>
    </div>
  );
}
