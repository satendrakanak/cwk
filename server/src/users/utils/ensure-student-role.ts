import { Role } from 'src/roles-permissions/role.entity';

export const ensureStudentRole = (roles: Role[], studentRole: Role) => {
  const hasStudent = roles.some((role) => role.name === 'student');
  return hasStudent ? roles : [studentRole, ...roles];
};
