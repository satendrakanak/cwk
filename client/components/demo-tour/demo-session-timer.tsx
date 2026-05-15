"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, TimerReset } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { authService } from "@/services/auth.service";
import { demoTourClientService } from "@/services/demo-tours/demo-tour.client";

const EXPIRED_MESSAGE =
  "Your demo time has expired. We are cleaning your demo workspace.";

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(Math.ceil(milliseconds / 1000), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function DemoSessionTimer() {
  const { user, setUser } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [now, setNow] = useState(() => Date.now());
  const handledExpiry = useRef(false);

  const expiresAt = useMemo(() => {
    if (!user?.isDemo || !user.demoExpiresAt) return null;

    const timestamp = new Date(user.demoExpiresAt).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }, [user]);

  const remaining = expiresAt ? expiresAt - now : 0;
  const isExpired = Boolean(expiresAt && remaining <= 0);

  useEffect(() => {
    if (!expiresAt) return;

    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt || !isExpired || handledExpiry.current) return;

    handledExpiry.current = true;
    toast.error(EXPIRED_MESSAGE);

    const timeout = window.setTimeout(async () => {
      await demoTourClientService.cleanupExpired().catch(() => null);
      await authService.logout().catch(() => null);
      setUser(null);
      router.replace(`/demo-tour?expired=true`);
      router.refresh();
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [expiresAt, isExpired, router, setUser]);

  if (!expiresAt || pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80] w-[min(calc(100vw-2rem),22rem)] rounded-2xl border border-primary/20 bg-background/95 p-4 text-card-foreground shadow-[0_22px_70px_color-mix(in_oklab,var(--primary)_18%,transparent)] backdrop-blur-md">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isExpired ? (
            <TimerReset className="h-5 w-5" />
          ) : (
            <Clock3 className="h-5 w-5" />
          )}
        </span>

        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {isExpired ? "Demo expired" : "Demo session active"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {isExpired
              ? "Cleaning this demo workspace now."
              : "Explore KASA freely. This temporary access will close automatically."}
          </p>
        </div>

        <div className="ml-auto shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold tabular-nums text-primary">
          {isExpired ? "Expired" : formatRemaining(remaining)}
        </div>
      </div>
    </div>
  );
}
