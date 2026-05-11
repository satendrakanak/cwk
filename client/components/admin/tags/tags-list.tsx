"use client";
import { DataTable } from "@/components/admin/data-table/data-table";
import { getTagsColumns } from "./tags-columns";
import { useState } from "react";
import { TagDrawer } from "./tag-drawer";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Tag } from "@/types/tag";
import { tagClientService } from "@/services/tags/tag.client";

interface TagsListProps {
  tags: Tag[];
}

export const TagsList = ({ tags }: TagsListProps) => {
  const [selected, setSelected] = useState<Tag | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Tag | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleEdit = (tag: Tag) => {
    setSelected(tag);
    setOpen(true);
  };
  // 🔥 DELETE CLICK
  const handleDeleteClick = (tag: Tag) => {
    setDeleteItem(tag);
    setDeleteOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setLoading(true);

      await tagClientService.delete(deleteItem.id);

      toast.success("Tag deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to delete tag");
    } finally {
      setLoading(false);
    }
  };

  const columns = getTagsColumns(handleEdit, handleDeleteClick);
  return (
    <div>
      <DataTable data={tags} columns={columns} searchColumn="name" isClient />
      <TagDrawer open={open} onOpenChange={setOpen} tag={selected} />
      <ConfirmDeleteDialog
        deleteText="tag"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </div>
  );
};
