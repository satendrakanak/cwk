"use client";

import { Order } from "@/types/order";
import { OrderStatusManager } from "./order-status-manager";
import { OrderQuickInfo } from "./order-quick-info";
import { RefundTimeline } from "@/components/refunds/refund-timeline";

interface OrderRightSidebarProps {
  order: Order;
}

export const OrderRightSidebar = ({ order }: OrderRightSidebarProps) => {
  const latestRefundRequest = order.refundRequests
    ?.slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

  return (
    <div className="sticky top-24 space-y-4">
      <OrderStatusManager order={order} />
      <OrderQuickInfo order={order} />
      {latestRefundRequest ? (
        <RefundTimeline
          refundRequest={latestRefundRequest}
          title="Refund trail"
        />
      ) : null}
    </div>
  );
};
