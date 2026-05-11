"use client";

import { useState } from "react";
import { courseClientService } from "@/services/courses/course.client";
import { Course } from "@/types/course";
import { FileType } from "@/types/file";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/media/file-upload";
import { getErrorMessage } from "@/lib/error-handler";

interface FeaturedVideoFormProps {
  course: Course;
}
export const FeaturedVideoForm = ({ course }: FeaturedVideoFormProps) => {
  const [selectedVideo, setSelectedVideo] = useState<FileType | null>(null);
  const router = useRouter();
  const handleVideoUpload = async (file: FileType) => {
    try {
      await courseClientService.update(course.id, {
        videoId: file.id,
      });

      setSelectedVideo(file);
      toast.success("Video Updated");
      router.refresh();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <FileUpload
        label="Featured Video"
        previewType="video"
        value={selectedVideo || course.video}
        onUpload={handleVideoUpload}
        className="aspect-square h-40"
      />
    </div>
  );
};
