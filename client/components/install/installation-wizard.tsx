"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Database,
  KeyRound,
  Loader,
  Loader2,
  Play,
  ShieldCheck,
  Sparkles,
  UserRoundCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CompleteInstallationPayload,
  DatabaseSetupPayload,
  InstallationProgress,
  InstallerStatus,
  installerClientService,
} from "@/services/installer/installer.client";

const steps = [
  { key: "system", label: "System check", icon: Database },
  { key: "database", label: "Database", icon: Database },
  { key: "academy", label: "Academy details", icon: Sparkles },
  { key: "license", label: "Activation", icon: KeyRound },
  { key: "admin", label: "Admin account", icon: UserRoundCog },
] as const;

type StepKey = (typeof steps)[number]["key"];

const initialForm: CompleteInstallationPayload = {
  database: {
    mode: "bundled",
    host: "",
    port: 5432,
    name: "",
    user: "",
    password: "",
    ssl: false,
    rejectUnauthorized: true,
  },
  siteName: "CodeWithKasa",
  siteTagline: "Practical courses, live classes, and certificates in one platform.",
  supportEmail: "support@getkasa.in",
  supportPhone: "+91-987-XXX-XXXX",
  activationMode: "kasa",
  licenseKey: "",
  envatoPurchaseCode: "",
  envatoBuyerName: "",
  envatoBuyerEmail: "",
  adminFirstName: "",
  adminLastName: "",
  adminEmail: "",
  adminPassword: "",
  importDemoData: true,
};

function displayDatabaseHost(host: string, mode: "bundled" | "external") {
  if (mode === "external" && host === "host.docker.internal") {
    return "localhost";
  }

  return host;
}

function databaseHostsMatch(
  formHost: string,
  runtimeHost: string,
  mode: "bundled" | "external",
) {
  if (formHost === runtimeHost) {
    return true;
  }

  if (mode !== "external") {
    return false;
  }

  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  return localHosts.has(formHost) && runtimeHost === "host.docker.internal";
}

