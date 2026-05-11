"use client";

import Link from "next/link";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { IconDotsVertical } from "@tabler/icons-react";
import { Pencil, Trash2 } from "lucide-react";

import { Category } from "@/types/category";
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

export const getCategoriesColumns = (
  onEdit: (category: Category) => void,
  onDelete: (category: Category) => void,
): ColumnDef<Category>[] => [
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
    cell: ({ row }) => {
      const category = row.original;

      return (
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="flex items-center gap-3 text-left"
        >
          <Image
            src={category.image?.path || "/assets/default.png"}
            alt={category.imageAlt || category.name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900 dark:text-white">
              {category.name}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {category.description || "No description added yet."}
            </p>
          </div>
        </button>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.type}
      </Badge>
    ),
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
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onEdit(category)}
              className="cursor-pointer"
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={category.type === "course" ? "/admin/courses" : "/admin/articles"}>
                Open {category.type}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(category)}
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
