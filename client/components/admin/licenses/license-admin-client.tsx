"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/context/session-context";
import {
  DEMO_CONFIGURATION_LOCK_MESSAGE,
  isDemoUser as getIsDemoUser,
} from "@/lib/demo-access";
import { cn } from "@/lib/utils";
import { licenseClientService } from "@/services/licenses/license.client";
import {
  LicenseLimitKey,
  LicenseSummary,
} from "@/types/license";

const limitLabels: Record<LicenseLimitKey, string> = {
  users: "Users",
  courses: "Courses",
  faculty: "Faculty",
};

function getUsageTone(value: number, locked: boolean) {
  if (locked || value >= 80) {
    return {
      text: "text-red-600 dark:text-red-300",
      fill: "bg-red-500",
      track: "bg-red-500/12",
      label: "High usage",
    };
  }

  if (value >= 60) {
    return {
      text: "text-amber-600 dark:text-amber-300",
      fill: "bg-amber-500",
      track: "bg-amber-500/15",
      label: "Watch usage",
    };
  }

  return {
    text: "text-emerald-600 dark:text-emerald-300",
    fill: "bg-emerald-500",
    track: "bg-emerald-500/12",
    label: "Healthy",
  };
}

function formatDate(value?: string | null) {
  if (!value) return "Lifetime";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function LicenseAdminClient({
  initialSummary,
}: {
  initialSummary: LicenseSummary;
}) {
  const { user } = useSession();
  const isDemoUser = getIsDemoUser(user);
  const [summary, setSummary] = useState(initialSummary);
  const [key, setKey] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const limitRows = useMemo(
    () => {
      const plan = summary.plan;

      if (!plan) return [];

      return (Object.keys(plan.limits) as LicenseLimitKey[]).map((name) => {
        const limit = plan.limits[name];
        const used = summary.usage[name];
        const value = limit ? Math.min(Math.round((used / limit) * 100), 100) : 0;

        return {
          name,
          label: limitLabels[name],
          used,
          limit,
          value,
          locked: summary.locked[name],
        };
      });
    },
    [summary],
  );

  const activate = () => {
    if (isDemoUser) {
      toast.error(DEMO_CONFIGURATION_LOCK_MESSAGE);
      return;
    }

    startTransition(async () => {
      try {
        const response = await licenseClientService.activate({
          key,
          purchaserEmail: purchaserEmail || undefined,
        });
        setSummary(response.data);
        setKey("");
        toast.success("License activated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Activation failed");
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">License</h1>
          <p className="text-sm text-muted-foreground">
            Manage the active key, plan usage, and upgrade readiness.
          </p>
        </div>
        <Badge className="w-fit gap-1.5" variant="secondary">
          <Sparkles className="size-3.5" />
          {summary.plan?.label ?? "Not activated"}
        </Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {summary.plan ? (
              limitRows.map((row) => {
                const isUnlimited = row.limit === null;
                const tone = getUsageTone(row.value, row.locked);

                return (
                  <div className="space-y-2.5" key={row.name}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium">{row.label}</span>
                      <span
                        className={cn(
                          "font-medium",
                          isUnlimited ? "text-muted-foreground" : tone.text,
                        )}
                      >
                        {isUnlimited
                          ? `${row.used} used · Unlimited`
                          : `${row.used} / ${row.limit} · ${row.value}%`}
                      </span>
                    </div>

                    {isUnlimited ? (
                      <div className="flex h-2 items-center rounded-full bg-slate-100 px-1 dark:bg-white/10">
                        <div className="h-1 w-full rounded-full border-t border-dashed border-slate-300 dark:border-white/25" />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "h-2 overflow-hidden rounded-full",
                          tone.track,
                        )}
                        aria-label={`${row.label} ${row.value}% used`}
                      >
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            tone.fill,
                          )}
                          style={{ width: `${row.value}%` }}
                        />
                      </div>
                    )}

                    {!isUnlimited && (
                      <p className={cn("text-xs font-medium", tone.text)}>
                        {tone.label}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span>
                  KASA is not activated. Activate a valid key to use protected workspaces.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activate / Upgrade Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="license-key">License key</Label>
              <Input
                id="license-key"
                placeholder="KASA-PLUS-XXXX"
                value={key}
                onChange={(event) => setKey(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaser-email">Purchaser email</Label>
              <Input
                id="purchaser-email"
                placeholder="billing@example.com"
                value={purchaserEmail}
                onChange={(event) => setPurchaserEmail(event.target.value)}
              />
            </div>
            <Button
              className="w-full gap-2"
              disabled={isPending || key.trim().length < 12}
              onClick={activate}
            >
              <KeyRound className="size-4" />
              {isPending ? "Activating..." : "Activate License"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Key</CardTitle>
        </CardHeader>
        <CardContent>
          {summary.license && summary.plan ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">Plan</p>
                <p className="mt-1 text-sm font-semibold">{summary.plan.label}</p>
              </div>
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <p className="mt-1 text-sm font-semibold capitalize">
                  {summary.license.status}
                </p>
              </div>
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">Key</p>
                <p className="mt-1 font-mono text-sm font-semibold">
                  {summary.license.keyFingerprint}
                  {summary.license.keyLast4 ? `...${summary.license.keyLast4}` : ""}
                </p>
              </div>
              <div className="rounded-md border px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">Expiry</p>
                <p className="mt-1 text-sm font-semibold">
                  {formatDate(summary.license.expiresAt)}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              No active license key is available on this installation.
            </div>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            Use a new key for upgrade. Downgrade checks will need to compare the new limits with current usage before switching plans.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
