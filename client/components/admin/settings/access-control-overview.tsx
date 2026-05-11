"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { compactNumberFormatter } from "@/components/admin/dashboard/dashboard-utils";
import { Permission, Role } from "@/types/user";
import { getPermissionGroups, isSystemRole } from "@/lib/access-control";
import { KeyRound, ShieldCheck, ShieldEllipsis, Users } from "lucide-react";

const statCardConfig = [
  {
    key: "roles",
    title: "Total Roles",
    icon: ShieldCheck,
    tone: "from-[var(--brand-500)]/16 via-[var(--brand-100)] to-white",
  },
  {
    key: "customRoles",
    title: "Custom Roles",
    icon: ShieldEllipsis,
    tone: "from-emerald-500/16 via-emerald-50 to-white",
  },
  {
    key: "permissions",
    title: "Permissions",
    icon: KeyRound,
    tone: "from-sky-500/16 via-sky-50 to-white",
  },
  {
    key: "assignments",
    title: "Role Assignments",
    icon: Users,
    tone: "from-violet-500/16 via-violet-50 to-white",
  },
] as const;

export function AccessControlOverview({
  roles,
  permissions,
}: {
  roles: Role[];
  permissions: Permission[];
}) {
  const permissionGroups = getPermissionGroups(permissions);
  const totalAssignments = roles.reduce(
    (sum, role) => sum + (role.permissions?.length ?? 0),
    0,
  );

  const statValues = {
    roles: compactNumberFormatter.format(roles.length),
    customRoles: compactNumberFormatter.format(
      roles.filter((role) => !isSystemRole(role.name)).length,
    ),
    permissions: compactNumberFormatter.format(permissions.length),
    assignments: compactNumberFormatter.format(totalAssignments),
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCardConfig.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.key}
              className={`border border-[var(--brand-100)] bg-gradient-to-br ${card.tone} shadow-[0_20px_60px_-42px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] dark:[background-image:none]`}
            >
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-300">{card.title}</p>
                    <CardTitle className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
                      {statValues[card.key]}
                    </CardTitle>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-3 text-[var(--brand-700)] shadow-sm dark:bg-white/10 dark:text-[var(--brand-200)]">
                    <Icon className="size-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-sm text-slate-500 dark:text-slate-300">
                  {card.key === "roles" && "Keep your admin hierarchy structured."}
                  {card.key === "customRoles" &&
                    "Separate academy operations from system defaults."}
                  {card.key === "permissions" &&
                    "Granular actions for every admin module."}
                  {card.key === "assignments" &&
                    "Total permissions attached across all roles."}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border border-[var(--brand-100)] bg-white shadow-[0_20px_60px_-42px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">
              Permission Modules
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              See how your access rules are distributed across the platform.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {permissionGroups.map((group) => (
              <div
                key={group.module}
                className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/6"
              >
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {group.module
                      .split("_")
                      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                      .join(" ")}
                  </p>
                  <Badge variant="outline" className="dark:border-white/10 dark:bg-white/8 dark:text-slate-200">{group.permissions.length}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.permissions.slice(0, 4).map((permission) => (
                    <span
                      key={permission.id}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-200 dark:ring-white/10"
                    >
                      {permission.name}
                    </span>
                  ))}
                  {group.permissions.length > 4 && (
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10">
                      +{group.permissions.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-[var(--brand-100)] bg-white shadow-[0_20px_60px_-42px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">
              Protected Roles
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              These baseline roles stay locked to protect the academy setup.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {roles
              .filter((role) => isSystemRole(role.name))
              .map((role) => (
                <div
                  key={role.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/6"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {role.permissions?.length ?? 0} permissions assigned
                      </p>
                    </div>
                    <Badge className="border-[var(--brand-200)] bg-[var(--brand-50)] text-[var(--brand-700)] dark:border-[var(--brand-500)]/25 dark:bg-[var(--brand-500)]/12 dark:text-[var(--brand-300)]">
                      System
                    </Badge>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
