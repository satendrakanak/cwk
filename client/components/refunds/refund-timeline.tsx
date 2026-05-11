"use client";

import { Clock3, UserRound } from "lucide-react";

import { RefundRequest } from "@/types/order";
import { RefundStatusBadge } from "./refund-status-badge";
import { formatDateTime } from "@/utils/formate-date";

function formatAction(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function RefundTimeline({
  refundRequest,
  title = "Refund timeline",
}: {
  refundRequest: RefundRequest;
  title?: string;
}) {
  return (
    <div className="academy-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Clock3 className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-card-foreground">
              {title}
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Requested on {formatDateTime(refundRequest.createdAt)}
            </p>
          </div>
        </div>

        <RefundStatusBadge status={refundRequest.status} />
      </div>

      <div className="mt-5 space-y-3">
        {refundRequest.logs?.length ? (
          refundRequest.logs.map((log, index) => {
            const actorName = log.actor
              ? `${log.actor.firstName || ""} ${
                  log.actor.lastName || ""
                }`.trim() || log.actor.email
              : log.actorType;

            const isLast = index === refundRequest.logs.length - 1;

            return (
              <div key={log.id} className="relative pl-6">
                <div className="absolute left-2 top-0 h-full w-px bg-border" />

                <div className="absolute left-0 top-4 z-10 h-4 w-4 rounded-full border-2 border-primary bg-card shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_10%,transparent)]" />

                <div className="rounded-2xl border border-border bg-muted/50 p-4 transition-colors hover:border-primary/25 hover:bg-primary/5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-card-foreground">
                        {formatAction(log.action)}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <UserRound className="h-3.5 w-3.5 text-primary" />
                          By {actorName || "System"}
                        </span>

                        <span className="text-muted-foreground/45">•</span>

                        <span>{formatDateTime(log.createdAt)}</span>
                      </div>
                    </div>

                    {log.toStatus ? (
                      <RefundStatusBadge
                        status={log.toStatus}
                        className="text-[10px]"
                      />
                    ) : null}
                  </div>

                  {log.message ? (
                    <p className="mt-3 rounded-2xl border border-border bg-card p-3 text-sm leading-6 text-muted-foreground">
                      {log.message}
                    </p>
                  ) : null}
                </div>

                {isLast ? (
                  <div className="absolute bottom-0 left-2 h-4 w-px bg-card" />
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-5 text-center">
            <p className="text-sm font-semibold text-card-foreground">
              No refund events recorded yet
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Updates will appear here when the refund request moves forward.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
