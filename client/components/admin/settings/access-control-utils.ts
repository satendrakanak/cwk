import {
  formatModuleName,
  formatPermissionName,
  getPermissionGroups,
  parsePermissionName,
} from "@/lib/access-control";
import { Permission, Role } from "@/types/user";

export const permissionActionPresets = ["view", "create", "update", "delete"];

export function buildPermissionName(moduleName: string, actionName: string) {
  const cleanedModule = moduleName.trim().toLowerCase().replace(/\s+/g, "_");
  const cleanedAction = actionName.trim().toLowerCase().replace(/\s+/g, "_");

  if (!cleanedModule || !cleanedAction) {
    return "";
  }

  return `${cleanedAction}_${cleanedModule}`;
}

export function summarizeRoleModules(role: Role) {
  const grouped = getPermissionGroups(role.permissions ?? []);
  return grouped.map((group) => ({
    module: formatModuleName(group.module),
    total: group.permissions.length,
  }));
}

export function getPermissionUsage(permission: Permission, roles: Role[]) {
  return roles.filter((role) =>
    (role.permissions ?? []).some((item) => item.id === permission.id),
  ).length;
}

export function getActionLabel(permissionName: string) {
  return formatPermissionName(parsePermissionName(permissionName).action);
}
