"use client";

import { Coupon } from "@/types/coupon";
import { CouponQuickInfo } from "./coupon-quick-info";
import { CouponTypeForm } from "./coupon-type-form";
import { CouponScopeForm } from "./coupon-scope-form";
import { CouponStatusForm } from "./coupon-status-form";

interface RightSidebarProps {
  coupon: Coupon;
}

export const RightSidebar = ({ coupon }: RightSidebarProps) => {
  return (
    <div className="sticky top-24 space-y-4">
      <CouponStatusForm coupon={coupon} />

      <CouponTypeForm coupon={coupon} />

      <CouponScopeForm coupon={coupon} />
      {/* 🔥 Quick Info */}
      <CouponQuickInfo coupon={coupon} />
    </div>
  );
};
