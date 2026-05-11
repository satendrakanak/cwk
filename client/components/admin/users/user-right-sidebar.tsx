"use client";

import { Role, User } from "@/types/user";
import { UserAvatarImageForm } from "./user-avatar-image-form";
import { UserCoverImageForm } from "./user-cover-image-form";
import { UserRoleAssignForm } from "./user-role-assign-form";

interface UserRightSidebarProps {
  user: User;
}

export const UserRightSidebar = ({ user }: UserRightSidebarProps) => {
  return (
    <div className="sticky top-24 space-y-4">
      <UserAvatarImageForm user={user} />
      <UserCoverImageForm user={user} />
      <UserRoleAssignForm user={user} />
    </div>
  );
};
