"use client";

import { cn } from "@/lib/utils";
import { RefundRequestStatus } from "@/types/order";

const STATUS_STYLES: Record<RefundRequestStatus, string> = {
  [RefundRequestStatus.REQUESTED]:
    "border-primary/15 bg-primary/10 text-primary",
  [RefundRequestStatus.APPROVED]:
    "border-primary/15 bg-primary/10 text-primary",
  [RefundRequestStatus.PROCESSING]:
    "border-primary/15 bg-primary/10 text-primary",
  [RefundRequestStatus.COMPLETED]:
    "border-primary/15 bg-primary/10 text-primary",
  [RefundRequestStatus.REJECTED]:
    "border-destructive/20 bg-destructive/10 text-destructive",
  [RefundRequestStatus.FAILED]:
    "border-destructive/20 bg-destructive/10 text-destructive",
};

export function RefundStatusBadge({
  status,
  className,
}: {
  status: RefundRequestStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        STATUS_STYLES[status],
        className,
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
