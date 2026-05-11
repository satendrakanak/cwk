"use client";

import { useEffect, useState } from "react";
import { Download, Share2, Smartphone, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "./use-pwa-install";

const NUDGE_STORAGE_KEY = "codewithkasa-pwa-install-nudge-seen";

export function PwaInstallNudge() {
  const { isInstalled, isIos, isMobile, promptInstall } = usePwaInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isMobile || isInstalled) return;

    const alreadySeen = window.localStorage.getItem(NUDGE_STORAGE_KEY);
    if (alreadySeen) return;

    const timeout = window.setTimeout(() => {
      setVisible(true);
      window.localStorage.setItem(NUDGE_STORAGE_KEY, "true");
    }, 3500);

    return () => window.clearTimeout(timeout);
  }, [isInstalled, isMobile]);

  async function handleInstall() {
    const outcome = await promptInstall();

    if (outcome === "accepted") {
      toast.success("App install started");
      setVisible(false);
      return;
    }

    if (outcome === "unavailable") {
      toast.info(
        isIos
          ? "Tap Share, then Add to Home Screen."
          : "Open browser menu and choose Install app.",
      );
    }
  }

  if (!visible || isInstalled) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-[60] md:hidden">
      <div className="relative mx-auto max-w-sm rounded-3xl border border-border bg-background p-4 shadow-[0_24px_80px_color-mix(in_oklab,var(--foreground)_22%,transparent)]">
        <button
          type="button"
          aria-label="Close install prompt"
          onClick={() => setVisible(false)}
          className="absolute right-6 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        <div className="flex gap-3 pr-8">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Smartphone className="size-5" />
          </span>
          <div>
            <p className="text-base font-semibold">Download app</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Open classes, exams, certificates, and updates faster from your
              home screen.
            </p>
          </div>
        </div>

        {isIos ? (
          <p className="mt-3 flex items-start gap-2 rounded-2xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
            <Share2 className="mt-0.5 size-3.5 shrink-0" />
            On iPhone, tap Share in Safari and choose Add to Home Screen.
          </p>
        ) : null}

        <Button
          type="button"
          onClick={handleInstall}
          className="mt-4 h-11 w-full rounded-full"
        >
          <Download className="size-4" />
          {isIos ? "Show install steps" : "Download app"}
        </Button>
      </div>
    </div>
  );
}
