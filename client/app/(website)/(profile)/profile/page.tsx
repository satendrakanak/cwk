import ProfileView from "@/components/profile/profile-view";
import { getSession } from "@/lib/auth";
import { userServerService } from "@/services/users/user.server";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.id) return null;

  const res = await userServerService.getMe();
  const user = res.data;

  return (
    <div>
      <ProfileView user={user} />
    </div>
  );
}
