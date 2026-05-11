"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AdminCouponUsagePoint } from "@/types/admin-dashboard";
import { getStatusVariant } from "./dashboard-utils";

export function CouponUsageCard({
  data,
}: {
  data: AdminCouponUsagePoint[];
}) {
  return (
    <Card className="border-[var(--brand-100)] bg-white dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardHeader>
        <CardTitle>Coupon Usage Stats</CardTitle>
        <CardDescription>
          Track redemption intensity, limits, and auto-apply behaviour.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length ? (
          data.slice(0, 6).map((coupon) => (
            <div
              key={coupon.id}
              className="rounded-2xl border border-slate-100 p-4 transition hover:border-[var(--brand-200)] hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {coupon.code}
                    </p>
                    {coupon.isAutoApply && (
                      <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                        Auto Apply
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {coupon.usedCount} redemptions
                    {coupon.usageLimit
                      ? ` of ${coupon.usageLimit} limit`
                      : " with no hard limit"}
                  </p>
                </div>
                <Badge variant={getStatusVariant(coupon.status)}>
                  {coupon.status}
                </Badge>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Usage rate</span>
                  <span>{coupon.usageRate.toFixed(0)}%</span>
                </div>
                <Progress
                  value={Math.min(coupon.usageRate, 100)}
                  className="h-2 bg-slate-100 dark:bg-white/10"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/4 dark:text-slate-400">
            Coupon analytics will appear here once coupons start getting
            redeemed.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
