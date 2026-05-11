"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { formatModuleName, formatPermissionName, getPermissionGroups } from "@/lib/access-control";
import { Permission } from "@/types/user";

export function PermissionsMatrix({
  permissions,
  selectedPermissionIds,
  onToggle,
}: {
  permissions: Permission[];
  selectedPermissionIds: number[];
  onToggle: (permissionId: number, checked: boolean) => void;
}) {
  const groups = getPermissionGroups(permissions);
  const selectedSet = new Set(selectedPermissionIds);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.module}
          className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/6"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatModuleName(group.module)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {group.permissions.length} permissions available
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {group.permissions.map((permission) => {
              const checked = selectedSet.has(permission.id);

              return (
                <label
                  key={permission.id}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white bg-white px-3 py-3 shadow-sm transition hover:border-[var(--brand-200)] dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] dark:hover:border-[var(--brand-400)]"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) =>
                      onToggle(permission.id, Boolean(value))
                    }
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatPermissionName(permission.name)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{permission.name}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
