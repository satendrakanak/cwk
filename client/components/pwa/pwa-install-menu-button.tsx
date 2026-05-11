"use client";

import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "./use-pwa-install";

export function PwaInstallMenuButton() {
  const { isInstalled, isIos, promptInstall } = usePwaInstall();

  if (isInstalled) return null;

  async function handleInstall() {
    const outcome = await promptInstall();

    if (outcome === "accepted") {
      toast.success("App install started");
      return;
    }

    toast.info(
      isIos
        ? "Tap Share, then Add to Home Screen."
        : "Open browser menu and choose Install app.",
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleInstall}
      className="h-11 w-full rounded-full"
    >
      {isIos ? <Share2 className="size-4" /> : <Download className="size-4" />}
      Download app
    </Button>
  );
}
