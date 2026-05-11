"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileAvatarProps {
  avatar: string;
  name?: string;
  onChange?: (file: File) => void;
  progress?: number;
  uploading?: boolean;
}

function getInitials(name?: string) {
  if (!name) return "U";

  const parts = name.trim().split(" ").filter(Boolean);

  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase() || "U";
}

export function ProfileAvatar({
  avatar,
  name,
  onChange,
  progress = 0,
  uploading = false,
}: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(avatar);

  useEffect(() => {
    setPreview(avatar);
  }, [avatar]);

  const handleFileChange = (file?: File) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    onChange?.(file);
  };

  const normalizedProgress = Math.max(0, Math.min(100, progress));
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="group relative h-32 w-32 shrink-0 overflow-hidden rounded-full md:h-36 md:w-36">
      <div className="absolute -inset-1 rounded-full bg-linear-to-br from-primary/45 via-primary to-primary/70 opacity-90 blur-[2px]" />

      <Avatar className="relative h-32 w-32 border-[5px] border-card bg-muted shadow-[0_24px_50px_color-mix(in_oklab,var(--foreground)_22%,transparent)] md:h-36 md:w-36">
        <AvatarImage src={preview} alt={name || "Profile avatar"} />

        <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      {uploading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-foreground/65 backdrop-blur-sm">
          <svg className="h-28 w-28 -rotate-90 transform md:h-32 md:w-32">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-primary-foreground/20"
            />

            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="text-primary-foreground transition-all duration-200"
            />
          </svg>

          <span className="absolute flex items-center gap-1 text-sm font-semibold text-primary-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {normalizedProgress}%
          </span>
        </div>
      )}

      {!uploading && onChange && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-x-0 bottom-0 z-20 flex h-1/2 cursor-pointer items-center justify-center rounded-b-full bg-foreground/65 text-primary-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          title="Change avatar"
        >
          <Camera className="h-5 w-5" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={(event) => {
          handleFileChange(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>
  );
}
