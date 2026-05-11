"use client";

import { useRef, useEffect } from "react";
import { Lecture } from "@/types/lecture";
import { userProgressClientService } from "@/services/user-progress/user-progress.client";
import { getStartTime, shouldMarkComplete } from "@/helpers/video-player";

interface Props {
  lecture: Lecture;
  onNext: () => void;
  onProgressUpdate: (
    lectureId: number,
    progress: number,
    lastTime: number,
    alreadyCompleted?: boolean,
  ) => void;
}

export const VideoPlayer = ({ lecture, onNext, onProgressUpdate }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasVideo = !!lecture?.video?.path;
  const firstAttachment = lecture?.attachments?.[0];

  /**
   * 🎯 RESUME / RESTART
   */
  useEffect(() => {
    if (!hasVideo) return;

    const video = videoRef.current;
    if (!video) return;

    video.currentTime = getStartTime(
      lecture.progress?.isCompleted,
      lecture.progress?.lastTime,
    );

    video.play().catch(() => {});
  }, [lecture.id]);

  /**
   * 🎯 PROGRESS TRACKING
   */
  useEffect(() => {
    if (!hasVideo) return;

    const video = videoRef.current;
    if (!video) return;

    let lastSent = 0;

    const handleTimeUpdate = async () => {
      if (!video.duration) return;

      const currentTime = video.currentTime;
      const progress = (currentTime / video.duration) * 100;

      if (Math.floor(currentTime) - lastSent >= 5) {
        lastSent = Math.floor(currentTime);

        await userProgressClientService.update({
          lectureId: lecture.id,
          progress,
          lastTime: currentTime,
        });

        onProgressUpdate(
          lecture.id,
          progress,
          currentTime,
          lecture.progress?.isCompleted,
        );
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [lecture.id]);

  /**
   * 🎯 AUTO NEXT (ONLY ON END)
   */
  useEffect(() => {
    if (!hasVideo) return;

    const video = videoRef.current;
    if (!video) return;

    let called = false;

    const handleEnded = async () => {
      if (called) return;
      called = true;

      if (!lecture.progress?.isCompleted) {
        await userProgressClientService.update({
          lectureId: lecture.id,
          progress: 100,
          lastTime: video.duration,
        });

        onProgressUpdate(lecture.id, 100, video.duration, true);
      }

      onNext();
    };

    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [lecture.id, onNext]);

  /**
   * 📄 FILE AUTO COMPLETE
   */
  useEffect(() => {
    if (hasVideo) return;
    if (lecture.progress?.isCompleted) return;

    userProgressClientService.update({
      lectureId: lecture.id,
      progress: 100,
      lastTime: 0,
    });

    onProgressUpdate(lecture.id, 100, 0, true);
  }, [lecture.id, hasVideo]);

  if (!lecture) return null;

  return (
    <div className="flex w-full items-center justify-center bg-foreground">
      {hasVideo ? (
        <video
          ref={videoRef}
          src={lecture.video?.path}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          className="h-125 w-full object-cover"
        />
      ) : (
        <iframe
          src={`${firstAttachment?.file?.path}#toolbar=0&navpanes=0&scrollbar=0`}
          className="h-125 w-full bg-background"
        />
      )}
    </div>
  );
};
