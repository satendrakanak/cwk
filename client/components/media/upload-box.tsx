"use client";

import { PreviewType } from "@/types/file";
import { UploadCloud } from "lucide-react";

interface UploadBoxProps {
  onUpload: (file: File) => void;
  previewType?: PreviewType;
}

export const UploadBox = ({
  onUpload,
  previewType = "image",
}: UploadBoxProps) => {
  const handleFile = (file: File) => {
    if (!file) return;
    onUpload(file);
  };

  const acceptType =
    previewType === "image"
      ? "image/*"
      : previewType === "video"
        ? "video/*"
        : "application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/csv, application/vnd.ms-excel";

  return (
    <div
      className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted transition"
      onClick={() => document.getElementById("fileInput")?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
      }}
    >
      <UploadCloud className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />

      <p className="text-xs font-medium">
        Click or drag {previewType} to upload
      </p>
      {previewType === "image" && (
        <p className="text-[10px] text-muted-foreground">PNG, JPG up to 2MB</p>
      )}
      {previewType === "video" && (
        <p className="text-[10px] text-muted-foreground">MP4 up to 1GB</p>
      )}
      {previewType === "file" && (
        <p className="text-[10px] text-muted-foreground">
          PDF, DOC, CSV up to 20MB
        </p>
      )}

      <input
        id="fileInput"
        type="file"
        accept={acceptType}
        hidden
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />
    </div>
  );
};
