import { Lecture } from "@/types/lecture";

/**
 * 🎥 get video duration
 */
const durationCache = new Map<string, Promise<number>>();

export const getVideoDuration = (url: string): Promise<number> => {
  const cached = durationCache.get(url);
  if (cached) return cached;

  const durationPromise = new Promise<number>((resolve) => {
    const video = document.createElement("video");

    video.src = url;
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      video.removeAttribute("src");
      video.load();
      resolve(duration);
    };

    video.onerror = () => {
      video.removeAttribute("src");
      video.load();
      resolve(0);
    };
  });

  durationCache.set(url, durationPromise);

  return durationPromise;
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
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) return `${hrs} h ${mins} m`;
  if (mins > 0) return secs ? `${mins} m ${secs} s` : `${mins} m`;
  return `${secs} s`;
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

  const total = lectures.length;
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
