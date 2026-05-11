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
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Coupon } from "@/types/coupon";
import { formatDate } from "@/utils/formate-date";

export const getCouponColumns = (
  onDelete: (coupon: Coupon) => void,
): ColumnDef<Coupon>[] => [
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
    accessorKey: "code",
    header: "Coupon",
    cell: ({ row }) => {
      const coupon = row.original;

      return (
        <div className="flex items-center gap-3">
          <Link href={`/admin/coupons/${coupon.id}`}>
            <span className="font-medium">{coupon.code}</span>
          </Link>
        </div>
      );
    },
  },

  // ✅ Category
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 flex-wrap">
          <Badge variant="outline">{row.original.type}</Badge>
        </div>
      );
    },
  },

  // ✅ Price
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => `₹${row.original.value || 0}`,
  },

  // ✅ Status
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status ? "default" : "secondary"}>
        {row.original.status ? "Published" : "Draft"}
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
      const coupon = row.original;

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
                href={`/admin/coupons/${coupon.id}`}
                className="cursor-pointer flex items-center gap-2"
              >
                <Pencil className="size-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(coupon)}
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
