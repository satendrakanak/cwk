"use client";

import { useSession } from "@/context/session-context";
import { canAccessAdmin } from "@/lib/access-control";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminAccessGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      const callbackUrl = encodeURIComponent(pathname || "/admin/dashboard");
      router.replace(`/auth/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }

    if (!canAccessAdmin(user)) {
      router.replace("/");
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading || !user || !canAccessAdmin(user)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-3xl border border-[var(--brand-100)] bg-white px-6 py-5 text-center shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]">
          <div className="mx-auto mb-3 size-10 animate-spin rounded-full border-2 border-[var(--brand-200)] border-t-[var(--brand-600)]" />
          <p className="text-sm font-medium text-slate-700">
            Loading your admin access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
