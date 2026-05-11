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
import {
  Download,
  FolderTree,
  LayoutTemplate,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Category, CategoryType } from "@/types/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableContent } from "@/components/admin/data-table/data-table-content";
import { DataTablePagination } from "@/components/admin/data-table/data-table-pagination";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { getErrorMessage } from "@/lib/error-handler";
import { categoryClientService } from "@/services/categories/category.client";
import { getCategoriesColumns } from "./categories-columns";
import { CategoryDrawer } from "./category-drawer";
import { CategoryImportDialog } from "./category-import-dialog";
import { exportCategoriesToWorkbook } from "./categories-utils";

const typeTabs: { label: string; value: "all" | CategoryType }[] = [
  { label: "All", value: "all" },
  { label: "Course", value: "course" },
  { label: "Article", value: "article" },
];

export function CategoriesDashboard({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<"all" | CategoryType>("all");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesType = activeType === "all" || category.type === activeType;
      const needle = search.trim().toLowerCase();
      const matchesSearch =
        !needle ||
        category.name.toLowerCase().includes(needle) ||
        category.slug.toLowerCase().includes(needle) ||
        category.description?.toLowerCase().includes(needle);

      return matchesType && matchesSearch;
    });
  }, [activeType, categories, search]);

  const columns = useMemo<ColumnDef<Category>[]>(
    () =>
      getCategoriesColumns(
        (category) => {
          setSelectedCategory(category);
          setIsDrawerOpen(true);
        },
        (category) => {
          setDeleteItem(category);
          setDeleteOpen(true);
        },
      ),
    [],
  );

  const table = useReactTable({
    data: filteredCategories,
    columns,
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const courseCount = categories.filter((item) => item.type === "course").length;
  const articleCount = categories.filter((item) => item.type === "article").length;

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      setIsDeleting(true);
      await categoryClientService.delete(deleteItem.id);
      toast.success("Category deleted");
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
      await categoryClientService.deleteBulk(selectedRows.map((item) => item.id));
      toast.success(`${selectedRows.length} categories deleted`);
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
              Content Taxonomy
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Categories dashboard
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Organize course and article structures with one clean, type-aware category workspace.
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
              onClick={() => exportCategoriesToWorkbook(filteredCategories, "categories-export.xlsx")}
            >
              <Download className="size-4" />
              Export
            </Button>
            <Button
              className="rounded-2xl"
              onClick={() => {
                setSelectedCategory(null);
                setIsDrawerOpen(true);
              }}
            >
              <Sparkles className="size-4" />
              Add Category
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Total Categories",
              value: categories.length,
              icon: FolderTree,
            },
            {
              label: "Course Categories",
              value: courseCount,
              icon: LayoutTemplate,
            },
            {
              label: "Article Categories",
              value: articleCount,
              icon: Sparkles,
            },
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
          <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3.5 size-4 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, slug, or description"
                className="h-11 rounded-2xl pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {typeTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveType(tab.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeType === tab.value
                      ? "bg-[var(--brand-600)] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-[var(--brand-200)] hover:text-[var(--brand-700)] dark:border-white/10 dark:bg-white/8 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              disabled={!selectedRows.length}
              onClick={() => exportCategoriesToWorkbook(selectedRows, "selected-categories.xlsx")}
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
            data={filteredCategories}
            getRowId={(row) => row.id}
          />
          <div className="border-t border-slate-100 py-4 dark:border-white/10">
            <DataTablePagination table={table} />
          </div>
        </div>
      </section>

      <CategoryDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        category={selectedCategory}
        defaultType={activeType === "all" ? "course" : activeType}
      />

      <CategoryImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImported={() => router.refresh()}
      />

      <ConfirmDeleteDialog
        deleteText="category"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />

      <ConfirmDeleteDialog
        deleteText="selected categories"
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={isDeleting}
      />
    </div>
  );
}
