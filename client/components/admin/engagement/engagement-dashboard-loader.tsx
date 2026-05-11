"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { EngagementDashboard } from "@/types/engagement";

const EngagementDashboardClient = dynamic(
  () => import("./engagement-dashboard").then((mod) => mod.EngagementDashboardClient),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <Skeleton className="h-56 rounded-[28px]" />
        <Skeleton className="h-96 rounded-[28px]" />
      </div>
    ),
  },
);

export function EngagementDashboardLoader({
  initialData,
}: {
  initialData: EngagementDashboard;
}) {
  return <EngagementDashboardClient initialData={initialData} />;
}
