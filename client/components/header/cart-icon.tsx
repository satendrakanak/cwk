"use client";

import { ShoppingCart } from "lucide-react";

import { useCartStore } from "@/store/cart-store";
import Link from "next/link";

export const CartIcon = () => {
  const cartItems = useCartStore((s) => s.cartItems);

  const count = cartItems.length;

  return (
    <div className="cursor-default max-w-xs hidden md:block">
      <div className="flex-col items-center justify-center hidden md:flex">
        <span className="relative inline-block">
          <Link href="/cart">
            <ShoppingCart className="w-6 h-6 text-webtertiary cursor-pointer" />
          </Link>
          {cartItems.length > 0 && (
            <span className="absolute top-0 right-0 -mt-3 -mr-3 bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {count}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};
