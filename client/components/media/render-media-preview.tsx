import { File } from "lucide-react";
import { FileType } from "@/types/file";
import Image from "next/image";

export const renderMediaPreview = (file: FileType) => {
  if (file.type === "image") {
    return (
      <Image
        src={file.path}
        alt={file.name}
        className="w-full h-full object-cover"
        fill
        sizes="100vw"
        loading="eager"
      />
    );
  }

  if (file.type === "video") {
    return (
      <video src={file.path} className="w-full h-full object-cover" muted />
    );
  }

  // file (pdf, doc, csv)
  return (
    <div className="flex flex-col items-center justify-center h-full text-xs text-muted-foreground">
      <File className="h-6 w-6 mb-1" />
      <span className="truncate px-1">{file.name}</span>
    </div>
  );
};
