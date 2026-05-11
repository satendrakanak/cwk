"use client";

import { Table } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconLayoutColumns,
  IconChevronDown,
  IconSearch,
} from "@tabler/icons-react";

export function DataTableToolbar<TData>({
  table,
  searchColumn = "title",
  action, // 🔥 inject anything (AddButton, filters, etc.)
}: {
  table: Table<TData>;
  searchColumn?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 lg:px-6 gap-4">
      {/* 🔥 LEFT → Search */}
      <div className="relative w-full max-w-sm">
        <IconSearch className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-8"
          value={
            (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn(searchColumn)?.setFilterValue(e.target.value)
          }
        />
      </div>

      {/* 🔥 RIGHT */}
      <div className="flex items-center gap-2">
        {/* Column toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <IconLayoutColumns className="size-4" />
              <span className="hidden lg:inline">Columns</span>
              <IconChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  column.getCanHide() &&
                  typeof column.accessorFn !== "undefined",
              )
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  className="capitalize"
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 🔥 Injected Action */}
        {action}
      </div>
    </div>
  );
}
