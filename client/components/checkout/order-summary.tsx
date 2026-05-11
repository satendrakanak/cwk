"use client";

import { useEffect } from "react";
import { CreditCard, Loader2, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Gateway } from "@/types/settings";
import { SummaryRow } from "./summary-row";
import { Order } from "@/types/order";

interface OrderSummaryProps {
  isSubmitting: boolean;
  isValid: boolean;
  gateways: Gateway[];
  selectedGateway: Gateway | null;
  onSelectGateway: (gateway: Gateway) => void;
  isRetryFlow?: boolean;
  retryOrder?: Order | null;
}

export const OrderSummary = ({
  isSubmitting,
  isValid,
  gateways,
  isRetryFlow = false,
  onSelectGateway,
  retryOrder,
  selectedGateway,
}: OrderSummaryProps) => {
  const { cartItems, autoDiscount, manualDiscount, finalAmount, manualCoupon } =
    useCartStore();

  const retryTotalAmount = retryOrder ? Number(retryOrder.totalAmount) : 0;
  const originalPrice = isRetryFlow
    ? retryTotalAmount
    : cartItems.reduce((acc, item) => acc + item.price, 0);

  const totalDiscount = isRetryFlow ? 0 : autoDiscount + manualDiscount;
  const finalPrice = isRetryFlow
    ? retryTotalAmount
    : Math.max(totalDiscount > 0 ? finalAmount : originalPrice, 0);

  const gstRate = 0.18;
  const basePrice = Math.round(finalPrice / (1 + gstRate));
  const gstAmount = finalPrice - basePrice;

  const format = (num: number) => new Intl.NumberFormat("en-IN").format(num);

  const isPaymentGatewayAvailable = gateways.length > 0;
  const hasMultipleGateways = gateways.length > 1;

  useEffect(() => {
    if (gateways.length === 1 && !selectedGateway) {
      onSelectGateway(gateways[0]);
    }
  }, [gateways, onSelectGateway, selectedGateway]);

  const isDisabled =
    isSubmitting ||
    !isValid ||
    !isPaymentGatewayAvailable ||
    (isRetryFlow && !retryOrder) ||
    (!isRetryFlow && cartItems.length === 0) ||
    (hasMultipleGateways && !selectedGateway);

  return (
    <aside className="academy-card h-fit w-full p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Payment
          </p>

          <h2 className="mt-2 text-xl font-semibold text-card-foreground">
            Order Summary
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
            value={`₹${format(originalPrice)}`}
            muted
            strike
          />
        )}

        {autoDiscount > 0 && (
          <SummaryRow
            label="Best offer applied"
            value={`-₹${format(autoDiscount)}`}
            accent
          />
        )}

        {manualDiscount > 0 && (
          <SummaryRow
            label={`Coupon${manualCoupon ? ` (${manualCoupon})` : ""}`}
            value={`-₹${format(manualDiscount)}`}
            accent
          />
        )}

        {totalDiscount > 0 && (
          <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
            <SummaryRow
              label="You Saved"
              value={`-₹${format(totalDiscount)}`}
              accent
              strong
              noTextSize
            />
          </div>
        )}

        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <SummaryRow
            label="Subtotal (excl. GST)"
            value={`₹${format(basePrice)}`}
          />

          <SummaryRow label="GST (18%)" value={`₹${format(gstAmount)}`} />

          <div className="flex items-center justify-between border-t border-border pt-4">
            <span className="text-base font-semibold text-card-foreground">
              Total Amount
            </span>

            <span className="text-2xl font-bold text-card-foreground">
              ₹{format(finalPrice)}
            </span>
          </div>

          <p className="text-right text-xs text-muted-foreground">
            GST is included in your total.
          </p>
        </div>
      </div>

      {!isPaymentGatewayAvailable && (
        <div className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          No payment gateway configured.
        </div>
      )}

      {isPaymentGatewayAvailable && !hasMultipleGateways && selectedGateway && (
        <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Payment Method
          </p>

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-primary ring-1 ring-primary/15">
              <CreditCard className="h-5 w-5" />
            </span>

            <div>
              <p className="text-sm font-semibold text-card-foreground">
                {selectedGateway.displayName}
              </p>

              <p className="text-xs text-muted-foreground">
                Secure online payment
              </p>
            </div>
          </div>
        </div>
      )}

      {hasMultipleGateways && (
        <div className="mt-5 rounded-2xl border border-border bg-muted/50 p-4">
          <p className="mb-3 text-sm font-semibold text-card-foreground">
            Choose Payment Method
          </p>

          <div className="space-y-2">
            {gateways.map((gateway) => {
              const isActive = selectedGateway?.provider === gateway.provider;

              return (
                <label
                  key={gateway.provider}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors",
                    isActive
                      ? "border-primary bg-primary/10 shadow-[0_12px_30px_color-mix(in_oklab,var(--primary)_14%,transparent)]"
                      : "border-border bg-card hover:border-primary/25 hover:bg-primary/5",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <CreditCard className="h-5 w-5" />
                    </span>

                    <span
                      className={cn(
                        "truncate text-sm font-semibold",
                        isActive ? "text-primary" : "text-card-foreground",
                      )}
                    >
                      {gateway.displayName}
                    </span>
                  </div>

                  <input
                    type="radio"
                    name="gateway"
                    checked={isActive}
                    onChange={() => onSelectGateway(gateway)}
                    className="h-4 w-4 accent-primary"
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isDisabled}
        className="mt-5 h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          "Proceed to Payment"
        )}
      </Button>

      {isRetryFlow ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Retrying your existing order
        </p>
      ) : cartItems.length === 0 ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Your cart is empty
        </p>
      ) : (
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
      )}
    </aside>
  );
};
