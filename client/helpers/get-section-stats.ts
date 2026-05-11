import { Lecture } from "@/types/lecture";

/**
 * 🎥 get video duration
 */
export const getVideoDuration = (url: string): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");

    video.src = url;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      resolve(video.duration || 0);
    };

    video.onerror = () => resolve(0);
  });
};

/**
 * ⏱️ format duration
 */
export const formatDuration = (seconds: number) => {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * ⏱️ format total duration
 */

export const formatTotalDuration = (seconds: number) => {
  if (!seconds) return "";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

/**
 * 📊 Section Stats (ASYNC)
 */
export const getSectionStats = async (lectures: Lecture[]) => {
  if (!lectures || lectures.length === 0) {
    return {
      total: 0,
      completed: 0,
      totalSeconds: 0,
    };
  }

  let total = lectures.length;
  let completed = 0;

  // 🔥 parallel duration calculation
  const durations = await Promise.all(
    lectures.map(async (lecture) => {
      if (lecture.progress?.isCompleted) {
        completed++;
      }

      if (lecture.video?.path) {
        return await getVideoDuration(lecture.video.path);
      }

      return 0;
    }),
  );

  const totalSeconds = durations.reduce((a, b) => a + b, 0);

  return { total, completed, totalSeconds };
};
