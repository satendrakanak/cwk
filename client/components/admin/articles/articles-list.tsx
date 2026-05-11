"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, FileText, Sparkles } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import AddButton from "../data-table/add-button";
import { Article } from "@/types/article";
import { articleClientService } from "@/services/articles/article.client";
import { getArticleColumns } from "./article-columns";
import { CreateArticleForm } from "./create-article-form";
import {
  AdminResourceDashboard,
  DeleteSelectedButton,
} from "@/components/admin/shared/admin-resource-dashboard";
import { getErrorMessage } from "@/lib/error-handler";

interface ArticlesListProps {
  articles: Article[];
}

export const ArticlesList = ({ articles }: ArticlesListProps) => {
  const [deleteItem, setDeleteItem] = useState<Article | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const columns = useMemo(
    () =>
      getArticleColumns((article) => {
        setDeleteItem(article);
        setDeleteOpen(true);
      }),
    [],
  );

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setLoading(true);
      await articleClientService.delete(deleteItem.id);
      toast.success("Article deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedForDelete.length) return;

    try {
      setLoading(true);
      await Promise.all(
        selectedForDelete.map((article) => articleClientService.delete(article.id)),
      );
      toast.success(`${selectedForDelete.length} articles deleted`);
      setBulkDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminResourceDashboard
        eyebrow="Editorial"
        title="Articles dashboard"
        description="Manage published guidance, drafts, featured reads, and export editorial data from one place."
        data={articles}
        columns={columns}
        searchPlaceholder="Search articles by title, category, or slug"
        searchFields={[
          (article) => article.title,
          (article) => article.slug,
          (article) => article.categories?.map((category) => category.name).join(" "),
        ]}
        stats={[
          { label: "Total Articles", value: articles.length, icon: FileText },
          {
            label: "Published",
            value: articles.filter((article) => article.isPublished).length,
            icon: Eye,
          },
          {
            label: "Featured",
            value: articles.filter((article) => article.isFeatured).length,
            icon: Sparkles,
          },
        ]}
        actions={
          <AddButton
            title="Add Article"
            redirectPath="/admin/articles"
            FormComponent={CreateArticleForm}
          />
        }
        selectedActions={(selectedRows) => (
          <DeleteSelectedButton
            disabled={!selectedRows.length}
            onClick={() => {
              setSelectedForDelete(selectedRows);
              setBulkDeleteOpen(true);
            }}
          />
        )}
        exportFileName="articles-export.xlsx"
        mapExportRow={(article) => ({
          ID: article.id,
          Title: article.title,
          Slug: article.slug,
          Published: article.isPublished ? "Yes" : "No",
          Featured: article.isFeatured ? "Yes" : "No",
          Categories: article.categories?.map((category) => category.name).join(", ") ?? "",
          Views: article.viewCount,
          CreatedAt: article.createdAt,
        })}
        emptyTitle="No articles found"
        emptyDescription="Articles will appear here once they are created."
      />

      <ConfirmDeleteDialog
        deleteText="article"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />

      <ConfirmDeleteDialog
        deleteText="selected articles"
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={loading}
      />
    </>
  );
};
