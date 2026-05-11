"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
import { AdminRevenuePoint } from "@/types/admin-dashboard";
import {
  chartConfig,
  compactNumberFormatter,
  currencyFormatter,
} from "./dashboard-utils";

export function RevenueTrendCard({
  data,
}: {
  data: AdminRevenuePoint[];
}) {
  return (
    <Card className="border-[var(--brand-100)] bg-white dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardHeader>
        <CardTitle className="text-slate-950 dark:text-white">Revenue Trend</CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-300">
          Monthly paid revenue, discounts, and order activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <AreaChart data={data} margin={{ left: 8, right: 8 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.36}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.04}
                />
              </linearGradient>
              <linearGradient id="discountFill" x1="0" x2="0" y1="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-discounts)"
                  stopOpacity={0.18}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-discounts)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) =>
                `₹${compactNumberFormatter.format(Number(value))}`
              }
              tickLine={false}
              axisLine={false}
              width={68}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    name === "orders"
                      ? compactNumberFormatter.format(Number(value))
                      : currencyFormatter.format(Number(value)),
                    name,
                  ]}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="discounts"
              stroke="var(--color-discounts)"
              fill="url(#discountFill)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              fill="url(#revenueFill)"
              strokeWidth={3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
