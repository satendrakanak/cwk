"use client";

import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Coupon, CouponStatus } from "@/types/coupon";
import { couponClientService } from "@/services/coupons/coupon.client";

interface CouponHeaderProps {
  coupon: Coupon;
}

export const CouponHeader = ({ coupon }: CouponHeaderProps) => {
  const router = useRouter();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // 🔥 STATUS LABEL + UI
  const getStatusBadge = () => {
    switch (coupon.status) {
      case CouponStatus.ACTIVE:
        return <Badge className="text-xs">Active</Badge>;

      case CouponStatus.INACTIVE:
        return (
          <Badge variant="secondary" className="text-xs">
            Inactive
          </Badge>
        );

      case CouponStatus.EXPIRED:
        return (
          <Badge variant="destructive" className="text-xs">
            Expired
          </Badge>
        );

      default:
        return null;
    }
  };

  // 🔥 AUTO APPLY TOGGLE
  const handleToggleAutoApply = async (value: boolean) => {
    try {
      setIsToggling(true);

      await couponClientService.update(coupon.id, {
        isAutoApply: value,
      });

      toast.success(value ? "Auto apply enabled" : "Auto apply disabled");

      router.refresh();
    } catch {
      toast.error("Failed to update auto apply");
    } finally {
      setIsToggling(false);
    }
  };

  // 🔥 DELETE
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await couponClientService.delete(coupon.id);

      toast.success("Coupon deleted");
      router.push("/admin/coupons");
    } catch {
      toast.error("Failed to delete coupon");
    } finally {
      setIsDeleting(false);
      setOpenDeleteDialog(false);
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60 dark:border-white/10 dark:bg-[rgba(11,18,32,0.88)]">
      <div className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-950 dark:text-white">{coupon.code}</h1>

          <div className="flex items-center gap-2">
            {getStatusBadge()}

            <p className="text-sm text-muted-foreground">
              Manage your coupon settings
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {/* AUTO APPLY */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto Apply</span>
            <Switch
              checked={coupon.isAutoApply}
              onCheckedChange={handleToggleAutoApply}
              disabled={isToggling}
            />
          </div>

          {/* DELETE */}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setOpenDeleteDialog(true)}
            className="w-full sm:w-auto"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>

        <ConfirmDeleteDialog
          deleteText="coupon"
          open={openDeleteDialog}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleDelete}
          loading={isDeleting}
        />
      </div>
    </div>
  );
};
