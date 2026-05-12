"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { UserRound } from "lucide-react";
import { toast } from "sonner";

import { DashboardStats, User } from "@/types/user";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileInfo } from "./profile-info";
import { userClientService } from "@/services/users/user.client";
import { FileType, UploadingFile } from "@/types/file";
import { ApiResponse } from "@/types/api";
import { getErrorMessage } from "@/lib/error-handler";

interface ProfileHeaderProps {
  user: User;
  stats: DashboardStats;
  isOwner: boolean;
}

export function ProfileHeader({ user, stats, isOwner }: ProfileHeaderProps) {
  const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(
    null,
  );

  const router = useRouter();

  const handleAvatarUpload = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);

    try {
      setUploadingFile({
        file,
        preview: previewUrl,
        uploading: true,
        progress: 0,
      });

      const initRes = await fetch("/api/uploads/init", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await initRes.json();
      const { uploadId, url } = json.data;

      await axios.put(url, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );

          setUploadingFile((prev) =>
            prev ? { ...prev, progress: percent } : prev,
          );
        },
      });

      const confirmRes = await fetch(`/api/uploads/confirm/${uploadId}`, {
        method: "POST",
        credentials: "include",
      });

      const confirmJson: ApiResponse<FileType> = await confirmRes.json();
      const newMedia = confirmJson.data;

      await userClientService.updateUser({
        avatarId: newMedia.id,
      });

      router.refresh();
      toast.success("Avatar updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploadingFile(null);
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="-mt-14 rounded-3xl border border-border bg-card/90 p-5 shadow-[0_30px_90px_color-mix(in_oklab,var(--foreground)_12%,transparent)] backdrop-blur-xl md:-mt-20 md:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-end">
          <ProfileAvatar
            avatar={user.avatar?.path || user.avatarUrl!}
            name={`${user.firstName} ${user.lastName || ""}`.trim()}
            onChange={isOwner ? handleAvatarUpload : undefined}
            uploading={!!uploadingFile}
            progress={uploadingFile?.progress || 0}
          />

          <ProfileInfo
            name={`${user.firstName} ${user.lastName || ""}`.trim()}
            email={user.email}
            stats={stats}
          />
        </div>

        <div className="flex w-full justify-start lg:w-auto lg:justify-end">
          <ProfileMiniCard
            icon={UserRound}
            label="Username"
            value={`@${user.username || "user"}`}
          />
        </div>
      </div>
    </div>
  );
}

function ProfileMiniCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
}) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-3 shadow-sm sm:w-auto sm:min-w-60">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold leading-none text-card-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
