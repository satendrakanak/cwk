"use client";

import dynamic from "next/dynamic";

import { Category } from "@/types/category";

const CategoriesDashboard = dynamic(
  () =>
    import("./categories-dashboard").then((mod) => mod.CategoriesDashboard),
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

export function CategoriesDashboardLoader({
  categories,
}: {
  categories: Category[];
}) {
  return <CategoriesDashboard categories={categories} />;
}
