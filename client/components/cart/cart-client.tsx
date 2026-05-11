"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import Container from "../container";
import { CartItemCard } from "./cart-item-card";
import { CartSummary } from "./cart-summary";

export const CartClient = () => {
  const router = useRouter();

  const cartItems = useCartStore((state) => state.cartItems);
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const isEmpty = cartItems.length === 0;

  return (
    <div className="relative min-h-screen bg-background py-12 md:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />
      </div>

      <Container className="relative z-10">
        <div className="academy-card mb-8 p-5 md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Cart
          </p>

          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-card-foreground md:text-4xl">
                Shopping Cart
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Review your selected courses before moving to checkout.
              </p>
            </div>

            {!isEmpty && (
              <p className="rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                ₹{new Intl.NumberFormat("en-IN").format(total)}
              </p>
            )}
          </div>
        </div>

        {isEmpty ? (
          <div className="academy-card flex flex-col items-center justify-center border-dashed px-6 py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <ShoppingCart className="h-10 w-10" />
            </div>

            <h2 className="text-2xl font-semibold text-card-foreground">
              Your cart is empty
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              Looks like you haven’t added any courses yet. Start exploring and
              find something you love.
            </p>

            <Button
              type="button"
              onClick={() => router.push("/courses")}
              className="mt-7 h-12 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
            <div className="space-y-5 lg:col-span-2">
              <div className="academy-card p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">
                      Selected Courses
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {cartItems.length > 1
                        ? `${cartItems.length} courses`
                        : `${cartItems.length} course`}{" "}
                      in your cart
                    </p>
                  </div>

                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <ShoppingCart className="h-5 w-5" />
                  </span>
                </div>
              </div>

              {cartItems.map((item) => (
                <CartItemCard key={item.id} item={item} showRemove />
              ))}
            </div>

            <div className="lg:sticky lg:top-28">
              <CartSummary />
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};
