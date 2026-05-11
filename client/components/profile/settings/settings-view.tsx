"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-handler";
import { profileClientService } from "@/services/users/profile.client";
import { User } from "@/types/user";
import { SwitchRow } from "../switch-row";
import { ChangePasswordForm } from "./change-password-form";
import { PushNotificationSettings } from "@/components/notifications/push-notification-settings";

interface SettingsViewProps {
  user: User;
}

export default function SettingsView({ user }: SettingsViewProps) {
  const [isSaving, startSaving] = useTransition();

  const [data, setData] = useState({
    isPublic: user.profile?.isPublic ?? false,
    showCourses: user.profile?.showCourses ?? true,
    showCertificates: user.profile?.showCertificates ?? true,
  });

  const [dirty, setDirty] = useState(false);

  const isFaculty = useMemo(
    () => user.roles?.some((role) => role.name === "faculty") ?? false,
    [user.roles],
  );

  const handleProfileSave = () => {
    startSaving(async () => {
      try {
        await profileClientService.updateProfile({
          isPublic: data.isPublic,
          showCourses: data.showCourses,
          showCertificates: data.showCertificates,
        });

        setDirty(false);
        toast.success("Settings updated");
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <PushNotificationSettings />

          <section className="academy-card p-5 md:p-6">
            <SectionHeader
              icon={ShieldCheck}
              eyebrow="Privacy Settings"
              title="Control how your profile appears"
              description="Decide what visitors and learners can see when they open your public profile surfaces."
            />

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border border-border bg-muted/50 p-4">
                <SwitchRow
                  label="Public Profile"
                  description="Allow your learner profile to be discoverable from public views."
                  checked={data.isPublic}
                  onChange={(value) => {
                    setDirty(true);
                    setData((current) => ({ ...current, isPublic: value }));
                  }}
                />
              </div>

              <div className="rounded-2xl border border-border bg-muted/50 p-4">
                <SwitchRow
                  label="Show Courses"
                  description="Display your enrolled or taught courses on public profile areas."
                  checked={data.showCourses}
                  onChange={(value) => {
                    setDirty(true);
                    setData((current) => ({
                      ...current,
                      showCourses: value,
                    }));
                  }}
                />
              </div>

              <div className="rounded-2xl border border-border bg-muted/50 p-4">
                <SwitchRow
                  label="Show Certificates"
                  description="Expose completed course certificates on your public-facing profile."
                  checked={data.showCertificates}
                  onChange={(value) => {
                    setDirty(true);
                    setData((current) => ({
                      ...current,
                      showCertificates: value,
                    }));
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-6 text-muted-foreground">
                Changes will only apply after saving your visibility settings.
              </p>

              <Button
                type="button"
                disabled={!dirty || isSaving}
                onClick={handleProfileSave}
                className="h-11 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Visibility
                  </>
                )}
              </Button>
            </div>
          </section>

          <ChangePasswordForm />
        </div>

        <div className="space-y-6">
          <section className="academy-card p-5 md:p-6">
            <SectionHeader
              icon={UserRound}
              eyebrow="Account Summary"
              title="Current visibility state"
              description="A quick snapshot of what your profile currently exposes."
              compact
            />

            <div className="mt-5 space-y-3">
              <SummaryRow
                icon={data.isPublic ? Eye : EyeOff}
                label="Profile type"
                value={data.isPublic ? "Publicly visible" : "Private"}
                active={data.isPublic}
              />

              <SummaryRow
                icon={data.showCourses ? Eye : EyeOff}
                label="Courses section"
                value={data.showCourses ? "Visible to visitors" : "Hidden"}
                active={data.showCourses}
              />

              <SummaryRow
                icon={data.showCertificates ? Eye : EyeOff}
                label="Certificates section"
                value={data.showCertificates ? "Visible to visitors" : "Hidden"}
                active={data.showCertificates}
              />

              <SummaryRow
                icon={UserRound}
                label="Faculty access"
                value={
                  isFaculty ? "Faculty profile enabled" : "Learner profile"
                }
                active={isFaculty}
              />
            </div>
          </section>

          <section className="academy-card p-5 md:p-6">
            <SectionHeader
              icon={LockKeyhole}
              eyebrow="Security Notes"
              title="Keep your account protected"
              description="Small security habits make your account and certificates safer."
              compact
            />

            <ul className="mt-5 space-y-3">
              <SecurityNote>
                Use a strong password that you do not reuse elsewhere.
              </SecurityNote>

              <SecurityNote>
                Keep your contact email accurate so certificates and updates
                reach you.
              </SecurityNote>

              <SecurityNote>
                Review public profile visibility before sharing your dashboard
                publicly.
              </SecurityNote>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  compact = false,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 border-b border-border ${
        compact ? "pb-4" : "pb-5"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>

        <h3
          className={`mt-2 font-semibold text-card-foreground ${
            compact ? "text-xl" : "text-2xl"
          }`}
        >
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
  active,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/50 p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
          active
            ? "bg-primary/10 text-primary ring-primary/15"
            : "bg-background text-muted-foreground ring-border"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-card-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function SecurityNote({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-2xl border border-border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
      {children}
    </li>
  );
}
