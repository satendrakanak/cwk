"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";
import { authService } from "@/services/auth.service";
import { licenseClientService } from "@/services/licenses/license.client";

const CHECK_INTERVAL_MS = 10_000;
const SKIPPED_PATHS = ["/auth", "/install", "/admin/settings/license"];
const LICENSE_NOTICE =
  "Your KASA license is no longer active. Please contact support or activate a valid key.";

export function LicenseSessionMonitor() {
  const { user } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isHandlingInvalidLicense = useRef(false);

  useEffect(() => {
    if (!user || SKIPPED_PATHS.some((path) => pathname?.startsWith(path))) {
      return;
    }

    const checkLicense = async () => {
      if (isHandlingInvalidLicense.current) return;

      try {
        const response = await licenseClientService.getCurrent();
        const license = response.data.license;

        if (license?.status === "active") {
          return;
        }

        isHandlingInvalidLicense.current = true;
        toast.error(LICENSE_NOTICE);
        await authService.logout().catch(() => null);
        router.replace(
          `/auth/sign-in?error=${encodeURIComponent(LICENSE_NOTICE)}`,
        );
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message.toLowerCase() : "";

        if (!message.includes("unauthorized")) {
          return;
        }

        isHandlingInvalidLicense.current = true;
        toast.error(LICENSE_NOTICE);
        await authService.logout().catch(() => null);
        router.replace(
          `/auth/sign-in?error=${encodeURIComponent(LICENSE_NOTICE)}`,
        );
        router.refresh();
      }
    };

    const initialTimer = window.setTimeout(checkLicense, 1500);
    const interval = window.setInterval(checkLicense, CHECK_INTERVAL_MS);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
    };
  }, [pathname, router, user]);

  return null;
}
