import { PreviewType } from "@/types/file";
import { FileText, FileCode, FileImage, FileVideo } from "lucide-react";

export const getFileType = (mime: string): PreviewType => {
  if (mime.startsWith("image")) return "image";
  if (mime.startsWith("video")) return "video";
  return "file";
};

export const getAltFromFileName = (name: string) => {
  return name.replace(/\.[^/.]+$/, ""); // 🔥 remove extension
};

export const getFileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();

  if (!ext) return FileText;

  if (["pdf", "doc", "docx"].includes(ext)) return FileText;
  if (["js", "ts", "json", "html", "css"].includes(ext)) return FileCode;
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return FileImage;
  if (["mp4", "mov"].includes(ext)) return FileVideo;

  return FileText;
};
