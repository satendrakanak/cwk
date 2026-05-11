import { Article } from "@/types/article";
import { formatDate } from "@/utils/formate-date";

interface QuickInfoProps {
  article: Article;
}

export default function QuickInfo({ article }: QuickInfoProps) {
  return (
    <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-muted-foreground shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))] dark:text-slate-300">
      <p>Article ID: #{article.id}</p>

      <p>Created At: {formatDate(article.createdAt)}</p>

      <p>Created By: {article.createdBy?.firstName || "—"}</p>

      <p>Last updated: {formatDate(article.updatedAt)}</p>

      <p>Updated By: {article.updatedBy?.firstName || "—"}</p>
    </div>
  );
}
