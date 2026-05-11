import { Role, User } from "@/types/user";

export function getUserRoleNames(user: User | null | undefined) {
  return (user?.roles ?? []).map((role) => role.name);
}

export function getUserPermissionNames(user: User | null | undefined) {
  const names = new Set<string>();

  for (const role of user?.roles ?? []) {
    for (const permission of role.permissions ?? []) {
      names.add(permission.name);
    }
  }

  return [...names];
}

export function hasRole(
  user: User | null | undefined,
  roleName: string,
): boolean {
  return getUserRoleNames(user).includes(roleName);
}

export function hasPermission(
  user: User | null | undefined,
  permissionName: string,
): boolean {
  return getUserPermissionNames(user).includes(permissionName);
}

export function hasAnyPermission(
  user: User | null | undefined,
  permissionNames: string[] = [],
): boolean {
  if (permissionNames.length === 0) {
    return true;
  }

  const assigned = new Set(getUserPermissionNames(user));
  return permissionNames.some((name) => assigned.has(name));
}

export function canAccessAdmin(user: User | null | undefined): boolean {
  return (
    hasRole(user, "admin") ||
    hasPermission(user, "view_dashboard") ||
    hasPermission(user, "manage_users") ||
    hasPermission(user, "edit_assigned_course")
  );
}

export function canAccessFaculty(user: User | null | undefined): boolean {
  return (
    hasRole(user, "admin") ||
    hasRole(user, "faculty") ||
    hasPermission(user, "view_faculty_workspace")
  );
}

export function canAssignExamFaculty(user: User | null | undefined): boolean {
  return hasRole(user, "admin") || hasPermission(user, "assign_exam_faculty");
}

export function isSystemRole(roleName: string) {
  return ["student", "faculty", "admin"].includes(roleName);
}

export function formatPermissionName(name: string) {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parsePermissionName(name: string) {
  const [action = "custom", ...rest] = name.split("_");
  const moduleName = rest.join("_") || action;

  return {
    action,
    module: moduleName,
  };
}

export function formatModuleName(moduleName: string) {
  return moduleName
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getPermissionGroups(permissions: { id: number; name: string }[]) {
  const groups = new Map<
    string,
    { module: string; permissions: { id: number; name: string }[] }
  >();

  for (const permission of permissions) {
    const { module } = parsePermissionName(permission.name);
    const current = groups.get(module) ?? { module, permissions: [] };
    current.permissions.push(permission);
    groups.set(module, current);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      permissions: group.permissions.sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }))
    .sort((a, b) => a.module.localeCompare(b.module));
}

export function roleHasPermission(role: Role, permissionId: number) {
  return (role.permissions ?? []).some((permission) => permission.id === permissionId);
}
