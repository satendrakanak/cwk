"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Circle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-handler";
import { notificationClientService } from "@/services/notifications/notification.client";
import type { AppNotification } from "@/types/notification";
import { formatDateTime } from "@/utils/formate-date";

export function NotificationsView({
  notifications: initialNotifications,
}: {
  notifications: AppNotification[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((item) => !item.readAt).length;

  async function markAllRead() {
    try {
      await notificationClientService.markAllRead();
      const now = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => ({ ...item, readAt: item.readAt ?? now })),
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  }

  async function openNotification(notification: AppNotification) {
    try {
      await notificationClientService.markClicked(notification.id);
      const now = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, readAt: item.readAt ?? now, clickedAt: item.clickedAt ?? now }
            : item,
        ),
      );
    } catch {
      // The destination link should remain usable if click-state sync fails.
    } finally {
      router.push(notification.href || "/notifications");
    }
  }

  return (
    <div className="space-y-6">
      <section className="academy-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Notification Center
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Your updates
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Live classes, exams, certificates, orders, and account updates
              appear here.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={!unreadCount}
            onClick={markAllRead}
          >
            <CheckCheck className="size-4" />
            Mark all read
          </Button>
        </div>

        {notifications.length ? (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.href || "#"}
                onClick={(event) => {
                  event.preventDefault();
                  void openNotification(notification);
                }}
                className="flex gap-4 p-5 transition hover:bg-muted/40"
              >
                <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Circle
                    className={[
                      "size-3.5",
                      notification.readAt ? "fill-transparent" : "fill-current",
                    ].join(" ")}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{notification.title}</span>
                    {!notification.readAt ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                        New
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {notification.message}
                  </span>
                  <span className="mt-2 block text-xs text-muted-foreground">
                    {formatDateTime(notification.createdAt)}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bell className="size-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No notifications yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Important learning updates will appear here when activity starts.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
