"use client";

import { compactNumberFormatter, currencyFormatter } from "./dashboard-utils";
import { AdminDashboardSummary } from "@/types/admin-dashboard";

export function DashboardHero({ summary }: { summary: AdminDashboardSummary }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-[var(--brand-100)] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_34%),linear-gradient(135deg,var(--brand-950)_0%,var(--brand-800)_48%,var(--brand-500)_100%)] p-6 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)] md:p-8">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:78px_78px]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
            Admin Dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-[-0.03em] md:text-5xl">
            Business health, revenue trends, and growth signals in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/78 md:text-lg">
            Monitor learners, orders, top-selling courses, and coupon
            performance without jumping between pages.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
          <div className="flex min-h-30 flex-col justify-between rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/60">
              AOV
            </p>
            <p className="mt-3 break-words text-2xl font-bold leading-tight">
              {currencyFormatter.format(summary.averageOrderValue)}
            </p>
          </div>
          <div className="flex min-h-30 flex-col justify-between rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/60">
              Orders
            </p>
            <p className="mt-3 break-words text-2xl font-bold leading-tight">
              {compactNumberFormatter.format(summary.paidOrders)}
            </p>
          </div>
          <div className="flex min-h-30 flex-col justify-between rounded-2xl border border-white/14 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/60">
              Coupons
            </p>
            <p className="mt-3 break-words text-2xl font-bold leading-tight">
              {compactNumberFormatter.format(summary.totalCoupons)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
