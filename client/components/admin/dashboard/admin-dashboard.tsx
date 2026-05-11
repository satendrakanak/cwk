"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { DateRangeValue, updateDateRangeSearchParams } from "@/lib/date-range";
import { AdminDashboardData } from "@/types/admin-dashboard";
import { CouponUsageCard } from "./coupon-usage-card";
import { DashboardHero } from "./dashboard-hero";
import { DashboardSummaryCards } from "./dashboard-summary-cards";
import { DiscountVsRevenueCard } from "./discount-vs-revenue-card";
import { ExamInsightsCard } from "./exam-insights-card";
import { LearningOpsCard } from "./learning-ops-card";
import { OrderStatusCard } from "./order-status-card";
import { RecentOrdersCard } from "./recent-orders-card";
import { RevenueTrendCard } from "./revenue-trend-card";
import { TopCoursesCard } from "./top-courses-card";

type AdminDashboardProps = {
  data: AdminDashboardData;
  dateRange: DateRangeValue;
};

export function AdminDashboard({
  data,
  dateRange,
}: AdminDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleDateRangeApply(nextRange: DateRangeValue) {
    const params = updateDateRangeSearchParams(searchParams, nextRange);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <DateRangeFilter value={dateRange} onChange={handleDateRangeApply} />
      </div>

      <DashboardHero summary={data.summary} />
      <DashboardSummaryCards data={data} />
      <LearningOpsCard data={data} />

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.95fr]">
        <RevenueTrendCard data={data.revenueTrend} />
        <OrderStatusCard data={data.orderStatusDistribution} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TopCoursesCard data={data.topCourses} />
        <CouponUsageCard data={data.couponUsage} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DiscountVsRevenueCard data={data.revenueTrend} />
        <RecentOrdersCard data={data.recentOrders} />
      </section>

      <ExamInsightsCard data={data} />
    </div>
  );
}
