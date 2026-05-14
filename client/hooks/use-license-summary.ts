"use client";

import { useEffect, useState } from "react";
import { licenseClientService } from "@/services/licenses/license.client";
import type { LicenseSummary } from "@/types/license";

export function useLicenseSummary() {
  const [summary, setSummary] = useState<LicenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void licenseClientService
      .getCurrent()
      .then((response) => {
        if (mounted) setSummary(response.data);
      })
      .catch(() => {
        if (mounted) setSummary(null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { summary, isLoading };
}
