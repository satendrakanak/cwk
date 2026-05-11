"use client";

import { useSyncExternalStore } from "react";
import { BookOpen, Home, ShoppingCart, User2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSession } from "@/context/session-context";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { NotificationNavIcon } from "@/components/notifications/notification-bell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserAvatarUrl } from "@/lib/user-avatar";

const MobileMenu = () => {
  const pathname = usePathname();
  const { user } = useSession();
  const cartItems = useCartStore((state) => state.cartItems);
  const mounted = useHydratedClient();
  const visibleUser = mounted ? user : null;
  const avatarUrl = visibleUser ? getUserAvatarUrl(visibleUser) : null;
  const initials = visibleUser
    ? `${visibleUser.firstName?.[0] ?? ""}${visibleUser.lastName?.[0] ?? ""}`.toUpperCase() ||
      "U"
    : "";

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/courses", label: "Courses", icon: BookOpen },
    {
      href: "/cart",
      label: "Cart",
      icon: ShoppingCart,
      count: mounted ? cartItems.length : 0,
    },
  ];
  const navItemClass =
    "relative flex touch-manipulation items-center justify-center text-muted-foreground transition active:scale-95 hover:text-primary";
  const isNotificationsActive = pathname?.startsWith("/notifications");
  const isUserActive =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/orders") ||
    pathname?.startsWith("/certificates") ||
    pathname?.startsWith("/my-courses") ||
    pathname?.startsWith("/exams") ||
    pathname?.startsWith("/auth");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_-24px_rgba(15,23,42,0.55)] md:hidden">
      <div className="grid h-13 grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={cn(
                navItemClass,
                isActive && "text-primary",
              )}
            >
              <span className="relative">
                <Icon className="size-5" />
                {item.count ? (
                  <span className="absolute -right-2.5 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-background">
                    {item.count}
                  </span>
                ) : null}
              </span>
              {isActive ? (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
              ) : null}
            </Link>
          );
        })}
        {mounted ? (
          <NotificationNavIcon
            active={isNotificationsActive}
            className={cn(
              navItemClass,
              isNotificationsActive && "text-primary",
            )}
          />
        ) : (
          <button
            type="button"
            aria-label="Open notifications"
            className={navItemClass}
          >
            <BellFallbackIcon />
          </button>
        )}
        <Link
          href={visibleUser ? "/dashboard" : "/auth/sign-in"}
          aria-label={visibleUser ? "Account" : "Sign in"}
          className={cn(navItemClass, isUserActive && "text-primary")}
        >
          {visibleUser ? (
            <Avatar className="size-6 border border-border">
              {avatarUrl ? (
                <AvatarImage
                  src={avatarUrl}
                  alt={visibleUser.firstName || visibleUser.email}
                />
              ) : null}
              <AvatarFallback className="text-[10px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User2 className="size-5" />
          )}
          {isUserActive ? (
            <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
          ) : null}
        </Link>
      </div>
    </nav>
  );
};

function BellFallbackIcon() {
  return (
    <span className="relative">
      <span className="block size-5 rounded-full border-2 border-current" />
      <span className="absolute left-1/2 top-4 h-1 w-2 -translate-x-1/2 rounded-full bg-current" />
    </span>
  );
}

function subscribeHydration(callback: () => void) {
  const timeout = window.setTimeout(callback, 0);

  return () => window.clearTimeout(timeout);
}

function useHydratedClient() {
  return useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
}

export default MobileMenu;
