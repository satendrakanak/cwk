"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { IconDotsVertical } from "@tabler/icons-react";
import { Pencil, PlayCircle, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Testimonial } from "@/types/testimonial";
import { formatDate } from "@/utils/formate-date";

export const getTestimonialColumns = (
  onEdit: (testimonial: Testimonial) => void,
  onDelete: (testimonial: Testimonial) => void,
): ColumnDef<Testimonial>[] => [
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
    header: "Person",
    cell: ({ row }) => {
      const testimonial = row.original;

      return (
        <div
          onClick={() => onEdit(testimonial)}
          className="flex cursor-pointer items-center gap-3"
        >
          <Image
            src={testimonial.avatar?.path || "/assets/default.png"}
            alt={testimonial.avatarAlt || testimonial.name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />

          <div className="space-y-0.5">
            <p className="font-medium">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">
              {testimonial.designation || "No designation added"}
            </p>
            <p className="text-sm text-muted-foreground">
              {testimonial.company || "No company added"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.type === "VIDEO" ? "Video" : "Text"}
      </Badge>
    ),
  },
  {
    id: "courses",
    header: "Courses",
    cell: ({ row }) => {
      const courseNames =
        row.original.courses?.map((course) => course.title) || [];

      return (
        <p className="max-w-xs truncate text-sm text-muted-foreground">
          {courseNames.length ? courseNames.join(", ") : "General testimonial"}
        </p>
      );
    },
  },
  {
    id: "preview",
    header: "Preview",
    cell: ({ row }) => {
      const testimonial = row.original;

      if (testimonial.type === "VIDEO") {
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PlayCircle className="size-4" />
            {testimonial.video?.name || "Video testimonial"}
          </div>
        );
      }

      return (
        <p className="max-w-md truncate text-sm text-muted-foreground">
          {testimonial.message || "No text added"}
        </p>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 font-medium">
        <Star className="size-4 fill-current text-amber-500" />
        {row.original.rating}/5
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-2">
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
        <Badge variant="outline">{row.original.status}</Badge>
        {row.original.isFeatured && <Badge variant="outline">Featured</Badge>}
      </div>
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
      const testimonial = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <IconDotsVertical />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onEdit(testimonial)}
              className="cursor-pointer"
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(testimonial)}
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
