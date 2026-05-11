"use client";

import { flexRender, type Row } from "@tanstack/react-table";

import { TableCell, TableRow } from "@/components/ui/table";

export function DataTableRow<TData>({ row }: { row: Row<TData> }) {
  return (
    <TableRow>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
