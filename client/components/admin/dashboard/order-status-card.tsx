"use client";

import { Cell, Pie, PieChart } from "recharts";

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
import { AdminStatusPoint } from "@/types/admin-dashboard";
import { chartConfig } from "./dashboard-utils";

export function OrderStatusCard({
  data,
}: {
  data: AdminStatusPoint[];
}) {
  return (
    <Card className="border-[var(--brand-100)] bg-white dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardHeader>
        <CardTitle className="text-slate-950 dark:text-white">Order Status Split</CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-300">
          Payment flow health across all recorded orders.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[260px] w-full max-w-[320px]"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={72}
              outerRadius={102}
              paddingAngle={4}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
          </PieChart>
        </ChartContainer>

        <div className="grid gap-3">
          {data.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/6"
            >
              <div className="flex items-center gap-3">
                <span
                  className="size-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {item.name}
                </span>
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-300">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
