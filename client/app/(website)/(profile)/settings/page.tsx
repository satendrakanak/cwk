import SettingsView from "@/components/profile/settings/settings-view";
import { getSession } from "@/lib/auth";
import { userServerService } from "@/services/users/user.server";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.id) return null;

  const res = await userServerService.getMe();
  const user = res.data;

  return (
    <div>
      <SettingsView user={user} />
    </div>
  );
}
