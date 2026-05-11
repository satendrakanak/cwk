"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AdminTopCoursePoint } from "@/types/admin-dashboard";
import {
  chartConfig,
  compactNumberFormatter,
  currencyFormatter,
} from "./dashboard-utils";

export function TopCoursesCard({
  data,
}: {
  data: AdminTopCoursePoint[];
}) {
  const topCourses = data.slice(0, 5);

  return (
    <Card className="border-[var(--brand-100)] bg-white dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Top Selling Courses</CardTitle>
          <CardDescription>
            Based on order item quantity and paid revenue contribution.
          </CardDescription>
        </div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-700)] hover:underline"
        >
          View courses
          <ArrowUpRight className="size-4" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-5">
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={topCourses} layout="vertical" margin={{ left: 8, right: 8 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="title"
              tickLine={false}
              axisLine={false}
              width={130}
              tickFormatter={(value) =>
                value.length > 22 ? `${value.slice(0, 22)}...` : value
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    name === "revenue"
                      ? currencyFormatter.format(Number(value))
                      : compactNumberFormatter.format(Number(value)),
                    name,
                  ]}
                />
              }
            />
            <Bar
              dataKey="sales"
              radius={[0, 10, 10, 0]}
              fill="var(--color-sales)"
            />
          </BarChart>
        </ChartContainer>

        <div className="grid gap-3">
          {topCourses.map((course, index) => (
            <div
              key={`${course.id}-${course.slug || course.title}-${index}`}
              className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 transition hover:border-[var(--brand-200)] hover:bg-[var(--brand-50)]/35 dark:border-white/10 dark:hover:bg-white/6"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  #{index + 1} {course.title}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {course.sales} sales
                </p>
              </div>
              <p className="text-sm font-semibold text-[var(--brand-700)]">
                {currencyFormatter.format(course.revenue)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
