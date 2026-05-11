"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emitChange();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    emitChange();
  });
}

export function usePwaInstall() {
  const isClient = useHydratedClient();
  const [isInstalled, setIsInstalled] = useState(false);

  const installPrompt = useSyncExternalStore(
    subscribePrompt,
    getPromptSnapshot,
    () => null,
  );

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");

    const updateInstalledState = () => {
      setIsInstalled(media.matches || window.navigator.standalone === true);
    };

    updateInstalledState();
    media.addEventListener("change", updateInstalledState);
    window.addEventListener("appinstalled", updateInstalledState);

    return () => {
      media.removeEventListener("change", updateInstalledState);
      window.removeEventListener("appinstalled", updateInstalledState);
    };
  }, []);

  const isIos = isClient
    ? /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    : false;

  const isMobile = isClient
    ? window.matchMedia("(max-width: 767px)").matches
    : false;

  async function promptInstall() {
    if (!deferredPrompt) {
      return "unavailable" as const;
    }

    const prompt = deferredPrompt;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    deferredPrompt = null;
    emitChange();

    return choice.outcome;
  }

  return {
    canInstall: Boolean(installPrompt) && !isInstalled,
    isInstalled,
    isIos,
    isMobile,
    promptInstall,
  };
}

function getPromptSnapshot() {
  return deferredPrompt;
}

function subscribePrompt(callback: () => void) {
  listeners.add(callback);

  return () => listeners.delete(callback);
}

function subscribeHydration(callback: () => void) {
  const timeout = window.setTimeout(callback, 0);

  return () => window.clearTimeout(timeout);
}

function useHydratedClient() {
  return useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
}

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}
