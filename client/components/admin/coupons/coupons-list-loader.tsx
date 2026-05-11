"use client";

import { Coupon } from "@/types/coupon";
import { DateRangeValue } from "@/lib/date-range";
import { CouponsList } from "./coupons-list";

export function CouponsListLoader({
  coupons,
  dateRange,
}: {
  coupons: Coupon[];
  dateRange: DateRangeValue;
}) {
  return <CouponsList coupons={coupons} dateRange={dateRange} />;
}
