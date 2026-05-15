type RoleLike = string | { name?: string | null } | null | undefined;

export function getRoleHomePath(roles: RoleLike[] = []) {
  const roleNames = roles.map((role) =>
    (typeof role === "string" ? role : role?.name || "").toLowerCase(),
  );

  if (roleNames.includes("super_admin") || roleNames.includes("admin")) {
    return "/admin/dashboard";
  }

  if (roleNames.includes("faculty")) {
    return "/faculty/dashboard";
  }

  return "/dashboard";
}

export function shouldUseRoleHomePath(callbackUrl: string | null | undefined) {
  return !callbackUrl || callbackUrl === "/dashboard";
}
