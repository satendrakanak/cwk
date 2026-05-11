"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BadgePercent, CircleCheck, TicketPercent } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { getCouponColumns } from "./coupon-columns";
import { Coupon, CouponStatus } from "@/types/coupon";
import { couponClientService } from "@/services/coupons/coupon.client";
import AddButton from "../data-table/add-button";
import { CreateCouponForm } from "./create-coupon-form";
import {
  AdminResourceDashboard,
  DeleteSelectedButton,
} from "@/components/admin/shared/admin-resource-dashboard";
import { getErrorMessage } from "@/lib/error-handler";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import {
  DateRangeValue,
  updateDateRangeSearchParams,
} from "@/lib/date-range";

interface CouponsListProps {
  coupons: Coupon[];
  dateRange: DateRangeValue;
}

export const CouponsList = ({ coupons, dateRange }: CouponsListProps) => {
  const [deleteItem, setDeleteItem] = useState<Coupon | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const columns = useMemo(
    () =>
      getCouponColumns((coupon) => {
        setDeleteItem(coupon);
        setDeleteOpen(true);
      }),
    [],
  );

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    try {
      setLoading(true);
      await couponClientService.delete(deleteItem.id);
      toast.success("Coupon deleted");
      setDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedForDelete.length) return;

    try {
      setLoading(true);
      await Promise.all(
        selectedForDelete.map((coupon) => couponClientService.delete(coupon.id)),
      );
      toast.success(`${selectedForDelete.length} coupons deleted`);
      setBulkDeleteOpen(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeApply = (nextRange: DateRangeValue) => {
    const params = updateDateRangeSearchParams(searchParams, nextRange);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <AdminResourceDashboard
        eyebrow="Promotions"
        title="Coupons dashboard"
        description="Track coupon codes, activation status, usage counts, and export discount data."
        data={coupons}
        columns={columns}
        searchPlaceholder="Search coupons by code, type, or status"
        searchFields={[
          (coupon) => coupon.code,
          (coupon) => coupon.type,
          (coupon) => coupon.status,
          (coupon) => coupon.scope,
        ]}
        stats={[
          { label: "Total Coupons", value: coupons.length, icon: TicketPercent },
          {
            label: "Active",
            value: coupons.filter((coupon) => coupon.status === CouponStatus.ACTIVE).length,
            icon: CircleCheck,
          },
          {
            label: "Redemptions",
            value: coupons.reduce((sum, coupon) => sum + (coupon.usedCount || 0), 0),
            icon: BadgePercent,
          },
        ]}
        actions={
          <>
            <AddButton
              title="Add Coupon"
              redirectPath="/admin/coupons"
              FormComponent={CreateCouponForm}
            />
            <DateRangeFilter value={dateRange} onChange={handleDateRangeApply} />
          </>
        }
        selectedActions={(selectedRows) => (
          <DeleteSelectedButton
            disabled={!selectedRows.length}
            onClick={() => {
              setSelectedForDelete(selectedRows);
              setBulkDeleteOpen(true);
            }}
          />
        )}
        exportFileName="coupons-export.xlsx"
        mapExportRow={(coupon) => ({
          ID: coupon.id,
          Code: coupon.code,
          Type: coupon.type,
          Value: coupon.value,
          Scope: coupon.scope,
          Status: coupon.status,
          UsedCount: coupon.usedCount,
          ValidFrom: coupon.validFrom,
          ValidTill: coupon.validTill,
        })}
        emptyTitle="No coupons found"
        emptyDescription="Coupons will appear here once they are created."
      />

      <ConfirmDeleteDialog
        deleteText="coupon"
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />

      <ConfirmDeleteDialog
        deleteText="selected coupons"
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={loading}
      />
    </>
  );
};
