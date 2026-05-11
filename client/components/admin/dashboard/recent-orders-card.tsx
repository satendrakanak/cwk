"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminRecentOrderPoint } from "@/types/admin-dashboard";
import { currencyFormatter, getStatusVariant } from "./dashboard-utils";
import { formatDate } from "@/utils/formate-date";

export function RecentOrdersCard({ data }: { data: AdminRecentOrderPoint[] }) {
  return (
    <Card className="border-(--brand-100) bg-white dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Quick pulse on latest checkout activity.
          </CardDescription>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-(--brand-700) hover:underline dark:text-(--brand-200)"
        >
          View orders
          <ShoppingCart className="size-4" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((order) => (
          <div
            key={order.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-100 px-4 py-4 transition hover:border-(--brand-200) hover:bg-(--brand-50)/35 dark:border-white/10 dark:hover:bg-white/6 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900 dark:text-white">
                  #{order.id} {order.customerName}
                </p>
                <Badge variant={getStatusVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
                {order.courseNames.join(", ")}
              </p>
            </div>

            <div className="flex items-center gap-5 text-sm">
              <div className="text-right">
                <p className="font-semibold text-(--brand-700)">
                  {currencyFormatter.format(order.totalAmount)}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
