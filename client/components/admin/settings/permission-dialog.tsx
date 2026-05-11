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
import {
  buildPermissionName,
  permissionActionPresets,
} from "./access-control-utils";
import { accessControlClientService } from "@/services/access-control/access-control.client";
import { getErrorMessage } from "@/lib/error-handler";
import { Permission } from "@/types/user";
import { parsePermissionName } from "@/lib/access-control";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PermissionDialog({
  open,
  onOpenChange,
  permission,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: Permission | null;
  onSaved: (permission: Permission, isEdit: boolean) => void;
}) {
  const [moduleName, setModuleName] = useState("");
  const [actionName, setActionName] = useState("view");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!permission) {
      setModuleName("");
      setActionName("view");
      return;
    }

    const parsed = parsePermissionName(permission.name);
    setModuleName(parsed.module);
    setActionName(parsed.action);
  }, [open, permission]);

  const title = useMemo(
    () => (permission ? "Edit permission" : "Create permission"),
    [permission],
  );

  const handleSubmit = async () => {
    const name = buildPermissionName(moduleName, actionName);

    if (!name) {
      toast.error("Module and action are required");
      return;
    }

    try {
      setIsSaving(true);

      const response = permission
        ? await accessControlClientService.updatePermission(permission.id, {
            name,
          })
        : await accessControlClientService.createPermission({ name });

      toast.success(permission ? "Permission updated" : "Permission created");
      onSaved(response.data, Boolean(permission));
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full border-l border-[var(--brand-100)] bg-white dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] sm:max-w-[560px]">
        <DrawerHeader className="border-b border-slate-100 px-6 py-5 text-left dark:border-white/10">
          <DrawerTitle className="text-2xl font-semibold text-slate-950 dark:text-white">
            {title}
          </DrawerTitle>
          <DrawerDescription className="text-sm text-slate-500 dark:text-slate-300">
            Create reusable permissions like view_users or update_articles.
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="h-[calc(100vh-146px)]">
          <div className="space-y-5 px-6 py-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Module</label>
              <Input
                value={moduleName}
                onChange={(event) => setModuleName(event.target.value)}
                placeholder="e.g. dashboard, course, article"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Action</label>
              <Input
                value={actionName}
                onChange={(event) => setActionName(event.target.value)}
                placeholder="e.g. view, create, update, delete"
              />
              <div className="flex flex-wrap gap-2">
                {permissionActionPresets.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => setActionName(action)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-[var(--brand-200)] hover:bg-[var(--brand-50)] dark:border-white/10 dark:bg-white/6 dark:text-slate-200 dark:hover:border-[var(--brand-400)] dark:hover:bg-white/10"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--brand-100)] bg-[var(--brand-50)]/50 px-4 py-3 dark:border-[var(--brand-500)]/25 dark:bg-[var(--brand-500)]/10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-700)] dark:text-[var(--brand-300)]">
                Preview
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {buildPermissionName(moduleName || "module", actionName || "view")}
              </p>
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
            {isSaving
              ? "Saving..."
              : permission
                ? "Update Permission"
                : "Create Permission"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
