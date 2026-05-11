"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { installerClientService } from "@/services/installer/installer.client";

const SKIP_PREFIXES = [
  "/install",
  "/api",
  "/_next",
  "/assets",
  "/favicon",
  "/manifest",
  "/sw.js",
];

export function InstallationRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (
      checkedRef.current ||
      SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    ) {
      return;
    }

    checkedRef.current = true;

    installerClientService
      .getStatus()
      .then((status) => {
        if (!status.isInstalled) {
          router.replace("/install");
        }
      })
      .catch(() => {
        checkedRef.current = false;
      });
  }, [pathname, router]);

  return null;
}
