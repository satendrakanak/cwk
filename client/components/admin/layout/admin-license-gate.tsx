"use client";

import { usePathname } from "next/navigation";
import { LicenseLockedNotice } from "@/components/licenses/license-locked-notice";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getModuleLockReason,
  isLicenseRecoveryPath,
} from "@/lib/license/module-access";
import { useAdminLicense } from "./admin-license-provider";
import { useSession } from "@/context/session-context";
import { hasRole } from "@/lib/access-control";

export function AdminLicenseGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { summary, isLoading, error } = useAdminLicense();
  const { user } = useSession();
  const isDemoUser = Boolean(user?.isDemo) || hasRole(user, "demo_admin");

  if (isDemoUser || isLicenseRecoveryPath(pathname)) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return (
      <LicenseLockedNotice
        mode="error"
        title="License check unavailable"
        description="KASA could not check the current license status. Please try again or open License settings to activate a valid key."
        actionLabel="Open license settings"
        actionHref="/admin/settings/license"
      />
    );
  }

  const lockReason = getModuleLockReason(summary, pathname);

  if (lockReason) {
    return (
      <LicenseLockedNotice
        mode={lockReason.code === "feature_locked" ? "module" : "license"}
        title={lockReason.title}
        description={lockReason.description}
        actionLabel={lockReason.actionLabel}
        actionHref={lockReason.actionHref}
      />
    );
  }

  return <>{children}</>;
}
