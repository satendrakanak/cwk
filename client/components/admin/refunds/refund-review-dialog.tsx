"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { refundClientService } from "@/services/refunds/refund.client";
import {
  RefundDecision,
  RefundRequest,
  RefundRequestStatus,
} from "@/types/order";
import { RefundTimeline } from "@/components/refunds/refund-timeline";
import { RefundStatusBadge } from "@/components/refunds/refund-status-badge";
import { getErrorMessage } from "@/lib/error-handler";

const reviewSchema = z.object({
  approvedAmount: z.coerce.number().min(0).optional(),
  adminNote: z.string().max(2000).optional(),
});

type ReviewFormInput = z.input<typeof reviewSchema>;
type ReviewFormValues = z.output<typeof reviewSchema>;

export function RefundReviewDialog({
  refundRequest,
  open,
  onOpenChange,
}: {
  refundRequest: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const form = useForm<ReviewFormInput, unknown, ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      approvedAmount: refundRequest
        ? Number(refundRequest.approvedAmount || refundRequest.requestedAmount)
        : undefined,
      adminNote: refundRequest?.adminNote || "",
    },
  });

  useEffect(() => {
    form.reset({
      approvedAmount: refundRequest
        ? Number(refundRequest.approvedAmount || refundRequest.requestedAmount)
        : undefined,
      adminNote: refundRequest?.adminNote || "",
    });
  }, [form, refundRequest]);

  const handleReview = async (decision: RefundDecision) => {
    if (!refundRequest) return;

    const values = await form
      .trigger()
      .then((valid) => (valid ? reviewSchema.parse(form.getValues()) : null));

    if (!values) return;

    try {
      setIsSubmitting(true);
      await refundClientService.review(refundRequest.id, {
        decision,
        approvedAmount:
          decision === RefundDecision.APPROVE
            ? values.approvedAmount
            : undefined,
        adminNote: values.adminNote,
      });
      toast.success(
        decision === RefundDecision.APPROVE
          ? "Refund approval submitted. Check the timeline for gateway status."
          : "Refund request rejected.",
      );
      onOpenChange(false);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async () => {
    if (!refundRequest) return;

    try {
      setIsSyncing(true);
      await refundClientService.sync(refundRequest.id);
      toast.success("Refund status synced from gateway.");
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSyncing(false);
    }
  };

  if (!refundRequest) return null;

  const canReview = refundRequest.status === RefundRequestStatus.REQUESTED;
  const canSync =
    refundRequest.status === RefundRequestStatus.PROCESSING &&
    Boolean(refundRequest.gatewayRefundId);
  const order = refundRequest.order;
  const canApprove = canReview && Boolean(order);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,820px)] w-[min(960px,calc(100vw-2rem))] max-w-4xl! flex-col overflow-hidden p-0 dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] dark:text-slate-100">
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle className="text-slate-950 dark:text-white">
            Review refund request #{refundRequest.id}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-300">
            {order ? `Order #${order.id}` : "Order unavailable"} • Requested by{" "}
            {refundRequest.requester?.firstName}{" "}
            {refundRequest.requester?.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto px-6 py-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-5 dark:border-white/10 dark:bg-white/6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Current status
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                  Refund request
                </p>
              </div>
              <RefundStatusBadge status={refundRequest.status} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoBox
                label="Requested amount"
                value={`INR ${Number(refundRequest.requestedAmount || 0).toLocaleString("en-IN")}`}
              />
              <InfoBox
                label="Gateway status"
                value={refundRequest.gatewayStatus || "Not started"}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/8">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Reason
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {refundRequest.reason}
              </p>
              {refundRequest.customerNote ? (
                <>
                  <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                    Customer note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {refundRequest.customerNote}
                  </p>
                </>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/8">
              {!order ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Linked order is missing for this refund request. You can
                  reject it to close the orphan request, but approval cannot
                  continue.
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Approved amount
                  </label>
                  <Input
                    {...form.register("approvedAmount")}
                    placeholder="2500"
                    disabled={!canApprove || isSubmitting}
                    className="h-11 rounded-2xl"
                  />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/6">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Order total
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                    INR{" "}
                    {Number(order?.totalAmount || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Admin note
                </label>
                <Textarea
                  {...form.register("adminNote")}
                  rows={5}
                  disabled={!canReview || isSubmitting}
                  placeholder="Document the decision clearly for user and internal audit."
                  className="min-h-32 rounded-2xl px-4 py-3"
                />
              </div>
            </div>

            <RefundTimeline refundRequest={refundRequest} />
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-slate-100 px-6 py-4 dark:border-white/10">
          {canSync ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Syncing
                </>
              ) : (
                "Sync gateway status"
              )}
            </Button>
          ) : null}

          {canReview ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleReview(RefundDecision.REJECT)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Reject
              </Button>
              <Button
                type="button"
                onClick={() => handleReview(RefundDecision.APPROVE)}
                disabled={isSubmitting || !canApprove}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Approve & process"
                )}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}
