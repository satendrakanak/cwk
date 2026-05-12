"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableContent } from "./data-table-content";
import { useDataTable } from "@/hooks/use-data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { usePaginationDataTable } from "@/hooks/use-pagination-data-table";

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  searchColumn = "title",
  isClient,
  action,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  searchColumn?: string;
  isClient?: boolean;
  action?: React.ReactNode;
}) {
  const clientTable = usePaginationDataTable({ data, columns });
  const serverTable = useDataTable({ data, columns });
  const { table } = isClient ? clientTable : serverTable;

  return (
    <div className="w-full flex flex-col gap-4">
      {/* 🔥 Toolbar */}
      <DataTableToolbar
        table={table}
        searchColumn={searchColumn}
        action={action}
      />

      {/* 🔥 Table */}
      <div className="px-4 lg:px-6">
        <DataTableContent
          table={table}
          data={data}
          getRowId={(row) => row.id}
        />
      </div>

      {/* 🔥 Pagination */}
      <div className="px-4 lg:px-6">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
