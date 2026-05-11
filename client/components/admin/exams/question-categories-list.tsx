"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderTree, Layers, ListChecks, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  AdminResourceDashboard,
  DeleteSelectedButton,
} from "@/components/admin/shared/admin-resource-dashboard";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-handler";
import { examClientService } from "@/services/exams/exam.client";
import { QuestionBankCategory } from "@/types/exam";
import { CreateCategoryDialog } from "./create-category-dialog";
import { getQuestionCategoryColumns } from "./question-category-columns";

type DialogState = {
  mode: "edit" | "duplicate";
  category: QuestionBankCategory;
} | null;

export function QuestionCategoriesList({
  categories,
}: {
  categories: QuestionBankCategory[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [deleteItem, setDeleteItem] = useState<QuestionBankCategory | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<
    QuestionBankCategory[]
  >([]);
  const [loading, setLoading] = useState(false);

  const columns = useMemo(
    () =>
      getQuestionCategoryColumns(
        (category) => setDialogState({ mode: "edit", category }),
        (category) => setDialogState({ mode: "duplicate", category }),
        setDeleteItem,
      ),
    [],
  );

  const deleteCategories = async (items: QuestionBankCategory[]) => {
    try {
      setLoading(true);
      await Promise.all(items.map((item) => examClientService.deleteCategory(item.id)));
      toast.success(
        items.length === 1
          ? "Question category deleted"
          : `${items.length} question categories deleted`,
      );
      setDeleteItem(null);
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
        eyebrow="Question Bank"
        title="Question categories"
        description="Organize reusable questions into root categories and child topic groups."
        data={categories}
        columns={columns}
        searchPlaceholder="Search categories by name, slug, parent, or description"
        searchFields={[
          (category) => category.name,
          (category) => category.slug,
          (category) => category.parent?.name,
          (category) => category.description,
        ]}
        stats={[
          { label: "Total Categories", value: categories.length, icon: FolderTree },
          {
            label: "Root Categories",
            value: categories.filter((category) => !category.parent).length,
            icon: Layers,
          },
          {
            label: "Linked Questions",
            value: categories.reduce(
              (sum, category) => sum + Number(category.questionsCount ?? 0),
              0,
            ),
            icon: ListChecks,
          },
        ]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Add Category
          </Button>
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
        exportFileName="question-categories-export.xlsx"
        mapExportRow={(category) => ({
          ID: category.id,
          Name: category.name,
          Slug: category.slug,
          Parent: category.parent?.name ?? "Root",
          Questions: category.questionsCount ?? 0,
          CreatedAt: category.createdAt,
        })}
        emptyTitle="No question categories found"
        emptyDescription="Create categories to organize reusable question pools."
      />

      <CreateCategoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categories={categories}
      />
      <CreateCategoryDialog
        open={Boolean(dialogState)}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
        mode={dialogState?.mode}
        category={dialogState?.category}
        categories={categories}
      />
      <ConfirmDeleteDialog
        deleteText="question category"
        open={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && deleteCategories([deleteItem])}
        loading={loading}
      />
      <ConfirmDeleteDialog
        deleteText="selected question categories"
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={() => deleteCategories(selectedForDelete)}
        loading={loading}
      />
    </>
  );
}
