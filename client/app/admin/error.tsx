"use client";

import { useEffect } from "react";
import { LicenseLockedNotice } from "@/components/licenses/license-locked-notice";
import { Button } from "@/components/ui/button";

function isLicenseError(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("kasa license") ||
    normalized.includes("license is not configured") ||
    normalized.includes("license has expired") ||
    normalized.includes("license is invalid") ||
    normalized.includes("please upgrade")
  );
}

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  if (isLicenseError(error.message || "")) {
    return (
      <LicenseLockedNotice
        mode="license"
        title="Workspace locked"
        description={
          error.message ||
          "KASA needs an active license before this admin module can be used."
        }
        actionLabel="Open license settings"
        actionHref="/admin/settings/license"
      />
    );
  }

  return (
    <section className="rounded-3xl border border-destructive/20 bg-destructive/10 p-6 text-destructive">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 max-w-2xl text-sm opacity-80">
        {error.message || "This admin page could not be loaded."}
      </p>
      <Button onClick={reset} className="mt-5">
        Try again
      </Button>
    </section>
  );
}
