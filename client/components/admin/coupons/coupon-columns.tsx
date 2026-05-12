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
import { Coupon, CouponScope, CouponStatus, CouponType } from "@/types/coupon";
import { formatDate } from "@/utils/formate-date";
import { formatPrice } from "@/utils/prices";

function formatCouponValue(coupon: Coupon) {
  const value = Number(coupon.value || 0);

  if (coupon.type === CouponType.PERCENTAGE) {
    const cap = coupon.maxDiscount
      ? ` up to ₹${formatPrice(Number(coupon.maxDiscount))}`
      : "";

    return `${value}%${cap}`;
  }

  return `₹${formatPrice(value)}`;
}

function getStatusBadge(coupon: Coupon) {
  if (coupon.status === CouponStatus.ACTIVE) {
    return <Badge className="bg-emerald-600 text-white">Active</Badge>;
  }

  if (coupon.status === CouponStatus.EXPIRED) {
    return <Badge variant="destructive">Expired</Badge>;
  }

  return <Badge variant="secondary">Inactive</Badge>;
}

function getValidityLabel(coupon: Coupon) {
  if (!coupon.validFrom && !coupon.validTill) return "No expiry";
  if (coupon.validFrom && coupon.validTill) {
    return `${formatDate(coupon.validFrom)} - ${formatDate(coupon.validTill)}`;
  }
  if (coupon.validFrom) return `From ${formatDate(coupon.validFrom)}`;
  return `Until ${formatDate(coupon.validTill)}`;
}

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
          <Link href={`/admin/coupons/${coupon.id}`} className="min-w-0">
            <span className="block font-semibold text-slate-950 dark:text-white">
              {coupon.code}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {coupon.isAutoApply ? "Auto apply" : "Manual code"}
            </span>
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
      const coupon = row.original;

      return (
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline">
            {coupon.type === CouponType.PERCENTAGE ? "Percentage" : "Fixed"}
          </Badge>
          <Badge variant="secondary">
            {coupon.scope === CouponScope.GLOBAL ? "All courses" : "Selected"}
          </Badge>
        </div>
      );
    },
  },

  {
    accessorKey: "value",
    header: "Discount",
    cell: ({ row }) => {
      const coupon = row.original;

      return (
        <div>
          <span className="font-semibold text-slate-950 dark:text-white">
            {formatCouponValue(coupon)}
          </span>
          {coupon.minOrderValue ? (
            <span className="mt-1 block text-xs text-muted-foreground">
              Min cart ₹{formatPrice(Number(coupon.minOrderValue))}
            </span>
          ) : null}
        </div>
      );
    },
  },

  {
    id: "usage",
    header: "Usage",
    cell: ({ row }) => {
      const coupon = row.original;
      const usedCount = Number(coupon.usedCount || 0);
      const usageLimit = coupon.usageLimit ? Number(coupon.usageLimit) : null;
      const percent = usageLimit
        ? Math.min(Math.round((usedCount / usageLimit) * 100), 100)
        : 0;

      return (
        <div className="min-w-28">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-medium text-slate-900 dark:text-white">
              {usedCount}
              {usageLimit ? `/${usageLimit}` : ""}
            </span>
            <span className="text-xs text-muted-foreground">
              {coupon.perUserLimit || 1}/user
            </span>
          </div>
          {usageLimit ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${percent}%` }}
              />
            </div>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Unlimited</p>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.original),
  },

  {
    id: "validity",
    header: "Validity",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {getValidityLabel(row.original)}
      </span>
    ),
  },

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
