"use client";

import {
  BadgeIndianRupee,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  TicketPercent,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdminDashboardData } from "@/types/admin-dashboard";
import {
  compactNumberFormatter,
  currencyFormatter,
} from "./dashboard-utils";

const statCards = (data: AdminDashboardData) => [
  {
    title: "Total Revenue",
    value: currencyFormatter.format(data.summary.totalRevenue),
    description: `${data.summary.paidOrders} paid orders processed`,
    icon: BadgeIndianRupee,
    tone: "from-[var(--brand-500)]/18 via-[var(--brand-100)] to-white dark:from-[rgba(177,63,50,0.18)] dark:via-[rgba(255,255,255,0.05)] dark:to-[rgba(17,27,46,0.98)]",
  },
  {
    title: "Total Users",
    value: compactNumberFormatter.format(data.summary.totalUsers),
    description: `${data.summary.enrolledUsers}/${data.summary.totalUsers} users have enrolled in at least one paid order`,
    icon: Users,
    tone: "from-emerald-500/16 via-emerald-50 to-white dark:from-emerald-500/16 dark:via-[rgba(255,255,255,0.05)] dark:to-[rgba(17,27,46,0.98)]",
  },
  {
    title: "Published Courses",
    value: `${data.summary.publishedCourses}/${data.summary.totalCourses}`,
    description: "Live courses visible to learners",
    icon: BookOpen,
    tone: "from-sky-500/16 via-sky-50 to-white dark:from-sky-500/16 dark:via-[rgba(255,255,255,0.05)] dark:to-[rgba(17,27,46,0.98)]",
  },
  {
    title: "Coupon Redemptions",
    value: compactNumberFormatter.format(data.summary.couponRedemptions),
    description: `${currencyFormatter.format(data.summary.totalDiscountGiven)} discount granted`,
    icon: TicketPercent,
    tone: "from-violet-500/16 via-violet-50 to-white dark:from-violet-500/16 dark:via-[rgba(255,255,255,0.05)] dark:to-[rgba(17,27,46,0.98)]",
  },
  {
    title: "Exam Attempts",
    value: compactNumberFormatter.format(data.summary.totalExamAttempts),
    description: `${data.summary.passedExamAttempts} passed attempts with ${data.examOverview.passRate}% pass rate`,
    icon: ClipboardCheck,
    tone: "from-amber-500/16 via-amber-50 to-white dark:from-amber-500/16 dark:via-[rgba(255,255,255,0.05)] dark:to-[rgba(17,27,46,0.98)]",
  },
  {
    title: "Certificates Issued",
    value: compactNumberFormatter.format(data.summary.certificatesIssued),
    description: `${data.summary.averageExamScore}% average exam score overall`,
    icon: GraduationCap,
    tone: "from-rose-500/16 via-rose-50 to-white dark:from-rose-500/16 dark:via-[rgba(255,255,255,0.05)] dark:to-[rgba(17,27,46,0.98)]",
  },
];

export function DashboardSummaryCards({
  data,
}: {
  data: AdminDashboardData;
}) {
  const stats = statCards(data);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.title}
            className={cn(
              "border border-[var(--brand-100)] bg-gradient-to-br transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-36px_rgba(15,23,42,0.4)] dark:border-white/10",
              item.tone,
            )}
          >
            <CardHeader className="pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    {item.title}
                  </CardDescription>
                  <CardTitle className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                    {item.value}
                  </CardTitle>
                </div>
                <div className="rounded-2xl bg-white/80 p-3 text-[var(--brand-700)] shadow-sm dark:bg-white/10 dark:text-[var(--brand-200)]">
                  <Icon className="size-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <p className="text-sm text-slate-500 dark:text-slate-300">{item.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
