"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { IconDotsVertical } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Category } from "@/types/category";
import { Article } from "@/types/article";
import { formatDate } from "@/utils/formate-date";

export const getArticleColumns = (
  onDelete: (article: Article) => void,
): ColumnDef<Article>[] => [
  // ✅ Select
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
  },

  // ✅ Title + Image
  {
    accessorKey: "title",
    header: "Article",
    cell: ({ row }) => {
      const article = row.original;

      return (
        <div className="flex items-center gap-3">
          {article.featuredImage?.path && (
            <Link href={`/admin/articles/${article.id}`}>
              <Image
                alt={article.title}
                src={article.featuredImage.path}
                width={40}
                height={40}
                className="w-10 h-10 rounded object-cover"
              />
            </Link>
          )}
          <Link href={`/admin/articles/${article.id}`}>
            <span className="font-medium">{article.title}</span>
          </Link>
        </div>
      );
    },
  },

  // ✅ Category
  {
    accessorKey: "categories",
    header: "Category",
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 flex-wrap">
          {row.original.categories?.map((cat: Category) => (
            <Badge key={cat.id} variant="outline">
              {cat.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
    cell: ({ row }) => (
      <Badge
        className={
          row.original.isFeatured
            ? "bg-[var(--brand-600)] text-white"
            : "bg-gray-200 text-gray-700"
        }
      >
        {row.original.isFeatured ? "Featured" : "Normal"}
      </Badge>
    ),
  },

  // ✅ Status
  {
    accessorKey: "isPublished",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isPublished ? "default" : "secondary"}>
        {row.original.isPublished ? "Published" : "Draft"}
      </Badge>
    ),
  },

  // ✅ Created Date
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },

  // ✅ Actions
  {
    id: "actions",
    cell: ({ row }) => {
      const article = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild className="cursor-pointer flex items-center gap-2">
              <Link href={`/admin/articles/${article.id}`}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(article)}
              className="cursor-pointer flex items-center gap-2"
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
