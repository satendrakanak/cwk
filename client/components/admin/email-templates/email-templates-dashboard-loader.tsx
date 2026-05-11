"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { EmailTemplate } from "@/types/email-template";

const EmailTemplatesDashboard = dynamic(
  () =>
    import("./email-templates-dashboard").then(
      (mod) => mod.EmailTemplatesDashboard,
    ),
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

export function EmailTemplatesDashboardLoader({
  templates,
}: {
  templates: EmailTemplate[];
}) {
  return <EmailTemplatesDashboard templates={templates} />;
}
