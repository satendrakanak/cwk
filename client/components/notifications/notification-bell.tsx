"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/context/session-context";
import { getErrorMessage } from "@/lib/error-handler";
import { notificationClientService } from "@/services/notifications/notification.client";
import type { AppNotification } from "@/types/notification";
import { formatDateTime } from "@/utils/formate-date";

type AudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let notificationAudioContext: AudioContext | null = null;

async function playNotificationTone() {
  if (typeof window === "undefined") return;

  const audioWindow = window as AudioWindow;
  const AudioContextCtor =
    audioWindow.AudioContext || audioWindow.webkitAudioContext;
  if (!AudioContextCtor) return;

  try {
    notificationAudioContext ??= new AudioContextCtor();
    const context = notificationAudioContext;

    if (context.state === "suspended") {
      await context.resume();
    }

    const now = context.currentTime;
    playToneNote(context, now, 587.33, 0.08, 0.045);
    playToneNote(context, now + 0.105, 783.99, 0.14, 0.035);
  } catch {
    // Browsers can block audio until the user interacts with the page.
  }
}

function playToneNote(
  context: AudioContext,
  startAt: number,
  frequency: number,
  duration: number,
  volume: number,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.025);
}

export function NotificationBell() {
  const { user } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const baseTitleRef = useRef<string | null>(null);
  const previousUnreadRef = useRef<number | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    void loadNotifications();
    const interval = window.setInterval(loadNotifications, 60_000);

    return () => window.clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!userId || typeof document === "undefined") return;

    if (
      previousUnreadRef.current !== null &&
      unreadCount > previousUnreadRef.current
    ) {
      void playNotificationTone();
    }

    previousUnreadRef.current = unreadCount;

    if (!baseTitleRef.current) {
      baseTitleRef.current = document.title.replace(/^\(\d+\+?\)\s+/, "");
    }

    document.title = unreadCount
      ? `(${unreadCount > 99 ? "99+" : unreadCount}) ${baseTitleRef.current}`
      : baseTitleRef.current;
  }, [unreadCount, userId]);

  useEffect(() => {
    return () => {
      if (baseTitleRef.current && typeof document !== "undefined") {
        document.title = baseTitleRef.current;
      }
    };
  }, []);

  if (!user) return null;

  async function loadNotifications() {
    try {
      setLoading(true);
      const [itemsRes, countRes] = await Promise.all([
        notificationClientService.getMine(10),
        notificationClientService.getUnreadCount(),
      ]);
      setNotifications(itemsRes.data);
      setUnreadCount(countRes.data.count);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenNotification(notification: AppNotification) {
    setDesktopOpen(false);

    try {
      await notificationClientService.markClicked(notification.id);
      const now = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                readAt: item.readAt ?? now,
                clickedAt: item.clickedAt ?? now,
              }
            : item,
        ),
      );
      if (!notification.readAt) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch {
      // Opening the link should not be blocked by click-state sync.
    }

    router.push(notification.href || "/notifications");
  }

  async function handleMarkAllRead() {
    try {
      setMarkingAll(true);
      await notificationClientService.markAllRead();
      const now = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => ({ ...item, readAt: item.readAt ?? now })),
      );
      setUnreadCount(0);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <DropdownMenu
      open={desktopOpen}
      onOpenChange={(open) => {
        setDesktopOpen(open);
        if (open) void loadNotifications();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open notifications"
          className="relative inline-flex h-10 w-10 appearance-none items-center justify-center border-0 bg-transparent p-0 text-webtertiary outline-none ring-0 transition hover:text-primary focus:border-0 focus:outline-none focus:ring-0 focus-visible:border-0 focus-visible:outline-none focus-visible:ring-0 aria-expanded:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary cursor-pointer"
        >
          <Bell className="h-6 w-6 stroke-[2.25]" />
          {unreadCount ? (
            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[min(390px,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-border bg-popover p-0 text-popover-foreground shadow-[0_24px_80px_color-mix(in_oklab,var(--foreground)_16%,transparent)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/35 px-4 py-3">
          <div>
            <p className="text-sm font-semibold leading-none">Notifications</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {unreadCount ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!unreadCount || markingAll}
            onClick={handleMarkAllRead}
            className="h-8 gap-1.5 rounded-full px-2.5 text-xs"
          >
            {markingAll ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCheck className="size-3.5" />
            )}
            Read all
          </Button>
        </div>

        <div className="max-h-105 overflow-y-auto p-2">
          {loading && !notifications.length ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading notifications
            </div>
          ) : notifications.length ? (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} asChild>
                <Link
                  href={notification.href || "/notifications"}
                  onClick={(event) => {
                    event.preventDefault();
                    void handleOpenNotification(notification);
                  }}
                  className="flex cursor-pointer items-start gap-3 rounded-xl px-2.5 py-2.5 focus:bg-primary/10"
                >
                  <span className="relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bell className="size-4" />
                    {!notification.readAt ? (
                      <span className="absolute right-1 top-1 size-2 rounded-full bg-red-500 ring-2 ring-popover" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold leading-5">
                      {notification.title}
                    </span>
                    {notification.imageUrl ? (
                      <span className="mt-2 block overflow-hidden rounded-xl border border-border">
                        <img
                          src={notification.imageUrl}
                          alt=""
                          className="h-20 w-full object-cover"
                          loading="lazy"
                        />
                      </span>
                    ) : null}
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                      {notification.message}
                    </span>
                    <span className="mt-1.5 block text-[11px] font-medium text-muted-foreground">
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </span>
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bell className="size-5" />
              </div>
              <p className="mt-3 text-sm font-semibold">No notifications yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Course, class, exam, and account updates will appear here.
              </p>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />
        <Link
          href="/notifications"
          onClick={() => setDesktopOpen(false)}
          className="block px-4 py-3 text-center text-xs font-semibold text-primary hover:bg-primary/5"
        >
          View all notifications
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NotificationNavIcon({
  className,
  active,
}: {
  className?: string;
  active?: boolean;
}) {
  const { user } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const loadCount = async () => {
      try {
        const response = await notificationClientService.getUnreadCount();
        setUnreadCount(response.data.count);
      } catch {
        setUnreadCount(0);
      }
    };

    void loadCount();
    const interval = window.setInterval(loadCount, 60_000);

    return () => window.clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!open || !userId) return;

    void loadMobileNotifications();
  }, [open, userId]);

  async function loadMobileNotifications() {
    try {
      setLoading(true);
      const [itemsRes, countRes] = await Promise.all([
        notificationClientService.getMine(20),
        notificationClientService.getUnreadCount(),
      ]);
      setNotifications(itemsRes.data);
      setUnreadCount(countRes.data.count);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }

  async function handleMobileNotification(notification: AppNotification) {
    try {
      await notificationClientService.markClicked(notification.id);
      const now = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                readAt: item.readAt ?? now,
                clickedAt: item.clickedAt ?? now,
              }
            : item,
        ),
      );
      if (!notification.readAt) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch {
      // Navigation should still work if click-state sync fails.
    }

    setOpen(false);

    router.push(notification.href || "/notifications");
  }

  async function handleMobileMarkAllRead() {
    try {
      setMarkingAll(true);
      await notificationClientService.markAllRead();
      const now = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => ({ ...item, readAt: item.readAt ?? now })),
      );
      setUnreadCount(0);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setMarkingAll(false);
    }
  }

  const triggerContent = (
    <>
      <span className="relative">
        <Bell className="size-5" />
        {unreadCount ? (
          <span className="absolute -right-2.5 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </span>
      {active ? (
        <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-primary" />
      ) : null}
    </>
  );

  if (!user) {
    return (
      <Link
        href="/auth/sign-in"
        aria-label="Notifications"
        className={className}
      >
        {triggerContent}
      </Link>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label="Open notifications"
          className={className}
        >
          {triggerContent}
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[86vh] overflow-hidden rounded-t-[28px] border-border bg-background pb-[env(safe-area-inset-bottom)]">
        <DrawerHeader className="px-5 pb-3 text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="text-xl font-semibold">
                Notifications
              </DrawerTitle>
              <DrawerDescription className="mt-1">
                {unreadCount
                  ? `${unreadCount} unread updates`
                  : "All caught up"}
              </DrawerDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!unreadCount || markingAll}
              onClick={handleMobileMarkAllRead}
              className="h-8 shrink-0 gap-1.5 rounded-full px-3 text-xs"
            >
              {markingAll ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCheck className="size-3.5" />
              )}
              Read all
            </Button>
          </div>
        </DrawerHeader>

        <div className="max-h-[62vh] overflow-y-auto border-t border-border">
          {loading && !notifications.length ? (
            <div className="flex items-center justify-center px-5 py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 size-4 animate-spin" />
              Loading updates
            </div>
          ) : notifications.length ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleMobileNotification(notification)}
                  className="flex w-full touch-manipulation items-start gap-3 px-5 py-4 text-left transition-colors active:bg-muted/70"
                >
                  <span className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Bell className="size-4" />
                    {!notification.readAt ? (
                      <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-background" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {notification.title}
                      </span>
                      {!notification.readAt ? (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          New
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                      {notification.message}
                    </span>
                    {notification.imageUrl ? (
                      <span className="mt-3 block overflow-hidden rounded-2xl border border-border">
                        <img
                          src={notification.imageUrl}
                          alt=""
                          className="h-28 w-full object-cover"
                          loading="lazy"
                        />
                      </span>
                    ) : null}
                    <span className="mt-2 block text-[11px] font-medium text-muted-foreground">
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-8 py-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <Bell className="size-6" />
              </div>
              <p className="mt-4 text-base font-semibold">No updates yet</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Live classes, exams, orders, and certificates will appear here.
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <Button
            asChild
            variant="outline"
            className="h-10 w-full rounded-full"
          >
            <Link href="/notifications" onClick={() => setOpen(false)}>
              Notification settings
            </Link>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
