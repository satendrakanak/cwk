"use client";

import { Order } from "@/types/order";
import { formatDate } from "@/utils/formate-date";

interface Props {
  order: Order;
}

export const OrderQuickInfo = ({ order }: Props) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <h3 className="text-sm font-medium text-slate-950 dark:text-white">Order Info</h3>
      </div>
      <div className="p-3 space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-slate-400">Order ID</span>
            <span className="font-medium">#{order.id}</span>
          </div>

          <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-slate-400">Order At</span>
            <span className="text-xs font-medium">
              {formatDate(order.createdAt)}
            </span>
          </div>

          {order.paidAt && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-slate-400">Paid At</span>
              <span className="text-xs font-medium">
                {formatDate(order.paidAt)}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-xs text-gray-500 dark:text-slate-400">Payment Method</span>
            <span className="uppercase text-xs font-medium">
              {order.paymentMethod}
            </span>
          </div>

          {order.currency && (
            <div className="flex justify-between text-xs">
              <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                Currency
              </span>
              <span>{order.currency}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
