"use client";

import { Download, Share2, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "./use-pwa-install";

export function PwaInstallCard() {
  const { canInstall, isInstalled, isIos, promptInstall } = usePwaInstall();

  async function handleInstall() {
    const outcome = await promptInstall();

    if (outcome === "accepted") {
      toast.success("App install started");
    } else if (outcome === "unavailable") {
      toast.info("Use the browser menu and choose Add to Home Screen.");
    }
  }

  if (isInstalled) {
    return null;
  }

  return (
    <section className="academy-card p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Smartphone className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Install mobile app</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Add this academy app to your phone before enabling push
              notifications.
            </p>
            {isIos ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Share2 className="size-3.5" />
                On iPhone, tap Share and choose Add to Home Screen.
              </p>
            ) : !canInstall ? (
              <p className="mt-2 text-xs text-muted-foreground">
                If the install button is hidden, open the browser menu and
                choose Install app or Add to Home screen.
              </p>
            ) : null}
          </div>
        </div>

        <Button
          type="button"
          onClick={handleInstall}
          className="shrink-0"
        >
          <Download className="size-4" />
          Install app
        </Button>
      </div>
    </section>
  );
}
