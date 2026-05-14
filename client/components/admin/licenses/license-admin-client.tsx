"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, KeyRound, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { licenseClientService } from "@/services/licenses/license.client";
import { LicenseFeatureKey, LicenseLimitKey, LicenseSummary } from "@/types/license";

const limitLabels: Record<LicenseLimitKey, string> = {
  users: "Users",
  courses: "Courses",
  faculty: "Faculty",
};

const featureLabels: Record<LicenseFeatureKey, string> = {
  courses: "Course management",
  faculty: "Faculty workspace",
  liveClasses: "Live classes",
  exams: "Exams",
  assignments: "Assignments",
  certificates: "Certificates",
  coupons: "Coupons",
  emailTemplates: "Email templates",
  engagement: "Engagement automation",
  advancedSettings: "Advanced settings",
  branding: "Branding controls",
  prioritySupport: "Priority support",
};

export function LicenseAdminClient({
  initialSummary,
}: {
  initialSummary: LicenseSummary;
}) {
  const [summary, setSummary] = useState(initialSummary);
  const [key, setKey] = useState("");
  const [purchaserEmail, setPurchaserEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  const limitRows = useMemo(
    () =>
      (Object.keys(summary.plan.limits) as LicenseLimitKey[]).map((name) => {
        const limit = summary.plan.limits[name];
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
      }),
    [summary],
  );

  const activate = () => {
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
            Control KASA plan unlocks, limits, and upgrade readiness.
          </p>
        </div>
        <Badge className="w-fit gap-1.5" variant="secondary">
          <Sparkles className="size-3.5" />
          {summary.plan.label}
        </Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {limitRows.map((row) => (
              <div className="space-y-2" key={row.name}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{row.label}</span>
                  <span className={row.locked ? "text-destructive" : "text-muted-foreground"}>
                    {row.used} / {row.limit ?? "Unlimited"}
                  </span>
                </div>
                <Progress value={row.limit ? row.value : 100} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activate Key</CardTitle>
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
          <CardTitle className="text-base">Feature Unlocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(Object.keys(summary.plan.features) as LicenseFeatureKey[]).map(
              (feature) => {
                const enabled = summary.plan.features[feature];

                return (
                  <div
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                    key={feature}
                  >
                    <span className="text-sm font-medium">
                      {featureLabels[feature]}
                    </span>
                    {enabled ? (
                      <Check className="size-4 text-emerald-600" />
                    ) : (
                      <Lock className="size-4 text-muted-foreground" />
                    )}
                  </div>
                );
              },
            )}
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Starter is used as the fallback when no active key exists. Plus and
            Enterprise keys unlock higher limits instantly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
