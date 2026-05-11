"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessControlDashboardData } from "@/types/access-control";
import { Role, Permission } from "@/types/user";
import { SettingsShell } from "./settings-shell";
import { AccessControlOverview } from "./access-control-overview";
import { RolesPanel } from "./roles-panel";
import { PermissionsPanel } from "./permissions-panel";

export function AccessControlDashboard({
  data,
}: {
  data: AccessControlDashboardData;
}) {
  const [roles, setRoles] = useState<Role[]>(data.roles);
  const [permissions, setPermissions] = useState<Permission[]>(data.permissions);

  return (
    <SettingsShell
      title="Roles & Permissions"
      description="Keep admin access structured, safe, and easy to manage. Create custom roles, build permission rules, and control which users can open sensitive dashboard modules."
    >
      <AccessControlOverview roles={roles} permissions={permissions} />

      <Tabs defaultValue="roles" className="space-y-5">
        <TabsList
          variant="default"
          className="rounded-2xl border border-[var(--brand-100)] bg-white p-1 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)]"
        >
          <TabsTrigger value="roles" className="rounded-xl px-4">
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="rounded-xl px-4">
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <RolesPanel
            roles={roles}
            permissions={permissions}
            onRolesChange={setRoles}
          />
        </TabsContent>

        <TabsContent value="permissions">
          <PermissionsPanel
            roles={roles}
            permissions={permissions}
            onPermissionsChange={setPermissions}
            onRolesChange={setRoles}
          />
        </TabsContent>
      </Tabs>
    </SettingsShell>
  );
}
