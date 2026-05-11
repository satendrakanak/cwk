"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { CouponApplyBox } from "../coupon/coupon-apply-box";
import { SummaryRow } from "./summary-row";

export const CartSummary = () => {
  const {
    cartItems,
    autoDiscount,
    manualDiscount,
    finalAmount,
    autoCoupon,
    manualCoupon,
    applyManualCoupon,
    removeCoupon,
  } = useCartStore();

  const originalTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  const totalDiscount = autoDiscount + manualDiscount;
  const finalTotal = Math.max(
    totalDiscount > 0 ? finalAmount : originalTotal,
    0,
  );

  const gstRate = 0.18;
  const baseAmount = Math.round(finalTotal / (1 + gstRate));
  const gstAmount = finalTotal - baseAmount;

  const format = (value: number) =>
    new Intl.NumberFormat("en-IN").format(value);

  const isEmpty = cartItems.length === 0;

  return (
    <aside className="academy-card h-fit p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Order Summary
          </p>

          <h2 className="mt-2 text-xl font-semibold text-card-foreground">
            Cart Summary
          </h2>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Sparkles className="h-5 w-5" />
        </span>
      </div>

      <div className="space-y-3">
        {totalDiscount > 0 && (
          <SummaryRow
            label="Original Price"
            value={`₹${format(originalTotal)}`}
            muted
            strike
          />
        )}

        {autoDiscount > 0 && (
          <SummaryRow
            label={`Best offer applied 🎉${autoCoupon ? ` (${autoCoupon})` : ""}`}
            value={`-₹${format(autoDiscount)}`}
            accent="primary"
          />
        )}

        {manualDiscount > 0 && (
          <SummaryRow
            label={`Coupon${manualCoupon ? ` (${manualCoupon})` : ""}`}
            value={`-₹${format(manualDiscount)}`}
            accent="success"
          />
        )}

        {totalDiscount > 0 && (
          <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
            <SummaryRow
              label="You Saved"
              value={`-₹${format(totalDiscount)}`}
              accent="primary"
              strong
              noPadding
            />
          </div>
        )}

        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <SummaryRow
            label="Subtotal (excl. GST)"
            value={`₹${format(baseAmount)}`}
          />

          <SummaryRow label="GST (18%)" value={`₹${format(gstAmount)}`} />

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-base font-semibold text-card-foreground">
              Total
            </span>

            <span className="text-2xl font-bold text-card-foreground">
              ₹{format(finalTotal)}
            </span>
          </div>

          <p className="text-right text-xs text-muted-foreground">
            GST is included in the total amount.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-muted/50 p-4">
        <CouponApplyBox
          appliedCoupon={manualCoupon}
          onApply={applyManualCoupon}
          onRemove={removeCoupon}
        />
      </div>

      <Link href="/checkout" className="mt-5 block">
        <Button
          disabled={isEmpty}
          className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          Proceed to Checkout →
        </Button>
      </Link>

      <div className="mt-5 rounded-2xl border border-border bg-muted/50 p-4 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <p className="text-sm font-semibold text-card-foreground">
          Refunds Reviewed By Team
        </p>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Eligible refund requests are enabled by support and reviewed as per
          policy.
        </p>
      </div>
    </aside>
  );
};
