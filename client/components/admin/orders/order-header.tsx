"use client";

import { Badge } from "@/components/ui/badge";
import { Order } from "@/types/order";
import { formatDateTime } from "@/utils/formate-date";

interface OrderHeaderProps {
  order: Order;
}

export const OrderHeader = ({ order }: OrderHeaderProps) => {
  return (
    <div className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-[rgba(11,18,32,0.88)]">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        {/* 🔥 LEFT */}
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Order #{order.id}
          </h1>

          {/* 🔥 STATUS + DATE */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={
                order.status === "PAID"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : order.status === "REFUNDED"
                    ? "bg-sky-100 text-sky-700 border border-sky-200"
                    : order.status === "FAILED"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : order.status === "CANCELLED"
                        ? "bg-gray-100 text-gray-700 border border-gray-200"
                        : order.status.startsWith("REFUND_")
                          ? "bg-violet-100 text-violet-700 border border-violet-200"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-200"
              }
            >
              {order.status}
            </Badge>

            <p className="text-sm text-muted-foreground">
              {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        <div />
      </div>
    </div>
  );
};
