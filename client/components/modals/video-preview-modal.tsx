"use client";

import { createPortal } from "react-dom";
import { X, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface VideoPreviewModalProps {
  videoUrl: string | null;
  title?: string;
  onClose: () => void;
}

export default function VideoPreviewModal({
  videoUrl,
  title,
  onClose,
}: VideoPreviewModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!videoUrl) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoUrl, onClose]);

  if (!mounted || !videoUrl) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-99999 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="academy-card relative w-full max-w-4xl overflow-hidden p-0 shadow-[0_35px_120px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border bg-muted/60 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <PlayCircle className="h-4 w-4" />
            </span>

            <h3 className="truncate text-sm font-semibold text-card-foreground">
              {title || "Video Preview"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close video preview"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-black">
          <video
            src={videoUrl}
            controls
            controlsList="nodownload noplaybackrate"
            disablePictureInPicture
            onContextMenu={(event) => event.preventDefault()}
            autoPlay
            className="h-auto max-h-[72vh] w-full"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
