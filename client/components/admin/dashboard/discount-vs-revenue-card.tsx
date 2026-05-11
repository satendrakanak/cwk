"use client";

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
import { AdminRevenuePoint } from "@/types/admin-dashboard";
import {
  chartConfig,
  compactNumberFormatter,
  currencyFormatter,
} from "./dashboard-utils";

export function DiscountVsRevenueCard({
  data,
}: {
  data: AdminRevenuePoint[];
}) {
  return (
    <Card className="border-[var(--brand-100)] bg-white dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardHeader>
        <CardTitle>Discount vs Revenue</CardTitle>
        <CardDescription>
          Understand how promotions are affecting topline.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart data={data} margin={{ left: 8, right: 8 }}>
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
                  formatter={(value) => [
                    currencyFormatter.format(Number(value)),
                    "amount",
                  ]}
                />
              }
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[10, 10, 0, 0]}
            />
            <Bar
              dataKey="discounts"
              fill="var(--color-discounts)"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
