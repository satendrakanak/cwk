"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Copy, Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuestionBankCategory } from "@/types/exam";
import { formatDate } from "@/utils/formate-date";

export const getQuestionCategoryColumns = (
  onEdit: (category: QuestionBankCategory) => void,
  onDuplicate: (category: QuestionBankCategory) => void,
  onDelete: (category: QuestionBankCategory) => void,
): ColumnDef<QuestionBankCategory>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-foreground">{row.original.name}</p>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {row.original.description || row.original.slug}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "parent",
    header: "Parent",
    cell: ({ row }) =>
      row.original.parent ? (
        <Badge variant="outline">{row.original.parent.name}</Badge>
      ) : (
        <Badge variant="secondary">Root</Badge>
      ),
  },
  {
    accessorKey: "questionsCount",
    header: "Questions",
    cell: ({ row }) => row.original.questionsCount ?? 0,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const category = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(category)}>
              <Edit className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(category)}>
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(category)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
