"use client";

import { useState } from "react";
import { ArrowRight, Ticket, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/error-handler";

interface CouponApplyBoxProps {
  appliedCoupon?: string | null;
  onApply: (code: string) => Promise<void>;
  onRemove?: () => Promise<void>;
}

export const CouponApplyBox = ({
  appliedCoupon,
  onApply,
  onRemove,
}: CouponApplyBoxProps) => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    try {
      setLoading(true);
      await onApply(code.trim().toUpperCase());
      setCode("");
      toast.success("Coupon applied successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      await onRemove?.();
      toast.success("Coupon removed");
    } catch {
      toast.error("Failed to remove coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-card-foreground">
        Apply Coupon
      </h3>

      {appliedCoupon ? (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/5 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <Ticket className="h-4 w-4 shrink-0 text-primary" />

            <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
              {appliedCoupon}
            </Badge>

            <span className="truncate text-xs font-medium text-muted-foreground">
              Applied successfully
            </span>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            aria-label="Remove coupon"
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-destructive hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder="Enter coupon code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleApply();
              }
            }}
            className="h-11 rounded-full border-border bg-background pr-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
          />

          <button
            type="button"
            onClick={handleApply}
            disabled={loading || !code.trim()}
            aria-label="Apply coupon"
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
