"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit3, KeyRound, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteDialog } from "@/components/modals/confirm-dialog";
import { accessControlClientService } from "@/services/access-control/access-control.client";
import { getErrorMessage } from "@/lib/error-handler";
import { formatModuleName, parsePermissionName } from "@/lib/access-control";
import { Permission, Role } from "@/types/user";
import { PermissionDialog } from "./permission-dialog";
import { getActionLabel, getPermissionUsage } from "./access-control-utils";

export function PermissionsPanel({
  roles,
  permissions,
  onPermissionsChange,
  onRolesChange,
}: {
  roles: Role[];
  permissions: Permission[];
  onPermissionsChange: (permissions: Permission[]) => void;
  onRolesChange: (roles: Role[]) => void;
}) {
  const router = useRouter();
  const [editorOpen, setEditorOpen] = useState(false);
  const [activePermission, setActivePermission] = useState<Permission | null>(null);
  const [deletePermission, setDeletePermission] = useState<Permission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedPermissions = useMemo(
    () => [...permissions].sort((a, b) => a.name.localeCompare(b.name)),
    [permissions],
  );

  const handleSaved = (savedPermission: Permission, isEdit: boolean) => {
    if (isEdit) {
      onPermissionsChange(
        permissions.map((permission) =>
          permission.id === savedPermission.id ? savedPermission : permission,
        ),
      );
      onRolesChange(
        roles.map((role) => ({
          ...role,
          permissions: (role.permissions ?? []).map((permission) =>
            permission.id === savedPermission.id ? savedPermission : permission,
          ),
        })),
      );
      return;
    }

    onPermissionsChange([...permissions, savedPermission]);
  };

  const handleDelete = async () => {
    if (!deletePermission) {
      return;
    }

    try {
      setIsDeleting(true);
      await accessControlClientService.deletePermission(deletePermission.id);
      toast.success("Permission deleted");
      onPermissionsChange(
        permissions.filter((permission) => permission.id !== deletePermission.id),
      );
      onRolesChange(
        roles.map((role) => ({
          ...role,
          permissions: (role.permissions ?? []).filter(
            (permission) => permission.id !== deletePermission.id,
          ),
        })),
      );
      setDeletePermission(null);
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="border border-[var(--brand-100)] bg-white shadow-[0_20px_60px_-42px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-100 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-950 dark:text-white">
              Permission Library
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
              Build reusable access rules, then mix them into roles from one place.
            </p>
          </div>
          <Button
            onClick={() => {
              setActivePermission(null);
              setEditorOpen(true);
            }}
          >
            <KeyRound className="size-4" />
            Add Permission
          </Button>
        </CardHeader>

        <CardContent className="grid gap-4 pt-5 xl:grid-cols-2">
          {sortedPermissions.map((permission) => {
            const parsed = parsePermissionName(permission.name);
            const usage = getPermissionUsage(permission, roles);

            return (
              <div
                key={permission.id}
                className="rounded-[24px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.26)] dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] dark:[background-image:none]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                        {permission.name}
                      </h3>
                      <Badge variant="outline" className="dark:border-white/10 dark:bg-white/8 dark:text-slate-200">{usage} roles</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
                      {getActionLabel(permission.name)} access for{" "}
                      {formatModuleName(parsed.module)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:hover:bg-white/10"
                      onClick={() => {
                        setActivePermission(permission);
                        setEditorOpen(true);
                      }}
                    >
                      <Edit3 className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="dark:bg-rose-500/12 dark:text-rose-200 dark:hover:bg-rose-500/20"
                      onClick={() => setDeletePermission(permission)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <PermissionDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        permission={activePermission}
        onSaved={handleSaved}
      />

      <ConfirmDeleteDialog
        deleteText="permission"
        open={Boolean(deletePermission)}
        onClose={() => setDeletePermission(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
    </>
  );
}
