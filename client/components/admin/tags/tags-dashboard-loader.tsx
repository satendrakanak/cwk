"use client";

import dynamic from "next/dynamic";

import { Tag } from "@/types/tag";

const TagsDashboard = dynamic(
  () => import("./tags-dashboard").then((mod) => mod.TagsDashboard),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="h-56 animate-pulse rounded-[28px] border border-slate-100 bg-slate-100/70" />
        <div className="h-96 animate-pulse rounded-[28px] border border-slate-100 bg-white" />
      </div>
    ),
  },
);

export function TagsDashboardLoader({ tags }: { tags: Tag[] }) {
  return <TagsDashboard tags={tags} />;
}
