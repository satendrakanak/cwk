"use client";

import Image from "next/image";
import Link from "next/link";
import { BarChart3, BookOpen, Clock3, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart-store";
import { CartItem } from "@/types/cart";

interface CartItemCardProps {
  showRemove?: boolean;
  item: CartItem;
}

export const CartItemCard = ({ item, showRemove }: CartItemCardProps) => {
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const autoDiscount = useCartStore((state) => state.autoDiscount);
  const manualDiscount = useCartStore((state) => state.manualDiscount);
  const total = useCartStore((state) => state.totalPrice());

  const discount = autoDiscount + manualDiscount;

  const itemDiscount =
    total > 0 ? Math.round((item.price / total) * discount) : 0;

  const finalPrice = Math.max(item.price - itemDiscount, 0);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-IN").format(value);

  const handleRemove = () => {
    removeFromCart(item.id);
    toast.success("Removed from cart");
  };

  return (
    <div className="academy-card group p-4 transition-all duration-300 hover:border-primary/25 hover:shadow-[0_24px_70px_color-mix(in_oklab,var(--primary)_12%,transparent)]">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href={`/course/${item.slug}`}
          className="relative h-44 w-full shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-32 sm:w-48"
        >
          <Image
            src={item.image || "/placeholder.jpg"}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, 192px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-linear-to-t from-foreground/45 via-transparent to-transparent opacity-70" />
        </Link>

        <div className="min-w-0 flex-1">
          <Link href={`/course/${item.slug}`}>
            <h3 className="line-clamp-2 text-lg font-semibold leading-7 text-card-foreground transition-colors hover:text-primary">
              {item.title}
            </h3>
          </Link>

          <p className="mt-1 text-sm text-muted-foreground">
            By{" "}
            <span className="font-semibold text-card-foreground">
              {item.instructor || "Unknown Instructor"}
            </span>
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <CartMetaPill icon={Clock3}>
              {item.totalDuration || "--"} duration
            </CartMetaPill>

            <CartMetaPill icon={BookOpen}>
              {item.totalLectures || "--"} lectures
            </CartMetaPill>

            <CartMetaPill icon={BarChart3}>All Levels</CartMetaPill>
          </div>

          {showRemove && (
            <button
              type="button"
              onClick={handleRemove}
              className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive hover:text-white active:scale-95"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-start justify-between gap-4 border-t border-border pt-4 sm:min-w-28 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary sm:hidden">
            Price
          </p>

          <div className="text-right">
            {discount > 0 ? (
              <>
                <p className="text-xl font-bold text-card-foreground">
                  ₹{formatPrice(finalPrice)}
                </p>

                <p className="mt-1 text-sm font-medium text-muted-foreground line-through">
                  ₹{formatPrice(item.price)}
                </p>

                {itemDiscount > 0 && (
                  <p className="mt-1 text-xs font-semibold text-primary">
                    Saved ₹{formatPrice(itemDiscount)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xl font-bold text-card-foreground">
                ₹{formatPrice(item.price)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function CartMetaPill({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {children}
    </span>
  );
}
