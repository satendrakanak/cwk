"use client";

import Image from "next/image";
import { Image as ImageIcon, File, Video } from "lucide-react";
import { FileType, PreviewType } from "@/types/file";

interface FilePreviewProps {
  file?: FileType | string | null;
  previewType?: PreviewType;
  triggerText?: string;
  className?: string;
}

export const FilePreview = ({
  file,
  previewType = "image",
  triggerText = "Click to upload",
  className,
}: FilePreviewProps) => {
  if (!file) {
    return (
      <div className="text-xs text-muted-foreground text-center">
        {previewType === "image" && (
          <ImageIcon className="size-8 mx-auto mb-1" />
        )}
        {previewType === "video" && <Video className="size-8 mx-auto mb-1" />}
        {previewType === "file" && <File className="size-8 mx-auto mb-1" />}
        {triggerText}
      </div>
    );
  }

  const filePath = typeof file === "string" ? file : file.path;
  const fileName = typeof file === "string" ? "File" : file.name;

  if (previewType === "image") {
    return (
      <Image
        src={filePath}
        alt={fileName || "Featured Image"}
        fill
        className="object-cover w-full h-full"
        sizes="100vw"
        loading="eager"
      />
    );
  }

  if (previewType === "video") {
    return <video src={filePath} className="aspect-video w-full" controls />;
  }

  return (
    <div className="text-xs text-center">
      <File className="size-8 mx-auto mb-1" />
      {fileName}
    </div>
  );
};
