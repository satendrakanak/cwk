"use client";

import { useCartStore } from "@/store/cart-store";
import { orderClientService } from "@/services/orders/order.client";
import { settingsClientService } from "@/services/settings/settings.client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { z } from "zod";
import { checkoutSchema } from "@/schemas/checkout";
import {
  OpenRazorpayParams,
  RazorpayInstance,
  RazorpayOptions,
  RazorpaySuccessResponse,
} from "@/types/order";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise: Promise<void> | null = null;

function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Payment SDK can only load in browser"));
  }

  if (window.Razorpay) {
    return Promise.resolve();
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Payment SDK failed to load")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Payment SDK failed to load"));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export const usePayment = () => {
  const router = useRouter();

  const clearCart = useCartStore((s) => s.clearCart);

  // 🔥 ALWAYS fresh state (IMPORTANT)
  const getCartState = () => useCartStore.getState();

  // ===============================
  // 🔥 COMMON RAZORPAY HANDLER
  // ===============================
  const openRazorpay = async ({
    orderId,
    keyId,
    razorpayOrderId,
    amount,
    currency,
    data,
    courses,
  }: OpenRazorpayParams) => {
    await loadRazorpayScript();
    const Razorpay = window.Razorpay;

    if (!Razorpay) {
      toast.error("Payment SDK not loaded");
      return;
    }

    const rzp = new Razorpay({
      key: keyId,
      amount,
      currency,
      order_id: razorpayOrderId,
      name: "CodeWithKasa",
      description: "Course payment",

      handler: async (response: RazorpaySuccessResponse) => {
        try {
          await orderClientService.verifyPayment(response);

          toast.success("✅ Payment successful");

          clearCart();

          if (courses.length === 1) {
            router.push(`/course/${courses[0].slug}/learn`);
          } else {
            router.push("/my-courses");
          }
        } catch {
          toast("Payment received. Verifying...");
          router.push("/my-courses");
        }
      },

      modal: {
        ondismiss: async function () {
          try {
            await orderClientService.cancelPayment(orderId);
          } catch (error) {
            console.error("Cancel payment reporting failed", error);
          }
          toast.error("⚠️ Payment cancelled");
        },
      },

      prefill: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        contact: data.phoneNumber,
      },

      theme: {
        color: "#0f172a",
      },
    });

    rzp.open();

    rzp.on("payment.failed", function (response: unknown) {
      console.error("❌ Payment Failed:", response);
      const failureResponse = response as {
        error?: {
          description?: string;
          metadata?: {
            payment_id?: string;
            order_id?: string;
          };
        };
      };

      void orderClientService
        .reportPaymentFailure(orderId, {
          paymentId: failureResponse?.error?.metadata?.payment_id || null,
          gatewayOrderId:
            failureResponse?.error?.metadata?.order_id || razorpayOrderId,
        })
        .catch((error) => {
          console.error("Payment failure reporting failed", error);
        });

      toast.error(
        failureResponse?.error?.description ||
          "Payment failed. Please try again.",
      );
    });
  };

  // ===============================
  // 🥇 INITIATE PAYMENT
  // ===============================
  const initiatePayment = async (
    data: z.infer<typeof checkoutSchema>,
    provider: string,
  ) => {
    try {
      const {
        cartItems,
        finalAmount,
        autoDiscount,
        manualDiscount,
        autoCoupon,
        manualCoupon,
      } = getCartState();

      if (!cartItems.length) {
        toast.error("Cart is empty");
        return;
      }

      const originalPrice = cartItems.reduce((t, i) => t + i.price, 0);

      // 🔥 FINAL PAYABLE (after discount)
      const totalAmount =
        autoDiscount + manualDiscount > 0
          ? Math.max(finalAmount, 0)
          : originalPrice;

      // 🔥 REVERSE GST (consistent with your UI)
      const subTotal = Math.round(totalAmount / 1.18);
      const tax = totalAmount - subTotal;

      const payload = {
        items: cartItems.map((item) => ({
          courseId: item.id,
          quantity: 1,
        })),

        billingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          address: data.address,
          country: data.country,
          state: data.state,
          city: data.city,
          pincode: data.pincode,
        },

        // 🔥 PRICING
        discount: autoDiscount + manualDiscount, // coupon
        subTotal, // GST removed
        tax, // GST part
        totalAmount, // final payable
        manualCouponCode: manualCoupon || null,
        autoCouponCode: autoCoupon || null,

        paymentMethod: provider,
      };

      const res = await orderClientService.create(payload);

      const { razorpayOrderId, amount, currency, courses } = res.data;

      const configRes = await settingsClientService.getPaymentConfig();
      const { keyId } = configRes.data;

      await openRazorpay({
        orderId: res.data.orderId,
        keyId,
        razorpayOrderId,
        amount,
        currency,
        data,
        courses,
      });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  // ===============================
  // 🥈 RETRY PAYMENT
  // ===============================
  const retryPayment = async (
    orderId: number,
    data: z.infer<typeof checkoutSchema>,
  ) => {
    try {
      const res = await orderClientService.retry(orderId);

      const { razorpayOrderId, amount, currency, courses } = res.data;

      const configRes = await settingsClientService.getPaymentConfig();
      const { keyId } = configRes.data;

      await openRazorpay({
        orderId: res.data.orderId,
        keyId,
        razorpayOrderId,
        amount,
        currency,
        data,
        courses,
      });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return {
    initiatePayment,
    retryPayment,
  };
};
