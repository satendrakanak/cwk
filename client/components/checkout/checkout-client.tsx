"use client";

import * as z from "zod";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingCart, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { useCartStore } from "@/store/cart-store";
import { CheckoutForm } from "./checkout-form";
import { CheckoutItems } from "./checkout-items";
import { OrderSummary } from "./order-summary";
import { useCheckoutForm } from "@/hooks/use-checkout-form";
import { useSession } from "@/context/session-context";
import { checkoutSchema } from "@/schemas/checkout";
import { getErrorMessage } from "@/lib/error-handler";
import { toast } from "sonner";
import { Gateway } from "@/types/settings";
import { usePayment } from "@/hooks/use-payment";
import { authService } from "@/services/auth.service";
import { GuestCheckoutVerificationDialog } from "./guest-checkout-verification-dialog";
import { orderClientService } from "@/services/orders/order.client";
import Container from "../container";
import { Order } from "@/types/order";

interface CheckoutClientProps {
  gateways: Gateway[];
}

const CheckoutClient = ({ gateways }: CheckoutClientProps) => {
  const [selectedGateway, setSelectedGateway] = useState<Gateway | null>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [maskedVerificationEmail, setMaskedVerificationEmail] = useState("");
  const [pendingGuestData, setPendingGuestData] = useState<z.infer<
    typeof checkoutSchema
  > | null>(null);
  const [isGuestVerifying, setIsGuestVerifying] = useState(false);
  const [retryOrder, setRetryOrder] = useState<Order | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const retryOrderId = Number(searchParams.get("retryOrderId") || 0);
  const isRetryFlow = Number.isFinite(retryOrderId) && retryOrderId > 0;

  const { initiatePayment, retryPayment } = usePayment();
  const { cartItems } = useCartStore();

  const { user, isLoading } = useSession();

  const checkoutForm = useCheckoutForm(user);
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = checkoutForm;

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    orderClientService
      .getMyOrders()
      .then((response) => {
        if (!isMounted) return;

        const orders = response.data || [];

        const matchedOrder = isRetryFlow
          ? orders.find((order) => order.id === retryOrderId)
          : orders[0];

        setRetryOrder(isRetryFlow ? matchedOrder || null : null);

        if (!matchedOrder?.billingAddress) return;

        const address = matchedOrder.billingAddress;

        reset({
          firstName: address.firstName || user.firstName || "",
          lastName: address.lastName || user.lastName || "",
          email: address.email || user.email || "",
          phoneNumber: address.phoneNumber || user.phoneNumber || "",
          address: address.address || "",
          country: address.country || "India",
          state: address.state || "",
          city: address.city || "",
          pincode: address.pincode || "",
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isRetryFlow, reset, retryOrderId, user]);

  const handlePaymentSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    if (!selectedGateway) {
      toast.error("Please select a payment method");
      return;
    }

    if (!isRetryFlow && !cartItems.length) {
      toast.error("Cart is empty");
      return;
    }

    try {
      if (!user) {
        const response = await authService.startCheckoutVerification({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
        });

        setPendingGuestData(data);
        setVerificationEmail(data.email);
        setMaskedVerificationEmail(response.data?.maskedEmail || data.email);
        setVerificationOpen(true);

        toast.success("Verification code sent to your email");
        return;
      }

      if (isRetryFlow) {
        await retryPayment(retryOrderId, data);
        return;
      }

      await initiatePayment(data, selectedGateway.provider);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleGuestOtpVerify = async (code: string) => {
    if (!pendingGuestData || !selectedGateway) return;

    try {
      setIsGuestVerifying(true);

      await authService.verifyCheckoutOtp({
        email: verificationEmail,
        code,
      });

      toast.success("Email verified. Continuing to payment.");

      setVerificationOpen(false);
      router.refresh();

      if (isRetryFlow) {
        await retryPayment(retryOrderId, pendingGuestData);
        return;
      }

      await initiatePayment(pendingGuestData, selectedGateway.provider);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsGuestVerifying(false);
    }
  };

  const handleGuestOtpResend = async () => {
    if (!pendingGuestData) return;

    try {
      const response = await authService.startCheckoutVerification({
        firstName: pendingGuestData.firstName,
        lastName: pendingGuestData.lastName,
        email: pendingGuestData.email,
        phoneNumber: pendingGuestData.phoneNumber,
      });

      setMaskedVerificationEmail(
        response.data?.maskedEmail || pendingGuestData.email,
      );

      toast.success("A fresh verification code has been sent");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-(--surface-shell)" />
        </div>

        <Container className="relative z-10">
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="academy-card p-8 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />

              <p className="text-sm font-semibold text-card-foreground">
                Loading checkout...
              </p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!isRetryFlow && (!cartItems || cartItems.length === 0)) {
    return (
      <div className="relative min-h-screen bg-background py-12 md:py-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-(--surface-shell)" />
        </div>

        <Container className="relative z-10">
          <div className="academy-card flex flex-col items-center justify-center border-dashed px-6 py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <ShoppingCart className="h-10 w-10" />
            </div>

            <h2 className="text-2xl font-semibold text-card-foreground">
              Your cart is empty
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              Add courses to your cart before continuing to checkout.
            </p>

            <Link
              href="/courses"
              className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <FormProvider {...checkoutForm}>
      <div className="relative min-h-screen bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-(--surface-shell)" />
        </div>

        <form
          onSubmit={handleSubmit(handlePaymentSubmit)}
          className="relative z-10"
        >
          <Container>
            <div className="py-10 md:py-12">
              <div className="academy-card mb-8 p-5 md:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                  Secure Checkout
                </p>

                <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-card-foreground md:text-4xl">
                      Checkout
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Complete your billing details and choose a payment method
                      to place your order.
                    </p>
                  </div>

                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    Secure payment
                  </div>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
                <div className="min-w-0 space-y-6">
                  {!user ? (
                    <p className="rounded-3xl border border-primary/15 bg-primary/5 px-5 py-4 text-sm leading-6 text-primary">
                      Complete your billing details first. We will create your
                      account and verify your email with an OTP before payment.
                    </p>
                  ) : null}

                  {isRetryFlow ? (
                    <p className="rounded-3xl border border-border bg-muted/50 px-5 py-4 text-sm leading-6 text-muted-foreground">
                      You are retrying a previous payment. We will continue with
                      your existing order instead of creating a new one.
                    </p>
                  ) : null}

                  <CheckoutForm />

                  <CheckoutItems retryOrder={retryOrder} />
                </div>

                <aside className="lg:sticky lg:top-28">
                  <OrderSummary
                    isSubmitting={isSubmitting}
                    isValid={isValid}
                    gateways={gateways}
                    selectedGateway={selectedGateway}
                    onSelectGateway={setSelectedGateway}
                    isRetryFlow={isRetryFlow}
                    retryOrder={retryOrder}
                  />
                </aside>
              </div>
            </div>
          </Container>
        </form>

        <GuestCheckoutVerificationDialog
          open={verificationOpen}
          onOpenChange={setVerificationOpen}
          maskedEmail={maskedVerificationEmail}
          isSubmitting={isGuestVerifying}
          onVerify={handleGuestOtpVerify}
          onResend={handleGuestOtpResend}
        />
      </div>
    </FormProvider>
  );
};

export default CheckoutClient;
