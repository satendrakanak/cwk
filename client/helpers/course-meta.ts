import { Course } from "@/types/course";
import { formatDuration, getVideoDuration } from "./get-section-stats";

export const getCourseMeta = async (course: Course) => {
  if (!course?.chapters) {
    return {
      totalLectures: 0,
      totalDuration: "0m",
    };
  }

  // 🔥 flatten all lectures
  const lectures = course.chapters.flatMap((c) => c.lectures || []);

  const totalLectures = lectures.length;

  // 🔥 parallel duration calculation
  const durations = await Promise.all(
    lectures.map(async (lecture) => {
      if (lecture.video?.path) {
        return await getVideoDuration(lecture.video.path);
      }
      return 0;
    }),
  );

  const totalSeconds = durations.reduce((a, b) => a + b, 0);

  return {
    totalLectures,
    totalDuration: formatDuration(totalSeconds),
  };
};
