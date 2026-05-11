import { apiClient } from "@/lib/api/client";

type ApiResponse<T> = {
  data: T;
};

export type InstallerStatus = {
  isInstalled: boolean;
  installedAt: string | null;
  hasAdmin: boolean;
  licenseRequired: boolean;
  database: {
    mode: "bundled" | "external";
    host: string;
    port: number;
    name: string;
    user: string;
    ssl: boolean;
    runtimeConfigPath: string;
    connected: boolean;
  };
};

export type CompleteInstallationPayload = {
  database?: {
    mode?: "bundled" | "external";
    host: string;
    port: number;
    name: string;
    user: string;
    password?: string;
    ssl?: boolean;
    rejectUnauthorized?: boolean;
  };
  siteName: string;
  siteTagline?: string;
  supportEmail?: string;
  supportPhone?: string;
  licenseKey: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  importDemoData: boolean;
};

export type InstallationProgress = {
  id: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  label: string;
  error: string | null;
  redirectTo: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DatabaseSetupPayload = NonNullable<
  CompleteInstallationPayload["database"]
> & {
  mode: "bundled" | "external";
};

export const installerClientService = {
  getStatus: async () => {
    const response =
      await apiClient.get<ApiResponse<InstallerStatus>>("/api/installer/status");
    return response.data;
  },

  validateLicense: async (licenseKey: string) => {
    const response = await apiClient.post<
      ApiResponse<{
        valid: boolean;
        fingerprint: string;
        plan: string;
        expiresAt: string | null;
        activeActivations: number;
        maxActivations: number;
      }>
    >("/api/installer/validate-license", { licenseKey });
    return response.data;
  },

  testDatabase: async (payload: DatabaseSetupPayload) => {
    const response = await apiClient.post<
      ApiResponse<{ connected: boolean; message: string }>
    >("/api/installer/database/test", payload);
    return response.data;
  },

  saveDatabase: async (payload: DatabaseSetupPayload) => {
    const response = await apiClient.post<
      ApiResponse<{
        saved: boolean;
        restartRequired: boolean;
        autoRestart?: boolean;
        host?: string;
        message: string;
      }>
    >("/api/installer/database/save", payload);
    return response.data;
  },

  complete: async (payload: CompleteInstallationPayload) => {
    const response = await apiClient.post<
      ApiResponse<{ isInstalled: boolean; redirectTo: string }>
    >("/api/installer/complete", payload);
    return response.data;
  },

  start: async (payload: CompleteInstallationPayload) => {
    const response = await apiClient.post<ApiResponse<{ jobId: string }>>(
      "/api/installer/start",
      payload,
    );
    return response.data;
  },

  getProgress: async (jobId: string) => {
    const response = await apiClient.get<ApiResponse<InstallationProgress>>(
      `/api/installer/progress/${jobId}`,
    );
    return response.data;
  },
};
