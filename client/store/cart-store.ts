import { CartItem } from "@/types/cart";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { couponClientService } from "@/services/coupons/coupon.client";

let latestPricingRun = 0;

type CartState = {
  cartItems: CartItem[];
  hasHydrated: boolean;

  autoCoupon: string | null;
  manualCoupon: string | null;

  autoDiscount: number;
  manualDiscount: number;

  finalAmount: number;

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  replaceCartItems: (items: CartItem[]) => void;
  setHasHydrated: (value: boolean) => void;

  isInCart: (id: number) => boolean;
  totalPrice: () => number;

  applyAutoCoupon: () => Promise<void>;
  applyManualCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;

  recalculateTotal: () => void;
  refreshPricing: () => Promise<void>;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      hasHydrated: false,

      autoCoupon: null,
      manualCoupon: null,

      autoDiscount: 0,
      manualDiscount: 0,

      finalAmount: 0,

      setHasHydrated: (value) =>
        set({
          hasHydrated: value,
        }),

      // =========================
      // 🛒 CART
      // =========================

      addToCart: (item) => {
        const exists = get().cartItems.some((i) => i.id === item.id);
        if (exists) return;

        set({
          cartItems: [...get().cartItems, item],
        });

        void get().refreshPricing();
      },

      removeFromCart: (id) => {
        set({
          cartItems: get().cartItems.filter((i) => i.id !== id),
        });

        void get().refreshPricing();
      },

      clearCart: () =>
        set({
          cartItems: [],
          autoCoupon: null,
          manualCoupon: null,
          autoDiscount: 0,
          manualDiscount: 0,
          finalAmount: 0,
        }),

      replaceCartItems: (items) => {
        set({
          cartItems: items,
        });

        void get().refreshPricing();
      },

      isInCart: (id) => {
        return get().cartItems.some((i) => i.id === id);
      },

      totalPrice: () => {
        return get().cartItems.reduce((t, i) => t + i.price, 0);
      },

      // =========================
      // 🎯 AUTO APPLY
      // =========================

      applyAutoCoupon: async () => {
        await get().refreshPricing();
      },

      // =========================
      // 🎯 MANUAL APPLY
      // =========================

      applyManualCoupon: async (code: string) => {
        const normalizedCode = code.trim().toUpperCase();
        const { cartItems, autoDiscount } = get();

        if (!cartItems.length) return;

        const cartTotal = cartItems.reduce((t, i) => t + i.price, 0);
        const courseIds = cartItems.map((i) => i.id);
        const base = Math.max(cartTotal - autoDiscount, 0);

        const res = await couponClientService.applyCoupon({
          code: normalizedCode,
          cartTotal: base,
          courseIds,
        });

        const data = res.data;

        if (!data) {
          throw new Error("Invalid coupon");
        }

        set({
          manualCoupon: data.code,
          manualDiscount: data.discount,
        });

        get().recalculateTotal();
      },

      // =========================
      // ❌ REMOVE COUPON
      // =========================

      removeCoupon: async () => {
        set({
          manualCoupon: null,
          manualDiscount: 0,
        });

        await get().refreshPricing();
      },

      // =========================
      // 🧮 FINAL CALCULATION
      // =========================

      recalculateTotal: () => {
        const { cartItems, autoDiscount, manualDiscount } = get();

        const original = cartItems.reduce((t, i) => t + i.price, 0);

        const totalDiscount = autoDiscount + manualDiscount;

        const finalAmount = Math.max(original - totalDiscount, 0);

        set({
          finalAmount,
        });
      },

      refreshPricing: async () => {
        const currentRun = ++latestPricingRun;
        const { cartItems, manualCoupon } = get();

        if (!cartItems.length) {
          if (currentRun === latestPricingRun) {
            set({
              autoCoupon: null,
              manualCoupon: null,
              autoDiscount: 0,
              manualDiscount: 0,
              finalAmount: 0,
            });
          }
          return;
        }

        const cartTotal = cartItems.reduce((t, i) => t + i.price, 0);
        const courseIds = cartItems.map((i) => i.id);

        let autoCoupon: string | null = null;
        let autoDiscount = 0;

        try {
          const res = await couponClientService.autoApplyCoupon({
            cartTotal,
            courseIds,
          });

          const data = res.data;
          if (data) {
            autoCoupon = data.code;
            autoDiscount = data.discount;
          }
        } catch (e) {
          console.log("Auto coupon failed", e);
        }

        let normalizedManualCoupon = manualCoupon?.trim().toUpperCase() || null;
        let manualDiscount = 0;

        if (normalizedManualCoupon) {
          try {
            const res = await couponClientService.applyCoupon({
              code: normalizedManualCoupon,
              cartTotal: Math.max(cartTotal - autoDiscount, 0),
              courseIds,
            });

            const data = res.data;

            if (data) {
              normalizedManualCoupon = data.code;
              manualDiscount = data.discount;
            } else {
              normalizedManualCoupon = null;
            }
          } catch (e) {
            console.log("Manual coupon refresh failed", e);
            normalizedManualCoupon = null;
            manualDiscount = 0;
          }
        }

        if (currentRun !== latestPricingRun) {
          return;
        }

        set({
          autoCoupon,
          autoDiscount,
          manualCoupon: normalizedManualCoupon,
          manualDiscount,
        });

        get().recalculateTotal();
      },
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        void state?.refreshPricing();
      },
    },
  ),
);
