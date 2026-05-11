"use client";

import { Order } from "@/types/order";
import { DateRangeValue } from "@/lib/date-range";
import { OrdersList } from "./orders-list";

export function OrdersListLoader({
  orders,
  dateRange,
}: {
  orders: Order[];
  dateRange: DateRangeValue;
}) {
  return <OrdersList orders={orders} dateRange={dateRange} />;
}
