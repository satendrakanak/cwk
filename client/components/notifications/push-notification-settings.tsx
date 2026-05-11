"use client";

import { useEffect, useState } from "react";
import { BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error-handler";
import { notificationClientService } from "@/services/notifications/notification.client";
import { usePwaInstall } from "@/components/pwa/use-pwa-install";

export function PushNotificationSettings() {
  const { isInstalled, isIos } = usePwaInstall();
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [supportChecked, setSupportChecked] = useState(false);

  const statusText = !supportChecked
    ? "Checking device support..."
    : !supported
    ? isIos && !isInstalled
      ? "Install the app first on iPhone, then open it from Home Screen."
      : "This browser does not support web push notifications."
    : !isEnabled
      ? "Push keys are not configured by admin yet."
      : subscribed
        ? "Enabled"
        : `Permission ${permission}`;

  useEffect(() => {
    const hasSupport =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setSupported(hasSupport);
    setSupportChecked(true);

    if (!hasSupport) return;

    setPermission(Notification.permission);
    void loadState();
  }, []);

  async function loadState() {
    const keyResponse = await notificationClientService
      .getPushPublicKey()
      .catch(() => null);

    setIsEnabled(Boolean(keyResponse?.data.isEnabled));

    const registration = await navigator.serviceWorker.ready.catch(() => null);
    const currentSubscription =
      (await registration?.pushManager.getSubscription()) ?? null;

    setSubscribed(Boolean(currentSubscription));
  }

  async function handleEnable() {
    try {
      setIsSaving(true);

      if (!supported) {
        toast.error("Push notifications are not supported in this browser.");
        return;
      }

      const keyResponse = await notificationClientService.getPushPublicKey();
      if (!keyResponse.data.isEnabled || !keyResponse.data.publicKey) {
        toast.error("Push notifications are not configured yet.");
        return;
      }

      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        toast.error("Notification permission was not granted.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyResponse.data.publicKey),
      });
      const json = subscription.toJSON();

      await notificationClientService.savePushSubscription({
        endpoint: subscription.endpoint,
        p256dh: json.keys?.p256dh || "",
        auth: json.keys?.auth || "",
        userAgent: navigator.userAgent,
      });

      setSubscribed(true);
      toast.success("Push notifications enabled");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDisable() {
    try {
      setIsSaving(true);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await notificationClientService.deletePushSubscription(
          subscription.endpoint,
        );
        await subscription.unsubscribe();
      }

      setSubscribed(false);
      toast.success("Push notifications disabled");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendTestPush() {
    try {
      setIsTesting(true);
      const response = await notificationClientService.sendTestPush();

      if (response.data.sent > 0) {
        toast.success("Test push sent. Check your phone notification tray.");
        return;
      }

      toast.error(
        response.data.error ||
          (response.data.subscriptionCount
          ? "Push provider rejected the saved subscription. Check server logs."
            : "No active push subscription found for this device."),
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <section className="academy-card p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BellRing className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Push notifications</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Get class reminders and important updates even when the dashboard
              is not open.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Status: {statusText}
            </p>
          </div>
        </div>

        {subscribed ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              disabled={isTesting}
              onClick={handleSendTestPush}
            >
              {isTesting ? <Loader2 className="size-4 animate-spin" /> : null}
              Send test push
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSaving}
              onClick={handleDisable}
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              Disable push
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            disabled={!supported || !isEnabled || isSaving}
            onClick={handleEnable}
          >
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
            Enable push
          </Button>
        )}
      </div>
    </section>
  );
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
}
