import { NotificationsView } from "@/components/profile/notifications-view";
import { getSession } from "@/lib/auth";
import { notificationServerService } from "@/services/notifications/notification.server";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) return null;

  const notifications = await notificationServerService
    .getMine(50)
    .catch(() => []);

  return <NotificationsView notifications={notifications} />;
}
