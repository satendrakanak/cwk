import { Permission, Role } from "./user";

export type AccessControlDashboardData = {
  roles: Role[];
  permissions: Permission[];
};

export type CreateRolePayload = {
  name: string;
  permissionIds: number[];
};

export type UpdateRolePayload = Partial<CreateRolePayload>;

export type CreatePermissionPayload = {
  name: string;
};

export type UpdatePermissionPayload = Partial<CreatePermissionPayload>;
