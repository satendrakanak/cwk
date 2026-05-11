"use client";
import { DataTable } from "@/components/admin/data-table/data-table";
import { Category } from "@/types/category";
import { getCategoriesColumns } from "./categories-columns";
import { useState } from "react";
import { CategoryDrawer } from "./category-drawer";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { categoryClientService } from "@/services/categories/category.client";

interface CategoriesListProps {
  categories: Category[];
}

export const CategoriesList = ({ categories }: CategoriesListProps) => {
  const [selected, setSelected] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleEdit = (category: Category) => {
    setSelected(category);
    setOpen(true);
  };
  // 🔥 DELETE CLICK
  const handleDeleteClick = (category: Category) => {
    setDeleteItem(category);
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setLoading(true);

      await categoryClientService.delete(deleteItem.id);

      toast.success("Category deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const columns = getCategoriesColumns(handleEdit, handleDeleteClick);
  return (
    <div>
      <DataTable data={categories} columns={columns} searchColumn="name" />
      <CategoryDrawer
        open={open}
        onOpenChange={setOpen}
        category={selected}
      />
      <ConfirmDeleteDialog
        deleteText="category"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </div>
  );
};
