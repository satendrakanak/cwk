"use client";

import { AlertTriangle, ArrowUpRight, KeyRound, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LICENSE_PRICING_URL } from "@/lib/license/module-access";

type LicenseLockedNoticeProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  mode?: "license" | "module" | "error";
};

export function LicenseLockedNotice({
  title,
  description,
  actionLabel = "Upgrade plan",
  actionHref = LICENSE_PRICING_URL,
  mode = "module",
}: LicenseLockedNoticeProps) {
  const Icon = mode === "error" ? AlertTriangle : mode === "license" ? KeyRound : LockKeyhole;
  const isExternal = actionHref.startsWith("http");

  return (
    <section className="rounded-3xl border border-amber-300/30 bg-amber-50 p-6 text-amber-950 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-200">
            <Icon className="size-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700/80 dark:text-amber-200/80">
              KASA access gate
            </p>
            <h2 className="mt-2 text-xl font-semibold">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 opacity-80">
              {description}
            </p>
          </div>
        </div>

        <Button asChild className="w-full sm:w-auto">
          <Link
            href={actionHref}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
          >
            {actionLabel}
            {isExternal && <ArrowUpRight className="size-4" />}
          </Link>
        </Button>
      </div>
    </section>
  );
}
