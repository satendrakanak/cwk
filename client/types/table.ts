import { ColumnDef } from "@tanstack/react-table";

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  enablePagination?: boolean;
  enableSorting?: boolean;
  enableRowSelection?: boolean;
}
