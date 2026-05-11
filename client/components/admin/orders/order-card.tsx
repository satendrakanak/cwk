"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/types/order";
import Image from "next/image";

interface OrderCardProps {
  order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  return (
    <Card className="rounded-2xl shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardContent className="p-6 space-y-6">
        {/* 🔥 ITEMS */}
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 border-b border-slate-100 pb-4 last:border-0 dark:border-white/10"
            >
              {/* 🔹 IMAGE */}
              <div className="relative h-16 w-20 overflow-hidden rounded-md bg-gray-100 dark:bg-white/8">
                {item.course?.image?.path ? (
                  <Image
                    src={item.course.image.path}
                    alt={item.course?.title || "course"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400 dark:text-slate-500">
                    No Image
                  </div>
                )}
              </div>

              {/* 🔹 DETAILS */}
              <div className="flex-1">
                <p className="font-medium text-sm line-clamp-2">
                  {item.course?.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Qty: {item.quantity}</p>
              </div>

              {/* 🔹 PRICE */}
              <div className="text-right">
                <p className="text-sm font-semibold">
                  ₹{item.price * item.quantity}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">₹{item.price} each</p>
              </div>
            </div>
          ))}
        </div>

        {/* 🔥 PRICING SUMMARY */}
        <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm dark:bg-white/6">
          {/* Subtotal */}
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-slate-300">Subtotal</span>
            <span>₹{order.subTotal}</span>
          </div>

          {/* 🔥 AUTO COUPON */}
          {order.autoCouponCode && (
            <div className="flex justify-between text-green-600">
              <span>Auto Coupon ({order.autoCouponCode})</span>
              <span>- ₹{order.autoDiscount || 0}</span>
            </div>
          )}

          {/* 🔥 MANUAL COUPON */}
          {order.manualCouponCode && (
            <div className="flex justify-between text-blue-600">
              <span>Coupon ({order.manualCouponCode})</span>
              <span>- ₹{order.manualDiscount || 0}</span>
            </div>
          )}

          {/* 🔥 TOTAL DISCOUNT */}
          <div className="flex justify-between text-red-500">
            <span>Total Discount</span>
            <span>- ₹{order.discount}</span>
          </div>

          {/* 🔥 TAX (NEW ADD) */}
          {order.tax > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Tax</span>
              <span>₹{order.tax}</span>
            </div>
          )}

          {/* TOTAL */}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold dark:border-white/10">
            <span>Total</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
