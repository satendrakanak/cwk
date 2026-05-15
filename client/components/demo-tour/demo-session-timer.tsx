"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, TimerReset } from "lucide-react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [now, setNow] = useState(() => Date.now());
  const [mounted, setMounted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const handledExpiry = useRef(false);
  const demoEntryUrl =
    process.env.NEXT_PUBLIC_DEMO_ENTRY_URL ||
    `/auth/sign-in?error=${encodeURIComponent("Demo access expired")}`;

  const expiresAt = useMemo(() => {
    if (!user?.isDemo || !user.demoExpiresAt) return null;

    const timestamp = new Date(user.demoExpiresAt).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }, [user]);

  const remaining = expiresAt ? expiresAt - now : 0;
  const isExpired = Boolean(expiresAt && remaining <= 0);

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    if (!expiresAt) return;

    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt || !isExpired || handledExpiry.current) return;

    handledExpiry.current = true;
    setIsMinimized(false);
    toast.error(EXPIRED_MESSAGE);

    const timeout = window.setTimeout(async () => {
      await demoTourClientService.cleanupExpired().catch(() => null);
      await authService.logout().catch(() => null);
      setUser(null);
      window.location.href = demoEntryUrl;
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [demoEntryUrl, expiresAt, isExpired, setUser]);

  if (!mounted || !expiresAt || pathname?.startsWith("/auth")) {
    return null;
  }

  if (isMinimized && !isExpired) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-5 right-5 z-[80] inline-flex h-12 cursor-pointer items-center gap-2 rounded-full border border-primary/25 bg-background/95 px-4 text-sm font-semibold text-card-foreground shadow-[0_14px_44px_color-mix(in_oklab,var(--primary)_16%,transparent)] backdrop-blur-md"
      >
        <Clock3 className="h-4 w-4 text-primary" />
        <span className="tabular-nums text-primary">
          {formatRemaining(remaining)}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80] w-[min(calc(100vw-2rem),18rem)] rounded-2xl border border-primary/20 bg-background/95 p-3 text-card-foreground shadow-[0_18px_56px_color-mix(in_oklab,var(--primary)_16%,transparent)] backdrop-blur-md">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          {isExpired ? (
            <TimerReset className="h-4 w-4" />
          ) : (
            <Clock3 className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {isExpired ? "Demo expired" : "Demo session active"}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {isExpired
              ? "Cleaning and restoring the demo workspace now."
              : "Temporary access closes automatically."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="shrink-0 cursor-pointer rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold tabular-nums text-primary"
          disabled={isExpired}
        >
          {isExpired ? "Expired" : formatRemaining(remaining)}
        </button>
      </div>
    </div>
  );
}
