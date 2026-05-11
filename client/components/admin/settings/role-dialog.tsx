"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { accessControlClientService } from "@/services/access-control/access-control.client";
import { getErrorMessage } from "@/lib/error-handler";
import { Permission, Role } from "@/types/user";
import { PermissionsMatrix } from "./permissions-matrix";
import { Button } from "@/components/ui/button";

export function RoleDialog({
  open,
  onOpenChange,
  role,
  permissions,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  permissions: Permission[];
  onSaved: (role: Role, isEdit: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(role?.name ?? "");
    setSelectedPermissionIds((role?.permissions ?? []).map((item) => item.id));
  }, [open, role]);

  const title = useMemo(
    () => (role ? "Edit role" : "Create role"),
    [role],
  );

  const handleTogglePermission = (permissionId: number, checked: boolean) => {
    setSelectedPermissionIds((current) => {
      if (checked) {
        return [...new Set([...current, permissionId])];
      }

      return current.filter((id) => id !== permissionId);
    });
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("Role name is required");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name: trimmedName,
        permissionIds: selectedPermissionIds,
      };

      const response = role
        ? await accessControlClientService.updateRole(role.id, payload)
        : await accessControlClientService.createRole(payload);

      toast.success(role ? "Role updated" : "Role created");
      onSaved(response.data, Boolean(role));
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full border-l border-[var(--brand-100)] bg-white dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] sm:max-w-[820px]">
        <DrawerHeader className="border-b border-slate-100 px-6 py-5 text-left dark:border-white/10">
          <DrawerTitle className="text-2xl font-semibold text-slate-950 dark:text-white">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-sm text-slate-500 dark:text-slate-300">
            Define what this role can view, create, update, or delete.
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="h-[calc(100vh-146px)]">
          <div className="space-y-6 px-6 py-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Role name
              </label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. content_manager"
              />
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Permission matrix
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tick every action this role should be allowed to perform.
                </p>
              </div>
              <PermissionsMatrix
                permissions={permissions}
                selectedPermissionIds={selectedPermissionIds}
                onToggle={handleTogglePermission}
              />
            </div>
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t border-slate-100 bg-white px-6 py-4 dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : role ? "Update Role" : "Create Role"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
