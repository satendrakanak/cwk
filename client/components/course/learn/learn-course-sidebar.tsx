"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import {
  formatTotalDuration,
  getSectionStats,
} from "@/helpers/get-section-stats";
import { Chapter } from "@/types/chapter";
import { Lecture, LectureStats } from "@/types/lecture";
import { Course } from "@/types/course";
import { SectionLectures } from "./section-lectures";

interface LearnCourseSidebarProps {
  course: Course;
  currentLecture: Lecture | null;
  onSelectLecture: (lecture: Lecture) => void;
}

export const LearnCourseSidebar = ({
  course,
  currentLecture,
  onSelectLecture,
}: LearnCourseSidebarProps) => {
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [sectionStats, setSectionStats] = useState<
    Record<number, LectureStats>
  >({});

  useEffect(() => {
    const loadStats = async () => {
      const statsMap: Record<number, LectureStats> = {};

      for (const chapter of course.chapters) {
        const stats = await getSectionStats(chapter.lectures);
        statsMap[chapter.id] = stats;
      }

      setSectionStats(statsMap);
    };

    loadStats();
  }, [course]);

  useEffect(() => {
    if (!currentLecture) return;

    const parentChapter = course.chapters.find((chapter: Chapter) =>
      chapter.lectures.some((lecture) => lecture.id === currentLecture.id),
    );

    if (!parentChapter) return;

    setOpenSections((prev) => ({
      ...prev,
      [parentChapter.id]: true,
    }));
  }, [currentLecture, course]);

  const toggleSection = (id: number) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex h-full flex-col text-sm text-card-foreground">
      <div className="divide-y divide-border">
        {course.chapters.map((chapter: Chapter, index: number) => {
          const isOpen = openSections[chapter.id] ?? index === 0;
          const stats = sectionStats[chapter.id];

          return (
            <div key={chapter.id}>
              <button
                type="button"
                onClick={() => toggleSection(chapter.id)}
                className="flex w-full cursor-pointer justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/70"
              >
                <div className="min-w-0">
                  <p className="line-clamp-2 font-semibold text-card-foreground">
                    Section {index + 1}: {chapter.title}
                  </p>

                  {stats ? (
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {stats.completed}/{stats.total}
                      {stats.totalSeconds > 0
                        ? ` | ${formatTotalDuration(stats.totalSeconds)}`
                        : ""}
                    </p>
                  ) : null}
                </div>

                <span className="mt-0.5 shrink-0 text-muted-foreground">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              </button>

              {isOpen ? (
                <SectionLectures
                  chapter={chapter}
                  openMenu={openMenu}
                  setOpenMenu={setOpenMenu}
                  currentLecture={currentLecture}
                  onSelectLecture={onSelectLecture}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
