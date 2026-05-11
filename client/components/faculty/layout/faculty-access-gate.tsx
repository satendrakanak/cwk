"use client";

import { useSession } from "@/context/session-context";
import { canAccessFaculty } from "@/lib/access-control";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function FacultyAccessGate({
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
      const callbackUrl = encodeURIComponent(pathname || "/faculty/dashboard");
      router.replace(`/auth/sign-in?callbackUrl=${callbackUrl}`);
      return;
    }

    if (!canAccessFaculty(user)) {
      router.replace("/");
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading || !user || !canAccessFaculty(user)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-2xl border bg-card px-6 py-5 text-center shadow-sm">
          <div className="mx-auto mb-3 size-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading your faculty access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
