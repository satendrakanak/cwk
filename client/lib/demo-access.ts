import { hasRole } from "@/lib/access-control";
import type { User } from "@/types/user";

export const DEMO_CONFIGURATION_LOCK_MESSAGE =
  "Demo users cannot change these settings. Purchase KASA to unlock configuration changes.";

export function isDemoUser(user: User | null | undefined) {
  return Boolean(user?.isDemo) || hasRole(user, "demo_admin");
}
