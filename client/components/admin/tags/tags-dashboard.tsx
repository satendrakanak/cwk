"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Download, Search, Sparkles, Tags, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Tag } from "@/types/tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableContent } from "@/components/admin/data-table/data-table-content";
import { DataTablePagination } from "@/components/admin/data-table/data-table-pagination";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { tagClientService } from "@/services/tags/tag.client";
import { getErrorMessage } from "@/lib/error-handler";
import { TagDrawer } from "./tag-drawer";
import { TagImportDialog } from "./tag-import-dialog";
import { getTagsColumns } from "./tags-columns";
import { exportTagsToWorkbook } from "./tags-utils";

export function TagsDashboard({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Tag | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTags = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tags.filter((tag) => {
      if (!needle) return true;
      return (
        tag.name.toLowerCase().includes(needle) ||
        tag.slug.toLowerCase().includes(needle) ||
        tag.description?.toLowerCase().includes(needle)
      );
    });
  }, [search, tags]);

  const columns = useMemo<ColumnDef<Tag>[]>(
    () =>
      getTagsColumns(
        (tag) => {
          setSelectedTag(tag);
          setIsDrawerOpen(true);
        },
        (tag) => {
          setDeleteItem(tag);
          setDeleteOpen(true);
        },
      ),
    [],
  );

  const table = useReactTable({
    data: filteredTags,
    columns,
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const describedTags = tags.filter((tag) => Boolean(tag.description)).length;

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      setIsDeleting(true);
      await tagClientService.delete(deleteItem.id);
      toast.success("Tag deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedRows.length) return;

    try {
      setIsDeleting(true);
      await tagClientService.deleteBulk(selectedRows.map((item) => item.id));
      toast.success(`${selectedRows.length} tags deleted`);
      setBulkDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[var(--brand-100)] bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_55%,#eef4ff_100%)] p-6 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex rounded-full border border-[var(--brand-200)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-700)] dark:border-white/10 dark:bg-white/8 dark:text-[var(--brand-200)]">
              Shared Metadata
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Tags dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Manage reusable tags used across course discovery and article publishing.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-2xl" onClick={() => setIsImportOpen(true)}>
              <Upload className="size-4" />
              Import
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => exportTagsToWorkbook(filteredTags, "tags-export.xlsx")}
            >
              <Download className="size-4" />
              Export
            </Button>
            <Button
              className="rounded-2xl"
              onClick={() => {
                setSelectedTag(null);
                setIsDrawerOpen(true);
              }}
            >
              <Sparkles className="size-4" />
              Add Tag
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Tags", value: tags.length, icon: Tags },
            { label: "With Description", value: describedTags, icon: Sparkles },
            { label: "Shared Scope", value: "2 modules", icon: Upload },
          ].map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/80 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/8">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">{stat.label}</p>
                <stat.icon className="size-5 text-[var(--brand-600)]" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by tag name, slug, or description"
              className="h-11 rounded-2xl pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              disabled={!selectedRows.length}
              onClick={() => exportTagsToWorkbook(selectedRows, "selected-tags.xlsx")}
            >
              <Download className="size-4" />
              Export Selected
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl"
              disabled={!selectedRows.length}
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete Selected
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-100 dark:border-white/10">
          <DataTableContent
            table={table}
            data={filteredTags}
            getRowId={(row) => row.id}
          />
          <div className="border-t border-slate-100 py-4 dark:border-white/10">
            <DataTablePagination table={table} />
          </div>
        </div>
      </section>

      <TagDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        tag={selectedTag}
      />

      <TagImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImported={() => router.refresh()}
      />

      <ConfirmDeleteDialog
        deleteText="tag"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />

      <ConfirmDeleteDialog
        deleteText="selected tags"
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={isDeleting}
      />
    </div>
  );
}
