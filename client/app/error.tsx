"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  Loader2,
  LockKeyhole,
  LogIn,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";

type RecoveryState = "idle" | "recovering" | "failed";

const isSessionError = (message: string) => {
  const normalized = message.toLowerCase();

  return (
    normalized === "auth_expired" ||
    normalized.includes("auth_expired") ||
    normalized.includes("unauthorized") ||
    normalized.includes("jwt") ||
    normalized.includes("token expired")
  );
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
  const hasTriedAutoRecover = useRef(false);
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("idle");
  const isAuthExpired = useMemo(
    () => isSessionError(error.message || ""),
    [error.message],
  );

  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  const recoverSession = useCallback(async () => {
    if (!isAuthExpired || recoveryState === "recovering") return;

    try {
      setRecoveryState("recovering");
      await authService.refreshToken();
      router.refresh();
      reset();
    } catch (refreshError) {
      console.error("Session recovery failed:", refreshError);
      setRecoveryState("failed");
    }
  }, [isAuthExpired, recoveryState, reset, router]);

  useEffect(() => {
    if (isAuthExpired && !hasTriedAutoRecover.current) {
      hasTriedAutoRecover.current = true;
      void recoverSession();
    }
  }, [isAuthExpired, recoverSession]);

  if (!isAuthExpired) {
    return (
      <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_42%,#eef4ff_100%)] px-4 py-10 text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(86,114,255,0.16),transparent_24%),linear-gradient(180deg,rgba(9,16,31,0.98),rgba(15,24,43,1))] dark:text-white">
        <section className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-center shadow-xl dark:border-white/10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {error.message || "Unexpected error occurred. Please try again."}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button onClick={() => reset()} className="w-full gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const isRecovering = recoveryState === "recovering";
  const hasFailed = recoveryState === "failed";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08111f] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(84,199,139,0.20),transparent_28%),radial-gradient(circle_at_15%_75%,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#0b1324_0%,#08111f_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />

      <section className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
        <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative grid gap-8 md:grid-cols-[1fr_0.8fr] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure session
            </div>

            <h1 className="mt-5 text-3xl font-semibold tracking-tight md:text-5xl">
              Your learning space is locked for a moment.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
              We are refreshing your secure session in the background. If your
              refresh session is still valid, you will continue without entering
              the password again.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                onClick={recoverSession}
                disabled={isRecovering}
                className="h-11 w-full gap-2 bg-emerald-400 font-semibold text-emerald-950 hover:bg-emerald-300"
              >
                {isRecovering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                {isRecovering ? "Resuming..." : "Resume session"}
              </Button>

              <Button
                variant="outline"
                asChild
                className="h-11 w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href={hasFailed ? "/auth/sign-in" : "/"}>
                  {hasFailed ? (
                    <>
                      <LogIn className="h-4 w-4" />
                      Sign in again
                    </>
                  ) : (
                    <>
                      Go home
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              {hasFailed
                ? "Your saved session could not be refreshed. Please sign in again to continue."
                : "No page refresh needed. Keep this tab open while we reconnect."}
            </p>
          </div>

          <div className="relative mx-auto flex h-64 w-full max-w-xs items-center justify-center">
            <div className="absolute h-56 w-56 animate-pulse rounded-full border border-emerald-300/15" />
            <div className="absolute h-40 w-40 rounded-full border border-dashed border-emerald-300/25" />
            <div className="absolute left-2 top-8 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs text-slate-200 shadow-lg">
              <BookOpenCheck className="mb-1 h-4 w-4 text-emerald-300" />
              Course saved
            </div>
            <div className="absolute bottom-7 right-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs text-slate-200 shadow-lg">
              <GraduationCap className="mb-1 h-4 w-4 text-emerald-300" />
              Progress safe
            </div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200 shadow-2xl shadow-emerald-950/40">
              {isRecovering ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : (
                <LockKeyhole className="h-10 w-10" />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
