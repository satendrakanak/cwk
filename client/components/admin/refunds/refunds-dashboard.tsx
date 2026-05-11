"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { CircleDollarSign, Clock3, ShieldCheck } from "lucide-react";
import { AdminResourceDashboard } from "@/components/admin/shared/admin-resource-dashboard";
import { RefundStatusBadge } from "@/components/refunds/refund-status-badge";
import { RefundRequest, RefundRequestStatus } from "@/types/order";
import { Button } from "@/components/ui/button";
import { RefundReviewDialog } from "./refund-review-dialog";
import { formatDateTime } from "@/utils/formate-date";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import {
  DateRangeValue,
  updateDateRangeSearchParams,
} from "@/lib/date-range";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function RefundsDashboard({
  refundRequests,
  dateRange,
}: {
  refundRequests: RefundRequest[];
  dateRange: DateRangeValue;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(
    null,
  );

  const columns = useMemo<ColumnDef<RefundRequest>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Request",
        cell: ({ row }) => (
          <button
            type="button"
            className="font-semibold text-[var(--brand-700)] hover:underline dark:text-[var(--brand-200)]"
            onClick={() => setSelectedRefund(row.original)}
          >
            #{row.original.id}
          </button>
        ),
      },
      {
        header: "Order",
        cell: ({ row }) => {
          const order = row.original.order;
          const item = order?.items?.[0];
          return (
            <div className="min-w-0">
              <p className="font-medium text-slate-900 dark:text-white">
                {order ? `#${order.id}` : "Order unavailable"}
              </p>
              <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                {item?.course?.title || "Course order"}
              </p>
            </div>
          );
        },
      },
      {
        header: "Customer",
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="font-medium text-slate-900 dark:text-white">
              {row.original.requester?.firstName}{" "}
              {row.original.requester?.lastName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {row.original.requester?.email}
            </p>
          </div>
        ),
      },
      {
        header: "Amount",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-semibold text-slate-900 dark:text-white">
              {currencyFormatter.format(
                Number(row.original.requestedAmount || 0),
              )}
            </p>
            {row.original.approvedAmount ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Approved:{" "}
                {currencyFormatter.format(
                  Number(row.original.approvedAmount || 0),
                )}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <RefundStatusBadge
            status={row.original.status}
            className="text-[10px]"
          />
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-sm text-slate-600 dark:text-slate-300">
            {formatDateTime(row.original.createdAt)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={() => setSelectedRefund(row.original)}
          >
            Review
          </Button>
        ),
      },
    ],
    [],
  );

  const pendingCount = refundRequests.filter(
    (request) => request.status === RefundRequestStatus.REQUESTED,
  ).length;
  const processingCount = refundRequests.filter(
    (request) => request.status === RefundRequestStatus.PROCESSING,
  ).length;
  const refundedAmount = refundRequests
    .filter((request) => request.status === RefundRequestStatus.COMPLETED)
    .reduce(
      (sum, request) =>
        sum + Number(request.approvedAmount || request.requestedAmount || 0),
      0,
    );

  const handleDateRangeApply = (nextRange: DateRangeValue) => {
    const params = updateDateRangeSearchParams(searchParams, nextRange);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <AdminResourceDashboard
        eyebrow="Finance"
        title="Refund operations"
        description="Review refund requests, approve or reject them, and keep a complete audit trail for every action taken."
        data={refundRequests}
        columns={columns}
        searchPlaceholder="Search by refund id, order id, customer, email, or status"
        searchFields={[
          (request) => request.id,
          (request) => request.order?.id,
          (request) => request.status,
          (request) => request.requester?.firstName,
          (request) => request.requester?.lastName,
          (request) => request.requester?.email,
          (request) => request.reason,
        ]}
        stats={[
          {
            label: "Open Requests",
            value: pendingCount,
            icon: Clock3,
          },
          {
            label: "Processing",
            value: processingCount,
            icon: ShieldCheck,
          },
          {
            label: "Refunded Value",
            value: currencyFormatter.format(refundedAmount),
            icon: CircleDollarSign,
          },
        ]}
        actions={<DateRangeFilter value={dateRange} onChange={handleDateRangeApply} />}
        exportFileName="refund-requests.xlsx"
        mapExportRow={(request) => ({
          RefundID: request.id,
          OrderID: request.order?.id ?? "",
          Customer:
            `${request.requester?.firstName ?? ""} ${request.requester?.lastName ?? ""}`.trim(),
          Email: request.requester?.email ?? "",
          Status: request.status,
          RequestedAmount: request.requestedAmount,
          ApprovedAmount: request.approvedAmount ?? "",
          Reason: request.reason,
          CreatedAt: request.createdAt,
        })}
        emptyTitle="No refund requests yet"
        emptyDescription="Refund requests will show up here once learners start raising them from their orders."
      />

      <RefundReviewDialog
        refundRequest={selectedRefund}
        open={Boolean(selectedRefund)}
        onOpenChange={(open) => {
          if (!open) setSelectedRefund(null);
        }}
      />
    </>
  );
}
