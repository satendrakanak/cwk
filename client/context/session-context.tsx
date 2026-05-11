"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { User } from "@/types/user";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { cartClientService } from "@/services/cart/cart.client";
import { useCartStore } from "@/store/cart-store";
import { CartItem } from "@/types/cart";

type SessionContextType = {
  user: User | null;
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: React.ReactNode;
  session: User | null;
  hasSession: boolean;
}

// ✅ Provider
export const SessionProvider = ({
  children,
  session,
  hasSession,
}: SessionProviderProps) => {
  const router = useRouter();
  const hasTriedRefresh = useRef(false);
  const bootstrappedCartUserId = useRef<number | null>(null);
  const lastCartSignature = useRef("");
  const isSyncingCart = useRef(false);
  const [user, setUser] = useState<User | null>(session);
  const [isLoading, setIsLoading] = useState(!session && hasSession);
  const hasHydratedCart = useCartStore((state) => state.hasHydrated);
  const replaceCartItems = useCartStore((state) => state.replaceCartItems);
  const cartItems = useCartStore((state) => state.cartItems);

  const mergeCartMetadata = (
    incomingItems: CartItem[],
    localItems: CartItem[],
  ) => {
    const localMap = new Map(localItems.map((item) => [item.id, item]));

    return incomingItems.map((item) => {
      const localItem = localMap.get(item.id);
      return {
        ...item,
        instructor: item.instructor || localItem?.instructor || null,
        totalDuration: item.totalDuration || localItem?.totalDuration || null,
        totalLectures: item.totalLectures || localItem?.totalLectures || 0,
      };
    });
  };

  const getSignature = (items: { id: number }[]) =>
    items
      .map((item) => item.id)
      .sort((a, b) => a - b)
      .join(",");

  useEffect(() => {
    setUser(session);
  }, [session]);
  useEffect(() => {
    const tryRefresh = async () => {
      // 👇 only if session null, hasSession AND not already tried
      if (hasSession && !session && !hasTriedRefresh.current) {
        hasTriedRefresh.current = true;
        try {
          setIsLoading(true);
          await authService.refreshToken();
          router.refresh();
        } catch {
          console.log("❌ Refresh failed");
          setUser(null);
          router.refresh();
        } finally {
          setIsLoading(false);
        }
      }
    };

    tryRefresh();
  }, [hasSession, router, session, user]);

  useEffect(() => {
    if (!user) {
      bootstrappedCartUserId.current = null;
      lastCartSignature.current = "";
      isSyncingCart.current = false;
      return;
    }

    if (!hasHydratedCart || bootstrappedCartUserId.current === user.id) {
      return;
    }

    const bootstrapCart = async () => {
      try {
        isSyncingCart.current = true;

        const localItems = useCartStore.getState().cartItems;
        const localIds = localItems.map((item) => item.id);

        const serverResponse = await cartClientService.getMine();
        const serverItems = serverResponse.data?.items || [];

        const mergedIds = [
          ...new Set([...serverItems.map((item) => item.id), ...localIds]),
        ];
        const mergedLocalItems = localItems.filter((item) =>
          mergedIds.includes(item.id),
        );

        const syncResponse = await cartClientService.sync(
          mergedIds.map((courseId) => {
            const localItem = mergedLocalItems.find(
              (item) => item.id === courseId,
            );
            return {
              courseId,
              instructor: localItem?.instructor || null,
              totalDuration: localItem?.totalDuration || null,
              totalLectures: localItem?.totalLectures || 0,
            };
          }),
        );

        const syncedItems = mergeCartMetadata(
          syncResponse.data?.items || [],
          localItems,
        );
        replaceCartItems(syncedItems);
        lastCartSignature.current = getSignature(syncedItems);
        bootstrappedCartUserId.current = user.id;
      } catch (error) {
        console.error("Cart bootstrap sync failed", error);
      } finally {
        isSyncingCart.current = false;
      }
    };

    void bootstrapCart();
  }, [user, hasHydratedCart, replaceCartItems]);

  useEffect(() => {
    if (!user || !hasHydratedCart) {
      return;
    }

    if (bootstrappedCartUserId.current !== user.id || isSyncingCart.current) {
      return;
    }

    const signature = getSignature(cartItems);
    if (signature === lastCartSignature.current) {
      return;
    }

    const syncCart = async () => {
      try {
        isSyncingCart.current = true;
        const response = await cartClientService.sync(
          cartItems.map((item) => ({
            courseId: item.id,
            instructor: item.instructor || null,
            totalDuration: item.totalDuration || null,
            totalLectures: item.totalLectures || 0,
          })),
        );
        const syncedItems = mergeCartMetadata(
          response.data?.items || [],
          cartItems,
        );
        lastCartSignature.current = getSignature(syncedItems);
        replaceCartItems(syncedItems);
      } catch (error) {
        console.error("Cart sync failed", error);
      } finally {
        isSyncingCart.current = false;
      }
    };

    void syncCart();
  }, [cartItems, hasHydratedCart, replaceCartItems, user]);

  return (
    <SessionContext.Provider value={{ user, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

// ✅ Hook
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
};
