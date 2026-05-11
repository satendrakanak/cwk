import { Course } from "@/types/course";
import { Lecture } from "@/types/lecture";

export const mergeCourseProgress = (
  course: Course,
  progressMap: Record<number, any>,
): Course => {
  return {
    ...course,
    chapters: course.chapters.map((chapter) => ({
      ...chapter,
      lectures: chapter.lectures.map((lecture) => ({
        ...lecture,
        progress: progressMap[lecture.id] || {
          isCompleted: false,
          progress: 0,
          lastTime: 0,
        },
      })),
    })),
  };
};

export const getCourseProgress = (course: Course) => {
  const lectures = course.chapters.flatMap((c) => c.lectures);

  const total = lectures.length;
  const completed = lectures.filter((l) => l.progress?.isCompleted).length;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percent };
};

export const getAllLectures = (course: Course): Lecture[] => {
  return course.chapters.flatMap((c) => c.lectures);
};

export const getResumeLecture = (course: Course): Lecture | null => {
  const lectures = getAllLectures(course);

  return (
    lectures.find(
      (l) => l.progress && l.progress?.lastTime > 0 && !l.progress?.isCompleted,
    ) ||
    lectures.find((l) => !l.progress?.isCompleted) ||
    lectures[0] ||
    null
  );
};

export const getNextLecture = (
  course: Course,
  currentLectureId: number,
): Lecture | null => {
  const lectures = getAllLectures(course);

  const index = lectures.findIndex((l) => l.id === currentLectureId);

  if (index === -1) return null;

  return lectures[index + 1] || null;
};
