"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/error-handler";
import { userClientService } from "@/services/users/user.client";

interface ProfileCoverProps {
  coverImage?: string;
  isOwner?: boolean;
}

export function ProfileCover({ coverImage, isOwner }: ProfileCoverProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(coverImage);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);

    try {
      setIsUploading(true);
      setPreview(previewUrl);

      const initRes = await fetch("/api/uploads/init", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const json = await initRes.json();
      const { uploadId, url } = json.data;

      await axios.put(url, file, {
        headers: { "Content-Type": file.type },
      });

      const confirmRes = await fetch(`/api/uploads/confirm/${uploadId}`, {
        method: "POST",
        credentials: "include",
      });

      const confirmJson = await confirmRes.json();
      const newFile = confirmJson.data;

      await userClientService.updateUser({
        coverImageId: newFile.id,
      });

      toast.success("Cover picture updated");
    } catch (error: unknown) {
      setPreview(coverImage);
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="relative h-44 w-full overflow-hidden rounded-[26px] border border-border bg-muted shadow-[0_30px_90px_color-mix(in_oklab,var(--foreground)_14%,transparent)] md:h-72.5 md:rounded-[34px]">
      <Image
        src={preview || "/assets/default-cover.jpg"}
        alt="Profile cover"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center md:object-top"
      />

      <div className="absolute inset-0 bg-linear-to-br from-foreground/20 via-transparent to-primary/20 md:from-foreground/55 md:via-foreground/15 md:to-primary/30" />

      <div className="academy-grid-mask absolute inset-0 hidden opacity-20 md:block" />

      <div className="absolute inset-x-0 bottom-0 hidden bg-linear-to-t from-foreground/75 via-foreground/25 to-transparent p-5 md:block md:p-7">
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-xl text-primary-foreground">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-primary-foreground/80">
              Learner Space
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              Your learning dashboard
            </h2>

            <p className="mt-2 max-w-lg text-sm leading-6 text-primary-foreground/75 md:text-base">
              Track progress, revisit purchases, and keep your profile polished
              from one clean workspace.
            </p>
          </div>
        </div>
      </div>

      {isOwner && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          title="Change Cover"
          className="absolute right-4 top-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-primary-foreground/20 bg-foreground/45 text-primary-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70 md:h-11 md:w-11"
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        hidden
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            handleUpload(file);
          }

          event.target.value = "";
        }}
      />
    </div>
  );
}
