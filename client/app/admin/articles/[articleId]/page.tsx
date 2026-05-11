import { getErrorMessage } from "@/lib/error-handler";
import { Article } from "@/types/article";
import { articleServerService } from "@/services/articles/article.server";
import { ArticleHeader } from "@/components/admin/articles/article-header";
import { BasicInfoForm } from "@/components/admin/articles/basic-info-form";
import { ArticleContent } from "@/components/admin/articles/article-content-form";
import { RightSidebar } from "@/components/admin/articles/right-sidebar";
import { MetaForm } from "@/components/admin/articles/meta-form";

export default async function ArticleIdPage({
  params,
}: {
  params: Promise<{ articleId: number }>;
}) {
  const { articleId } = await params;

  let article: Article;

  try {
    const response = await articleServerService.getById(articleId);
    article = response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  return (
    <div>
      <ArticleHeader article={article} />

      <div className="grid grid-cols-5 gap-6 py-6">
        <div className="col-span-4 space-y-6">
          <BasicInfoForm article={article} />
          <ArticleContent article={article} />

          <MetaForm article={article} />
        </div>

        <div className="col-span-1">
          <RightSidebar article={article} />
        </div>
      </div>
    </div>
  );
}