export function InstallationWizard() {
  const router = useRouter();
  const [status, setStatus] = useState<InstallerStatus | null>(null);
  const [activeStep, setActiveStep] = useState<StepKey>("system");
  const [form, setForm] = useState<CompleteInstallationPayload>(initialForm);
  const [licenseFingerprint, setLicenseFingerprint] = useState<string | null>(
    null,
  );
  const [licenseSummary, setLicenseSummary] = useState<{
    plan: string;
    expiresAt: string | null;
    activeActivations: number;
    maxActivations: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [systemChecked, setSystemChecked] = useState(false);
  const [databaseTesting, setDatabaseTesting] = useState(false);
  const [databaseSaved, setDatabaseSaved] = useState(false);
  const [databaseRestartRequired, setDatabaseRestartRequired] = useState(false);
  const [databaseFeedback, setDatabaseFeedback] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [installationJobId, setInstallationJobId] = useState<string | null>(null);
  const [installationProgress, setInstallationProgress] =
    useState<InstallationProgress | null>(null);

  useEffect(() => {
    installerClientService
      .getStatus()
      .then((result) => {
        setStatus(result);
        setForm((current) => ({
          ...current,
          database: {
            mode: result.database.mode || "bundled",
            host: displayDatabaseHost(
              result.database.host || "",
              result.database.mode || "bundled",
            ),
            port: result.database.port || 5432,
            name: result.database.name || "",
            user: result.database.user || "",
            password: "",
            ssl: result.database.ssl || false,
            rejectUnauthorized: true,
          },
        }));
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  const activeIndex = useMemo(
    () => steps.findIndex((step) => step.key === activeStep),
    [activeStep],
  );

  const updateForm = <K extends keyof CompleteInstallationPayload>(
    key: K,
    value: CompleteInstallationPayload[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateDatabaseForm = <
    K extends keyof NonNullable<CompleteInstallationPayload["database"]>,
  >(
    key: K,
    value: NonNullable<CompleteInstallationPayload["database"]>[K],
  ) => {
    setForm((current) => ({
      ...current,
      database: {
        host: current.database?.host || "",
        port: current.database?.port || 5432,
        name: current.database?.name || "",
        user: current.database?.user || "",
        mode: current.database?.mode || "bundled",
        password: current.database?.password || "",
        ssl: current.database?.ssl || false,
        rejectUnauthorized: current.database?.rejectUnauthorized !== false,
        [key]: value,
      },
    }));
    setDatabaseSaved(false);
    setDatabaseRestartRequired(false);
    setDatabaseFeedback(null);
  };

  const goNext = () => {
    const nextStep = steps[activeIndex + 1];
    if (nextStep) setActiveStep(nextStep.key);
  };

  const goBack = () => {
    const previousStep = steps[activeIndex - 1];
    if (previousStep) setActiveStep(previousStep.key);
  };

  const validateLicense = async () => {
    setValidating(true);
    try {
      const result =
        form.activationMode === "envato"
          ? await installerClientService.validateLicense({
              activationMode: "envato",
              envatoPurchaseCode: form.envatoPurchaseCode || "",
              envatoBuyerName: form.envatoBuyerName,
              envatoBuyerEmail: form.envatoBuyerEmail || "",
            })
          : await installerClientService.validateLicense({
              activationMode: "kasa",
              licenseKey: form.licenseKey || "",
            });
      setLicenseFingerprint(result.fingerprint);
      setLicenseSummary({
        plan: result.plan,
        expiresAt: result.expiresAt,
        activeActivations: result.activeActivations,
        maxActivations: result.maxActivations,
      });
      toast.success("License activated");
      setActiveStep("admin");
    } catch (error) {
      setLicenseFingerprint(null);
      setLicenseSummary(null);
      toast.error(error instanceof Error ? error.message : "Activation failed");
    } finally {
      setValidating(false);
    }
  };

  const completeInstallation = async () => {
    setSubmitting(true);
    try {
      const result = await installerClientService.start(form);
      setInstallationJobId(result.jobId);
      setInstallationProgress({
        id: result.jobId,
        status: "queued",
        progress: 1,
        label: "Installation queued...",
        error: null,
        redirectTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Installation could not finish",
      );
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!installationJobId) return;

    const interval = window.setInterval(async () => {
      try {
        const progress =
          await installerClientService.getProgress(installationJobId);
        setInstallationProgress(progress);

        if (progress.status === "completed") {
          window.clearInterval(interval);
          toast.success("Installation completed");
          router.push(progress.redirectTo || "/auth/sign-in");
        }

        if (progress.status === "failed") {
          window.clearInterval(interval);
          toast.error(progress.error || "Installation could not finish");
          setSubmitting(false);
        }
      } catch (error) {
        window.clearInterval(interval);
        toast.error(
          error instanceof Error ? error.message : "Could not read progress",
        );
        setSubmitting(false);
      }
    }, 850);

    return () => window.clearInterval(interval);
  }, [installationJobId, router]);

  const normalizedProgress = Math.max(
    0,
    Math.min(100, installationProgress?.progress || 0),
  );

  const databaseMatchesActiveConnection =
    Boolean(status?.database.connected) &&
    databaseHostsMatch(
      form.database?.host || "",
      status?.database.host || "",
      form.database?.mode || status?.database.mode || "bundled",
    ) &&
    Number(form.database?.port) === Number(status?.database.port) &&
    form.database?.name === status?.database.name &&
    form.database?.user === status?.database.user &&
    (form.database?.mode || "bundled") === (status?.database.mode || "bundled");

  const databaseMatchesStatus = (
    payload: DatabaseSetupPayload,
    nextStatus: InstallerStatus,
  ) =>
    Boolean(nextStatus.database.connected) &&
    databaseHostsMatch(
      payload.host,
      nextStatus.database.host,
      payload.mode,
    ) &&
    Number(payload.port) === Number(nextStatus.database.port) &&
    payload.name === nextStatus.database.name &&
    payload.user === nextStatus.database.user &&
    payload.mode === nextStatus.database.mode;

  const databasePayload = (): DatabaseSetupPayload => ({
    mode: form.database?.mode || "bundled",
    host: form.database?.host || "",
    port: Number(form.database?.port || 5432),
    name: form.database?.name || "",
    user: form.database?.user || "",
    password: form.database?.password || undefined,
    ssl: Boolean(form.database?.ssl),
    rejectUnauthorized: form.database?.rejectUnauthorized !== false,
  });

  const testAndSaveDatabase = async () => {
    setDatabaseTesting(true);
    try {
      const payload = databasePayload();
      if (payload.mode === "external") {
        await installerClientService.testDatabase(payload);
      }
      const result = await installerClientService.saveDatabase(payload);
      setDatabaseSaved(true);
      setDatabaseRestartRequired(result.restartRequired);
      setDatabaseFeedback(result.message);
      toast.success(result.message);
      if (result.restartRequired) {
        await waitForRuntimeDatabase(payload);
      }
    } catch (error) {
      setDatabaseSaved(false);
      setDatabaseRestartRequired(false);
      setDatabaseFeedback(null);
      toast.error(
        error instanceof Error ? error.message : "Database could not be verified",
      );
    } finally {
      setDatabaseTesting(false);
    }
  };

  const waitForRuntimeDatabase = async (payload: DatabaseSetupPayload) => {
    setDatabaseFeedback(
      "Database saved. Kasa is reconnecting to the selected database...",
    );

    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 1500));

      try {
        const nextStatus = await installerClientService.getStatus();
        setStatus(nextStatus);

        if (databaseMatchesStatus(payload, nextStatus)) {
          setDatabaseSaved(true);
          setDatabaseRestartRequired(false);
          setDatabaseFeedback(
            "Database runtime connected. You can continue installation.",
          );
          toast.success("Database runtime connected");
          return;
        }
      } catch {
        // The API can be unavailable for a few seconds while Docker restarts it.
      }
    }

    setDatabaseFeedback(
      "Database saved, but Kasa has not reconnected yet. Run kasa restart dev and refresh this installer.",
    );
  };

  if (installationProgress) {
    return (
      <InstallShell>
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center">
          <div className="w-full overflow-hidden rounded-[2rem] border bg-card shadow-sm">
            <div className="border-b bg-primary/5 p-8 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                {installationProgress.status === "completed" ? (
                  <CheckCircle2 className="size-8" />
                ) : (
                  <Loader2 className="size-8 animate-spin" />
                )}
              </div>
              <h1 className="mt-6 text-3xl font-semibold">
                Installing CodeWithKasa
              </h1>
              <p className="mt-2 text-muted-foreground">
                Keep this page open while the platform prepares your database,
                demo content, and admin workspace.
              </p>
            </div>
            <div className="p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Current step
                  </p>
                  <p className="mt-1 text-xl font-semibold">
                    {installationProgress.label}
                  </p>
                </div>
                <p className="text-4xl font-semibold text-primary">
                  {normalizedProgress}%
                </p>
              </div>
              <div className="mt-6 h-5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${normalizedProgress}%` }}
                />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <ProgressTile
                  label="Status"
                  value={installationProgress.status}
                />
                <ProgressTile
                  label="Job"
                  value={installationProgress.id.slice(0, 8).toUpperCase()}
                />
                <ProgressTile
                  label="Updated"
                  value={new Date(installationProgress.updatedAt).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                />
              </div>
              {installationProgress.status === "failed" ? (
                <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {installationProgress.error}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </InstallShell>
    );
  }

  if (loading) {
    return (
      <InstallShell>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <Loader className="mx-auto size-8 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Checking installation status...
            </p>
          </div>
        </div>
      </InstallShell>
    );
  }

  if (status?.isInstalled) {
    return (
      <InstallShell>
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center">
          <div className="w-full rounded-[2rem] border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-8" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold">
              Installation is complete
            </h1>
            <p className="mt-3 text-muted-foreground">
              This academy is already configured. Continue to the admin login to
              manage the platform.
            </p>
            <Button className="mt-6" onClick={() => router.push("/auth/sign-in")}>
              Go to login
            </Button>
          </div>
        </div>
      </InstallShell>
    );
  }

  return (
    <InstallShell>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="rounded-[2rem] border bg-card p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <ShieldCheck className="size-4" />
            Secure setup
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Set up your academy workspace.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Connect the database, verify your purchase, create the first admin,
            and optionally import starter content.
          </p>

          <div className="mt-8 space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.key === activeStep;
              const isDone = index < activeIndex;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => index <= activeIndex && setActiveStep(step.key)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isDone
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "bg-background"
                  }`}
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-background/80 text-foreground">
                    {isDone ? (
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    ) : (
                      <Icon className="size-5" />
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      {step.label}
                    </span>
                    <span className="text-xs opacity-75">Step {index + 1}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="rounded-[2rem] border bg-card p-6 shadow-sm">
          {activeStep === "system" ? (
            <section>
              <SectionTitle
                icon={Database}
                title="System check"
                description="Run a quick readiness check before entering setup details."
              />
              <div className="mt-6 rounded-[1.5rem] border bg-muted/30 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">Application health</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This checks the API, configured database connection, and
                      installer state.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={systemChecked ? "secondary" : "default"}
                    onClick={() => setSystemChecked(true)}
                  >
                    {systemChecked ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <ShieldCheck className="size-4" />
                    )}
                    {systemChecked ? "System checked" : "Run system check"}
                  </Button>
                </div>
              </div>
              {systemChecked ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <InfoTile label="API" value="Reachable" tone="success" />
                  <InfoTile
                    label="Runtime database"
                    value={status?.database.connected ? "Connected" : "Not ready"}
                    tone={status?.database.connected ? "success" : "danger"}
                  />
                  <InfoTile
                    label="Admin account"
                    value={status?.hasAdmin ? "Exists" : "Not created"}
                  />
                  <InfoTile
                    label="Installer"
                    value={status?.isInstalled ? "Complete" : "Ready"}
                    tone={status?.isInstalled ? "success" : "default"}
                  />
                </div>
              ) : null}
              <div className="mt-6 rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                This checks the database Kasa is currently running on. You will
                choose bundled Docker database or your own PostgreSQL database in
                the next step.
              </div>
              <WizardActions
                onNext={goNext}
                onBack={goBack}
                showBack={activeIndex > 0}
                nextDisabled={!systemChecked || !status?.database.connected}
              />
            </section>
          ) : null}

          {activeStep === "database" ? (
            <section>
              <SectionTitle
                icon={Database}
                title="Database details"
                description="Use the bundled Docker database for quick setup, or connect your own PostgreSQL database such as local Postgres or Amazon RDS."
              />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm((current) => ({
                      ...current,
                      database: {
                        mode: "bundled",
                        host: status?.database.host || "postgres",
                        port: status?.database.port || 5432,
                        name: status?.database.name || "codewithkasa",
                        user: status?.database.user || "codewithkasa",
                        password: "",
                        ssl: false,
                        rejectUnauthorized: true,
                      },
                    }));
                    setDatabaseSaved(false);
                    setDatabaseRestartRequired(false);
                    setDatabaseFeedback(null);
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    (form.database?.mode || "bundled") === "bundled"
                      ? "border-primary bg-primary/10"
                      : "bg-muted/30"
                  }`}
                >
                  <span className="text-sm font-semibold">
                    Use bundled Docker database
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    Best for local testing and quick installs. Kasa manages the
                    Docker Postgres volume.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm((current) => ({
                      ...current,
                      database: {
                        mode: "external",
                        host:
                          current.database?.mode === "external"
                            ? displayDatabaseHost(
                                current.database.host,
                                "external",
                              )
                            : "",
                        port: current.database?.port || 5432,
                        name:
                          current.database?.mode === "external"
                            ? current.database.name
                            : "",
                        user:
                          current.database?.mode === "external"
                            ? current.database.user
                            : "",
                        password: "",
                        ssl: current.database?.ssl || false,
                        rejectUnauthorized:
                          current.database?.rejectUnauthorized !== false,
                      },
                    }));
                    setDatabaseSaved(false);
                    setDatabaseRestartRequired(false);
                    setDatabaseFeedback(null);
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    form.database?.mode === "external"
                      ? "border-primary bg-primary/10"
                      : "bg-muted/30"
                  }`}
                >
                  <span className="text-sm font-semibold">
                    Use my own PostgreSQL database
                  </span>
                  <span className="mt-2 block text-sm text-muted-foreground">
                    Use local Postgres, a private server, or RDS. If Kasa runs
                    in Docker, localhost is translated to host.docker.internal.
                  </span>
                </button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Host">
                  <Input
                    value={form.database?.host || ""}
                    onChange={(event) =>
                      updateDatabaseForm("host", event.target.value)
                    }
                  />
                </Field>
                <Field label="Port">
                  <Input
                    type="number"
                    value={form.database?.port || 5432}
                    onChange={(event) =>
                      updateDatabaseForm("port", Number(event.target.value))
                    }
                  />
                </Field>
                <Field label="Database name">
                  <Input
                    value={form.database?.name || ""}
                    onChange={(event) =>
                      updateDatabaseForm("name", event.target.value)
                    }
                  />
                </Field>
                <Field label="Database user">
                  <Input
                    value={form.database?.user || ""}
                    onChange={(event) =>
                      updateDatabaseForm("user", event.target.value)
                    }
                  />
                </Field>
                <Field label="Database password">
                  <Input
                    value={
                      form.database?.mode === "external"
                        ? form.database?.password || ""
                        : "Stored in Docker/env"
                    }
                    type="password"
                    disabled={form.database?.mode !== "external"}
                    className="disabled:opacity-80"
                    onChange={(event) =>
                      updateDatabaseForm("password", event.target.value)
                    }
                  />
                </Field>
              </div>
              {form.database?.mode === "external" ? (
                <div className="mt-4 space-y-3">
                  <label className="flex items-start gap-3 rounded-2xl border p-4">
                    <Checkbox
                      checked={Boolean(form.database.ssl)}
                      onCheckedChange={(checked) =>
                        updateDatabaseForm("ssl", checked === true)
                      }
                    />
                    <span>
                      <span className="block text-sm font-semibold">
                        Require SSL connection
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Enable this for most managed databases such as Amazon RDS.
                      </span>
                    </span>
                  </label>
                  <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                    Running through Docker? Your local PostgreSQL is not
                    available as localhost inside the API container. Enter
                    localhost if you prefer, and Kasa will save it as
                    host.docker.internal for the container runtime.
                  </div>
                </div>
              ) : null}
              <div
                className={`mt-6 rounded-2xl border p-4 text-sm ${
                  databaseRestartRequired
                    ? "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-200"
                    : databaseMatchesActiveConnection
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200"
                }`}
              >
                {databaseRestartRequired
                  ? databaseFeedback ||
                    "Database selection saved. Kasa is reconnecting to the selected database..."
                  : databaseMatchesActiveConnection
                  ? "Database connection verified. The installer will create admin, settings, and demo content in this database."
                  : databaseFeedback ||
                    "Verify and save this database before continuing. External databases must already exist before Kasa can install tables and data."}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testAndSaveDatabase}
                  disabled={
                    databaseTesting ||
                    !form.database?.host ||
                    !form.database?.name ||
                    !form.database?.user ||
                    (form.database?.mode === "external" &&
                      !form.database?.password)
                  }
                >
                  {databaseTesting ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <Database className="size-4" />
                  )}
                  {form.database?.mode === "bundled"
                    ? "Use bundled database"
                    : "Test and save database"}
                </Button>
                {databaseRestartRequired ? (
                  <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
                    <Loader className="size-4 animate-spin" />
                    Reconnecting database runtime
                  </div>
                ) : null}
              </div>
              <WizardActions
                onNext={goNext}
                onBack={goBack}
                showBack
                nextDisabled={
                  !databaseMatchesActiveConnection ||
                  databaseRestartRequired ||
                  (form.database?.mode === "external" &&
                    !databaseSaved &&
                    !databaseMatchesActiveConnection)
                }
              />
            </section>
          ) : null}

          {activeStep === "academy" ? (
            <section>
              <SectionTitle
                icon={Sparkles}
                title="Academy details"
                description="These values become the first site identity. You can edit them later from Site Settings."
              />
              <div className="mt-6 grid gap-4">
                <Field label="Academy name">
                  <Input
                    value={form.siteName}
                    onChange={(event) => updateForm("siteName", event.target.value)}
                  />
                </Field>
                <Field label="Tagline">
                  <Textarea
                    value={form.siteTagline}
                    onChange={(event) =>
                      updateForm("siteTagline", event.target.value)
                    }
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Support email">
                    <Input
                      value={form.supportEmail}
                      onChange={(event) =>
                        updateForm("supportEmail", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Support phone">
                    <Input
                      value={form.supportPhone}
                      onChange={(event) =>
                        updateForm("supportPhone", event.target.value)
                      }
                    />
                  </Field>
                </div>
              </div>
              <WizardActions onNext={goNext} onBack={goBack} showBack />
            </section>
          ) : null}

          {activeStep === "license" ? (
            <section>
              <SectionTitle
                icon={KeyRound}
                title="Verify your purchase"
                description="Choose the purchase method you used, then verify access to continue setup."
              />
              <div className="mt-6 grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["kasa", "envato"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        updateForm("activationMode", mode);
                        setLicenseFingerprint(null);
                        setLicenseSummary(null);
                      }}
                      className={`rounded-2xl border p-4 text-left transition ${
                        form.activationMode === mode
                          ? "border-primary bg-primary/10"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="block text-sm font-semibold">
                        {mode === "kasa" ? "License key" : "Envato purchase code"}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {mode === "kasa"
                          ? "Use the license key provided with your purchase."
                          : "Use the purchase code from the Envato downloads page."}
                      </span>
                    </button>
                  ))}
                </div>

                {form.activationMode === "envato" ? (
                  <div className="grid gap-4">
                    <Field label="Envato purchase code">
                      <Input
                        value={form.envatoPurchaseCode}
                        onChange={(event) => {
                          updateForm("envatoPurchaseCode", event.target.value);
                          setLicenseFingerprint(null);
                          setLicenseSummary(null);
                        }}
                        placeholder="Enter your Envato purchase code"
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Buyer email">
                        <Input
                          type="email"
                          value={form.envatoBuyerEmail}
                          onChange={(event) => {
                            updateForm("envatoBuyerEmail", event.target.value);
                            setLicenseFingerprint(null);
                            setLicenseSummary(null);
                          }}
                          placeholder="buyer@email.com"
                        />
                      </Field>
                      <Field label="Buyer name">
                        <Input
                          value={form.envatoBuyerName}
                          onChange={(event) =>
                            updateForm("envatoBuyerName", event.target.value)
                          }
                          placeholder="Name used for support records"
                        />
                      </Field>
                    </div>
                  </div>
                ) : (
                  <Field label="License key">
                    <Input
                      value={form.licenseKey}
                      onChange={(event) => {
                        updateForm("licenseKey", event.target.value);
                        setLicenseFingerprint(null);
                        setLicenseSummary(null);
                      }}
                      placeholder="Enter your license key"
                    />
                  </Field>
                )}
                {licenseFingerprint ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-600">
                    <div className="flex items-center gap-3">
                      <BadgeCheck className="size-5" />
                      <span className="font-semibold">
                        License verified. Fingerprint {licenseFingerprint}
                      </span>
                    </div>
                    {licenseSummary ? (
                      <div className="mt-3 grid gap-2 text-xs text-emerald-700 dark:text-emerald-200 sm:grid-cols-3">
                        <span>Plan: {licenseSummary.plan}</span>
                        <span>
                          Activations: {licenseSummary.activeActivations}/
                          {licenseSummary.maxActivations}
                        </span>
                        <span>
                          Expires:{" "}
                          {licenseSummary.expiresAt
                            ? new Date(licenseSummary.expiresAt).toLocaleDateString(
                                "en-IN",
                              )
                            : "Lifetime"}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button
                  onClick={validateLicense}
                  disabled={
                    validating ||
                    (form.activationMode === "envato"
                      ? (form.envatoPurchaseCode || "").trim().length < 8 ||
                        !(form.envatoBuyerEmail || "").includes("@")
                      : (form.licenseKey || "").trim().length < 8)
                  }
                >
                  {validating ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  Verify purchase
                </Button>
              </div>
            </section>
          ) : null}

          {activeStep === "admin" ? (
            <section>
              <SectionTitle
                icon={UserRoundCog}
                title="First admin account"
                description="This account will receive full platform access after installation is complete."
              />
              <div className="mt-6 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="First name">
                    <Input
                      value={form.adminFirstName}
                      onChange={(event) =>
                        updateForm("adminFirstName", event.target.value)
                      }
                    />
                  </Field>
                  <Field label="Last name">
                    <Input
                      value={form.adminLastName}
                      onChange={(event) =>
                        updateForm("adminLastName", event.target.value)
                      }
                    />
                  </Field>
                </div>
                <Field label="Admin email">
                  <Input
                    type="email"
                    value={form.adminEmail}
                    onChange={(event) =>
                      updateForm("adminEmail", event.target.value)
                    }
                  />
                </Field>
                <Field label="Password">
                  <Input
                    type="password"
                    value={form.adminPassword}
                    onChange={(event) =>
                      updateForm("adminPassword", event.target.value)
                    }
                  />
                </Field>
                <label className="flex items-start gap-3 rounded-2xl border p-4">
                  <Checkbox
                    checked={form.importDemoData}
                    onCheckedChange={(checked) =>
                      updateForm("importDemoData", checked === true)
                    }
                  />
                  <span>
                    <span className="block text-sm font-semibold">
                      Import marketplace demo data?
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Adds demo courses, batches, class sessions, coupons,
                      articles, testimonials, notifications, and schedulers.
                    </span>
                  </span>
                </label>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button type="button" variant="outline" onClick={goBack}>
                  Back
                </Button>
                <Button
                  onClick={completeInstallation}
                  disabled={
                    submitting ||
                    !licenseFingerprint ||
                    !form.adminEmail ||
                    form.adminPassword.length < 8
                  }
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Play className="size-4" />
                  )}
                  Complete installation
                </Button>
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </InstallShell>
  );
}

function InstallShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_32%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)))] px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            CodeWithKasa Installer
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Product setup
          </p>
        </div>
        <div className="rounded-full border bg-card px-4 py-2 text-sm font-medium">
          CodeWithKasa
        </div>
      </div>
      {children}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-6" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function InfoTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-2 text-lg font-semibold ${
          tone === "success"
            ? "text-emerald-500"
            : tone === "danger"
              ? "text-destructive"
              : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ProgressTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-semibold capitalize">{value}</p>
    </div>
  );
}

function WizardActions({
  onBack,
  onNext,
  showBack = false,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext: () => void;
  showBack?: boolean;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
      {showBack ? (
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
      ) : (
        <span />
      )}
      <Button onClick={onNext} disabled={nextDisabled}>
        Continue
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
