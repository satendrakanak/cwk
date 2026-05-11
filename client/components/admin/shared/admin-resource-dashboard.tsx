"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Download, Search, Trash2, type LucideIcon } from "lucide-react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableContent } from "@/components/admin/data-table/data-table-content";
import { DataTablePagination } from "@/components/admin/data-table/data-table-pagination";

type StatItem = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

type AdminResourceDashboardProps<TData extends { id: number | string }> = {
  eyebrow: string;
  title: string;
  description: string;
  data: TData[];
  columns: ColumnDef<TData>[];
  stats: StatItem[];
  searchPlaceholder: string;
  searchFields: Array<(row: TData) => string | number | null | undefined>;
  getRowId?: (row: TData) => string;
  actions?: ReactNode;
  selectedActions?: (selectedRows: TData[]) => ReactNode;
  exportFileName: string;
  mapExportRow: (row: TData) => Record<string, unknown>;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function exportRowsToWorkbook<TData>(
  rows: TData[],
  fileName: string,
  mapRow: (row: TData) => Record<string, unknown>,
) {
  const worksheet = XLSX.utils.json_to_sheet(rows.map(mapRow));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Export");
  XLSX.writeFile(workbook, fileName);
}

export function AdminResourceDashboard<TData extends { id: number | string }>({
  ...props
}: AdminResourceDashboardProps<TData>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <AdminResourceDashboardSkeleton />;
  }

  return <AdminResourceDashboardInner {...props} />;
}

function AdminResourceDashboardInner<TData extends { id: number | string }>({
  eyebrow,
  title,
  description,
  data,
  columns,
  stats,
  searchPlaceholder,
  searchFields,
  getRowId,
  actions,
  selectedActions,
  exportFileName,
  mapExportRow,
  emptyTitle = "No records found",
  emptyDescription = "Data will appear here once it is available.",
}: AdminResourceDashboardProps<TData>) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return data;

    return data.filter((row) =>
      searchFields.some((getValue) =>
        String(getValue(row) ?? "")
          .toLowerCase()
          .includes(needle),
      ),
    );
  }, [data, search, searchFields]);

  // TanStack Table exposes stateful helpers; keeping it local avoids stale references.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: getRowId ?? ((row) => String(row.id)),
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-(--brand-100) bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_55%,#eef4ff_100%)] p-6 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))] dark:shadow-[0_32px_80px_-42px_rgba(0,0,0,0.64)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex rounded-full border border-(--brand-200) bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-(--brand-700) dark:border-white/10 dark:bg-white/8 dark:text-[var(--brand-200)]">
              {eyebrow}
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                {title}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{description}</p>
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end sm:[&>*]:shrink-0">
            {actions}
            <Button
              variant="outline"
              className="rounded-2xl dark:border-white/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/10"
              onClick={() =>
                exportRowsToWorkbook(filteredData, exportFileName, mapExportRow)
              }
              disabled={!filteredData.length}
            >
              <Download className="size-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/80 bg-white px-5 py-4 shadow-sm dark:border-white/10 dark:bg-white/6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
                  {stat.label}
                </p>
                <stat.icon className="size-5 text-(--brand-600)" />
              </div>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))] dark:shadow-[0_32px_80px_-42px_rgba(0,0,0,0.64)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3.5 size-4 text-slate-400 dark:text-slate-500" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 rounded-2xl pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-2xl dark:border-white/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/10"
              disabled={!selectedRows.length}
              onClick={() =>
                exportRowsToWorkbook(
                  selectedRows,
                  `selected-${exportFileName}`,
                  mapExportRow,
                )
              }
            >
              <Download className="size-4" />
              Export Selected
            </Button>
            {selectedActions?.(selectedRows)}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[24px] border border-slate-100 dark:border-white/10">
          {filteredData.length ? (
            <>
              <DataTableContent
                table={table}
                data={filteredData}
                getRowId={(row) => row.id}
              />
              <div className="border-t border-slate-100 py-4 dark:border-white/10">
                <DataTablePagination table={table} />
              </div>
            </>
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="text-base font-semibold text-slate-950 dark:text-white">
                {emptyTitle}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{emptyDescription}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function AdminResourceDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-(--brand-100) bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[rgba(17,27,46,0.96)]">
        <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
        <div className="mt-5 h-9 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-white/10" />
        <div className="mt-3 h-4 max-w-xl animate-pulse rounded bg-slate-200 dark:bg-white/10" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-3xl border border-slate-100 bg-slate-100 dark:border-white/10 dark:bg-white/8"
            />
          ))}
        </div>
      </section>

      <section className="h-96 animate-pulse rounded-[28px] border border-slate-100 bg-white shadow-sm dark:border-white/10 dark:bg-[rgba(17,27,46,0.96)]" />
    </div>
  );
}

export function DeleteSelectedButton({
  disabled,
  onClick,
  label = "Delete Selected",
}: {
  disabled: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <Button
      variant="outline"
      className="rounded-2xl"
      disabled={disabled}
      onClick={onClick}
    >
      <Trash2 className="size-4" />
      {label}
    </Button>
  );
}
