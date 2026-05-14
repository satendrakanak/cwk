"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { licenseClientService } from "@/services/licenses/license.client";
import type { LicenseSummary } from "@/types/license";

type AdminLicenseContextValue = {
  summary: LicenseSummary | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const AdminLicenseContext = createContext<AdminLicenseContextValue | null>(null);

export function AdminLicenseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [summary, setSummary] = useState<LicenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await licenseClientService.getCurrent();
      setSummary(response.data);
      setError(null);
    } catch (err) {
      setSummary(null);
      setError(
        err instanceof Error
          ? err.message
          : "License status could not be checked.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ summary, isLoading, error, refresh }),
    [error, isLoading, refresh, summary],
  );

  return (
    <AdminLicenseContext.Provider value={value}>
      {children}
    </AdminLicenseContext.Provider>
  );
}

export function useAdminLicense() {
  const context = useContext(AdminLicenseContext);

  if (!context) {
    throw new Error("useAdminLicense must be used within AdminLicenseProvider.");
  }

  return context;
}
