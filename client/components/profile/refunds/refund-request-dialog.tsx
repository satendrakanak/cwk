"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { refundClientService } from "@/services/refunds/refund.client";

const refundRequestSchema = z.object({
  reason: z.string().min(10, "Please share a meaningful refund reason."),
  customerNote: z.string().max(2000).optional(),
});

type RefundRequestFormValues = z.infer<typeof refundRequestSchema>;

export function RefundRequestDialog({
  open,
  onOpenChange,
  orderId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RefundRequestFormValues>({
    resolver: zodResolver(refundRequestSchema),
    defaultValues: {
      reason: "",
      customerNote: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSubmitting(true);

      await refundClientService.createRequest(orderId, values);

      toast.success("Refund request submitted successfully.");
      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch {
      toast.error("Unable to submit refund request right now.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  };

  const textareaClass =
    "resize-none rounded-2xl border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground shadow-none transition focus-visible:border-primary focus-visible:ring-primary";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden rounded-3xl border border-border bg-card p-0 text-card-foreground shadow-[0_35px_120px_color-mix(in_oklab,var(--foreground)_18%,transparent)] sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <div className="p-5 md:p-6">
            <DialogHeader>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                <RotateCcw className="h-7 w-7" />
              </div>

              <DialogTitle className="text-xl font-semibold text-card-foreground">
                Request a refund
              </DialogTitle>

              <DialogDescription className="pt-2 text-sm leading-6 text-muted-foreground">
                Share the reason clearly. The management team will review the
                request and update your order trail with every action taken.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-card-foreground">
                  Refund reason
                </label>

                <Textarea
                  {...form.register("reason")}
                  rows={5}
                  placeholder="Tell us why you want the refund and what happened."
                  className={`min-h-32 ${textareaClass}`}
                />

                {form.formState.errors.reason ? (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.reason.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-card-foreground">
                  Additional note
                </label>

                <Textarea
                  {...form.register("customerNote")}
                  rows={4}
                  placeholder="Optional context for the admin team."
                  className={`min-h-24 ${textareaClass}`}
                />

                {form.formState.errors.customerNote ? (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.customerNote.message}
                  </p>
                ) : null}
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                Refund requests are reviewed by the team. You will be able to
                track every update in the refund timeline.
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/50 p-5 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="h-11 rounded-full border-border bg-background px-5 font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                "Submit refund request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
