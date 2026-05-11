"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IconDotsVertical } from "@tabler/icons-react";
import { Pencil, Trash2 } from "lucide-react";

import { Tag } from "@/types/tag";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/formate-date";

export const getTagsColumns = (
  onEdit: (tag: Tag) => void,
  onDelete: (tag: Tag) => void,
): ColumnDef<Tag>[] => [
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
    header: "Tag",
    cell: ({ row }) => {
      const tag = row.original;

      return (
        <button
          type="button"
          onClick={() => onEdit(tag)}
          className="text-left"
        >
          <p className="font-semibold text-slate-900 dark:text-white">
            {tag.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {tag.description || "Reusable shared tag"}
          </p>
        </button>
      );
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <span className="font-medium text-slate-700 dark:text-slate-300">
        {row.original.slug}
      </span>
    ),
  },
  {
    id: "scope",
    header: "Scope",
    cell: () => <Badge variant="outline">Courses + Articles</Badge>,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const tag = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onEdit(tag)}
              className="cursor-pointer"
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(tag)}
              className="cursor-pointer"
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
