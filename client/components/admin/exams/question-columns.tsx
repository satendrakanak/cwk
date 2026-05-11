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
import { Question, QuestionType } from "@/types/exam";
import { formatDate } from "@/utils/formate-date";

export const questionTypeLabels: Record<QuestionType, string> = {
  mcq_single: "MCQ Single",
  mcq_multiple: "MCQ Multiple",
  true_false: "True / False",
  short_answer: "Short Answer",
  numerical: "Numerical",
  matching: "Matching",
  essay: "Essay",
};

export const getQuestionColumns = (
  onEdit: (question: Question) => void,
  onDuplicate: (question: Question) => void,
  onDelete: (question: Question) => void,
): ColumnDef<Question>[] => [
  {
    id: "select",
    size: 42,
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
    accessorKey: "title",
    header: "Question",
    size: 420,
    cell: ({ row }) => (
      <div className="min-w-0 max-w-[min(44vw,34rem)] whitespace-normal">
        <p className="line-clamp-1 font-medium text-foreground">
          {row.original.title}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {row.original.prompt}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    size: 140,
    cell: ({ row }) => (
      <Badge variant="outline" className="whitespace-nowrap">
        {questionTypeLabels[row.original.type]}
      </Badge>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    size: 180,
    cell: ({ row }) => (
      <span className="block max-w-40 truncate">
        {row.original.category?.name ?? "Uncategorized"}
      </span>
    ),
  },
  {
    accessorKey: "defaultPoints",
    header: "Marks",
    size: 80,
    cell: ({ row }) => (
      <div>
        <p>{Number(row.original.defaultPoints || 0)}</p>
        <p className="text-xs text-muted-foreground">
          -{Number(row.original.defaultNegativeMarks || 0)}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    size: 120,
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    size: 52,
    cell: ({ row }) => {
      const question = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(question)}>
              <Edit className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(question)}>
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(question)}
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
