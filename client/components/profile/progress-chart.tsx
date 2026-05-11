"use client";

import { WeeklyProgress } from "@/types/user";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProgressChartProps {
  weeklyProgress: WeeklyProgress[];
}

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const normalizeWeeklyProgress = (weeklyProgress: WeeklyProgress[]) => {
  const progressByDay = new Map(
    weeklyProgress.map((item) => [
      item.day.slice(0, 3),
      Number(item.progress) || 0,
    ]),
  );

  return WEEK_DAYS.map((day) => ({
    day,
    progress: progressByDay.get(day) ?? 0,
  }));
};

export default function ProgressChart({ weeklyProgress }: ProgressChartProps) {
  const chartData = normalizeWeeklyProgress(weeklyProgress);
  const highestValue = Math.max(...chartData.map((item) => item.progress), 0);
  const hasProgress = chartData.some((item) => item.progress > 0);
  const chartMax = Math.max(100, Math.ceil(highestValue / 10) * 10);

  return (
    <div className="academy-card h-full p-4 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Weekly Progress
          </p>

          <h4 className="mt-2 text-lg font-semibold text-card-foreground">
            Your learning rhythm
          </h4>

          <p className="mt-1 text-sm text-muted-foreground">
            Progress completed across the current week.
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-primary/15 bg-primary/10 px-3 py-2 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            Peak
          </p>

          <p className="text-lg font-semibold leading-none text-card-foreground">
            {highestValue}%
          </p>
        </div>
      </div>

      <div className="h-55 rounded-2xl border border-border bg-muted/50 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 12, right: 10, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id="weekly-progress-fill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="65%"
                  stopColor="var(--primary)"
                  stopOpacity={0.12}
                />
                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="color-mix(in oklab, var(--muted-foreground) 24%, transparent)"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
                fill: "var(--muted-foreground)",
                fontWeight: 600,
              }}
            />

            <YAxis
              hide={!hasProgress}
              domain={[0, chartMax]}
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 11,
                fill: "var(--muted-foreground)",
                fontWeight: 500,
              }}
              tickFormatter={(value) => `${value}%`}
            />

            <Tooltip
              cursor={{
                stroke: "var(--muted-foreground)",
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                borderRadius: 18,
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
                background: "var(--popover)",
                color: "var(--popover-foreground)",
              }}
              labelStyle={{
                color: "var(--popover-foreground)",
                fontWeight: 700,
              }}
              formatter={(value) => [`${Number(value || 0)}%`, "Progress"]}
              labelFormatter={(label) => `${label}`}
            />

            <Area
              type="monotone"
              dataKey="progress"
              stroke="var(--primary)"
              strokeWidth={3}
              fill="url(#weekly-progress-fill)"
              dot={{
                r: 4,
                strokeWidth: 2,
                stroke: "var(--primary)",
                fill: "var(--card)",
              }}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                stroke: "var(--primary)",
                fill: "var(--card)",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {!hasProgress ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
          Start watching lessons this week and your progress trend will appear
          here.
        </p>
      ) : null}
    </div>
  );
}
