"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleCheck, IndianRupee, ReceiptText } from "lucide-react";

import { getOrderColumns } from "./order-columns";
import { Order, OrderStatus } from "@/types/order";
import { AdminResourceDashboard } from "@/components/admin/shared/admin-resource-dashboard";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import {
  DateRangeValue,
  updateDateRangeSearchParams,
} from "@/lib/date-range";

interface OrdersListProps {
  orders: Order[];
  dateRange: DateRangeValue;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const OrdersList = ({ orders, dateRange }: OrdersListProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const columns = useMemo(() => getOrderColumns(), []);
  const paidOrders = orders.filter((order) => order.status === OrderStatus.PAID);
  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0,
  );

  const handleDateRangeApply = (nextRange: DateRangeValue) => {
    const params = updateDateRangeSearchParams(searchParams, nextRange);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <AdminResourceDashboard
      eyebrow="Commerce"
      title="Orders dashboard"
      description="Review purchases, customers, payment status, revenue, and export order reports."
      data={orders}
      columns={columns}
      searchPlaceholder="Search orders by id, customer, email, or status"
      searchFields={[
        (order) => order.id,
        (order) => order.status,
        (order) => order.user?.firstName,
        (order) => order.user?.lastName,
        (order) => order.user?.email,
        (order) => order.manualCouponCode,
        (order) => order.autoCouponCode,
      ]}
      stats={[
        { label: "Total Orders", value: orders.length, icon: ReceiptText },
        {
          label: "Paid Orders",
          value: paidOrders.length,
          icon: CircleCheck,
        },
        {
          label: "Revenue",
          value: currencyFormatter.format(totalRevenue),
          icon: IndianRupee,
        },
      ]}
      actions={<DateRangeFilter value={dateRange} onChange={handleDateRangeApply} />}
      exportFileName="orders-export.xlsx"
      mapExportRow={(order) => ({
        ID: order.id,
        Customer: `${order.user?.firstName ?? ""} ${order.user?.lastName ?? ""}`.trim(),
        Email: order.user?.email ?? "",
        Status: order.status,
        SubTotal: order.subTotal,
        Discount: order.discount,
        Tax: order.tax,
        TotalAmount: order.totalAmount,
        Currency: order.currency,
        ManualCoupon: order.manualCouponCode ?? "",
        AutoCoupon: order.autoCouponCode ?? "",
        CreatedAt: order.createdAt,
      })}
      emptyTitle="No orders found"
      emptyDescription="Orders will appear here once users start purchasing."
    />
  );
};
