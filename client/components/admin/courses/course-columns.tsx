"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Course } from "@/types/course";
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
import { Copy, Pencil, Trash2 } from "lucide-react";
import { Category } from "@/types/category";
import { formatDate } from "@/utils/formate-date";

export const getCourseColumns = (
  onDelete: (course: Course) => void,
  onDuplicate: (course: Course) => void,
): ColumnDef<Course>[] => [
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
    header: "Course",
    cell: ({ row }) => {
      const course = row.original;

      return (
        <div className="flex items-center gap-3">
          {course.image?.path && (
            <Link href={`/admin/courses/${course.id}`}>
              <Image
                alt={course.title}
                src={course.image.path}
                width={40}
                height={40}
                className="w-10 h-10 rounded object-cover"
              />
            </Link>
          )}
          <Link href={`/admin/courses/${course.id}`}>
            <span className="font-medium">{course.title}</span>
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

  // ✅ Price
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `₹${row.original.priceInr || 0}`,
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
      const course = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/courses/${course.id}`}
                className="cursor-pointer flex items-center gap-2"
              >
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDuplicate(course)}
              className="cursor-pointer flex items-center gap-2"
            >
              <Copy className="size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(course)}
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
