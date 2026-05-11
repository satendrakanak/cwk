"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel, // 🔥 वापस add
  useReactTable,
  ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type PaginationState,
} from "@tanstack/react-table";
import { useState } from "react";

export function usePaginationDataTable<TData>({
  data,
  columns,
  getRowId,
  pageCount,
  manualPagination = false, // 🔥 control switch
}: {
  data: TData[];
  columns: ColumnDef<TData>[];
  getRowId?: (row: TData) => string;
  pageCount?: number;
  manualPagination?: boolean; // 🔥 server vs client
}) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

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

    // 🔥 dynamic row id
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

    // 🔥 CONDITIONAL PAGINATION
    ...(manualPagination
      ? {
          manualPagination: true,
          pageCount: pageCount ?? -1,
        }
      : {
          getPaginationRowModel: getPaginationRowModel(), // ✅ client side
        }),
  });

  return { table };
}
