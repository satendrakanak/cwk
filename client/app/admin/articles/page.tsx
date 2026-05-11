import { ArticlesListLoader } from "@/components/admin/articles/articles-list-loader";
import { getErrorMessage } from "@/lib/error-handler";
import { articleServerService } from "@/services/articles/article.server";
import { Article } from "@/types/article";
const ArticlesPage = async () => {
  let articles: Article[] = [];
  try {
    const response = await articleServerService.getAllArticles();
    articles = response.data.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  return (
    <div>
      <ArticlesListLoader articles={articles} />
    </div>
  );
};

export default ArticlesPage;
