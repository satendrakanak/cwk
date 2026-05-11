"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { IoMdPlayCircle } from "react-icons/io";

import VideoPreviewModal from "@/components/modals/video-preview-modal";
import { cn } from "@/lib/utils";

interface VideoPlayIconProps {
  isFree?: boolean;
  videoUrl: string | null;
  title?: string;
  className?: string;
}

const VideoPlayIcon = ({
  isFree,
  videoUrl,
  title,
  className,
}: VideoPlayIconProps) => {
  const [showModal, setShowModal] = useState(false);

  const canPreview = Boolean(isFree && videoUrl);

  const handleClick = () => {
    if (canPreview) {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={!canPreview}
        aria-label={canPreview ? "Play preview video" : "Preview locked"}
        className={cn(
          "group relative flex items-center justify-center rounded-full transition",
          canPreview ? "cursor-pointer" : "cursor-not-allowed",
        )}
      >
        {canPreview ? (
          <>
            <span className="absolute h-20 w-20 rounded-full border-2 border-primary-foreground/70 bg-primary-foreground/10 animate-ping" />

            <IoMdPlayCircle
              className={cn(
                "relative z-10 h-20 w-20 text-primary-foreground drop-shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition-transform group-hover:scale-110",
                className,
              )}
            />
          </>
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary-foreground/20 bg-foreground/60 text-primary-foreground shadow-lg backdrop-blur-md">
            <Lock className="h-6 w-6" />
          </span>
        )}
      </button>

      <VideoPreviewModal
        videoUrl={showModal ? videoUrl : null}
        title={title}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default VideoPlayIcon;
