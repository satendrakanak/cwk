"use client";

import { FileType, PreviewType, UploadingFile } from "@/types/file";
import {
  UploadCloud,
  Loader,
  Images,
  Loader2,
  File,
  Video,
} from "lucide-react";
import { renderMediaPreview } from "./render-media-preview";
import Image from "next/image";

interface MediaGridProps {
  media: FileType[];
  selected: FileType | null;
  onSelect: (file: FileType) => void;
  uploadingFile: UploadingFile | null;
  startUpload: () => void;
  loading?: boolean;
  previewType?: PreviewType;
}

export const MediaGrid = ({
  media,
  selected,
  onSelect,
  uploadingFile,
  startUpload,
  loading = false,
  previewType = "image",
}: MediaGridProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-75">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 🔥 2. Empty state
  if (!media.length && !uploadingFile) {
    return (
      <div className="flex items-center justify-center h-75">
        <div className="border border-dashed rounded-xl p-8 text-center max-w-xs w-full bg-muted/30">
          {previewType === "image" ? (
            <Images className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          ) : previewType === "video" ? (
            <Video className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          ) : (
            <File className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          )}
          <p className="text-sm font-medium">No media uploaded yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload your first file to get started
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-3">
      {/* 🔥 Upload Preview Card */}
      {uploadingFile && (
        <div className="aspect-square rounded-xl border relative overflow-hidden group">
          {previewType === "image" ? (
            <Image
              src={uploadingFile.preview}
              alt="Uploaded Image"
              className="w-full h-full object-cover opacity-80"
              fill
              sizes="100vw"
              loading="eager"
            />
          ) : previewType === "video" ? (
            <video
              src={uploadingFile.preview}
              className="w-full h-full object-cover opacity-80"
              muted
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <File className="h-6 w-6" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            {!uploadingFile.uploading ? (
              <button
                onClick={startUpload}
                className="flex flex-col items-center gap-1 text-white text-xs bg-black/60 px-3 py-2 rounded-lg hover:bg-black/80 transition cursor-pointer"
              >
                <UploadCloud className="h-5 w-5" />
                <span>Upload</span>
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2 text-white">
                {/* 🔥 Circular Loader */}
                <div className="relative h-10 w-10">
                  <Loader2 className="animate-spin h-10 w-10" />

                  {/* % center me */}
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">
                    {uploadingFile.progress}%
                  </span>
                </div>

                <span className="text-[10px] opacity-80">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🔥 Existing Media */}
      {media.map((item) => {
        return (
          <div
            key={item.path}
            onClick={() => onSelect(item)}
            className={`aspect-square rounded-xl overflow-hidden cursor-pointer border group relative ${
              selected?.id === item.id
                ? "ring-2 ring-primary"
                : "hover:ring-1 hover:ring-gray-300"
            }`}
          >
            {renderMediaPreview(item)}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
          </div>
        );
      })}
    </div>
  );
};
