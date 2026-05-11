"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type PaginationState,
} from "@tanstack/react-table";
import { useState } from "react";

export function useDataTable<TData>({
  data,
  columns,
  getRowId,
  pageCount,
}: {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowId?: (row: TData) => string;
  pageCount?: number; // 🔥 for server pagination
}) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  // 🔥 server-side pagination state
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },

    // 🔥 dynamic row id (important)
    getRowId: getRowId
      ? (row) => getRowId(row)
      : (_, index) => index.toString(),

    enableRowSelection: true,

    // 🔥 handlers
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,

    // 🔥 core
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),

    // ❌ remove client pagination
    // getPaginationRowModel(),

    // 🔥 server pagination mode
    manualPagination: true,
    pageCount: pageCount ?? -1,
  });

  return { table };
}
