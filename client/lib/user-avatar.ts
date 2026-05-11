import { User } from "@/types/user";

type AvatarLikeUser = Partial<Omit<User, "avatar">> & {
  avatar?: { path?: string | null; url?: string | null } | string | null;
};

export function getUserAvatarUrl(user?: AvatarLikeUser | null) {
  if (!user) return undefined;
  if (typeof user.avatar === "string") return user.avatar;

  return user.avatar?.url || user.avatar?.path || user?.avatarUrl || undefined;
}

export function getUserDisplayName(user?: AvatarLikeUser | null) {
  return `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
}
