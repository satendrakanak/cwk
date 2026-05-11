"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDuration, getVideoDuration } from "@/helpers/get-section-stats";
import { Chapter } from "@/types/chapter";
import { Lecture } from "@/types/lecture";
import { LearnCourseResources } from "./learn-course-resources";

interface SectionLecturesProps {
  chapter: Chapter;
  openMenu: number | null;
  setOpenMenu: (id: number | null) => void;
  currentLecture: Lecture | null;
  onSelectLecture: (lecture: Lecture) => void;
}

export const SectionLectures = ({
  chapter,
  openMenu,
  setOpenMenu,
  currentLecture,
  onSelectLecture,
}: SectionLecturesProps) => {
  const [durationMap, setDurationMap] = useState<Record<number, number>>({});

  useEffect(() => {
    const loadDurations = async () => {
      const map: Record<number, number> = {};

      await Promise.all(
        chapter.lectures.map(async (lecture) => {
          if (lecture.video?.path) {
            const duration = await getVideoDuration(lecture.video.path);
            map[lecture.id] = duration;
          }
        }),
      );

      setDurationMap(map);
    };

    loadDurations();
  }, [chapter]);

  return (
    <div className="bg-card">
      {chapter.lectures?.map((lecture: Lecture) => {
        const isActive = currentLecture?.id === lecture.id;
        const isCompleted = lecture.progress?.isCompleted;

        const hasVideo = Boolean(lecture.video?.path);
        const hasAttachments = Boolean(lecture.attachments?.length);

        const duration = durationMap[lecture.id];

        return (
          <div
            key={lecture.id}
            className={cn(
              "group flex cursor-pointer items-start justify-between border-l-4 px-4 py-3 transition-colors",
              isActive
                ? "border-primary bg-primary/10"
                : "border-transparent hover:bg-muted/70",
            )}
          >
            <div
              className="flex flex-1 gap-3"
              onClick={() => onSelectLecture(lecture)}
            >
              <div className="mt-1">
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : hasVideo ? (
                  <PlayCircle className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              <div className="flex min-w-0 flex-col">
                <p
                  className={cn(
                    "line-clamp-1 text-sm text-card-foreground",
                    isActive && "font-semibold text-primary",
                  )}
                >
                  {lecture.title}
                </p>

                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  {hasVideo && duration ? (
                    <span>{formatDuration(duration)}</span>
                  ) : null}

                  {hasVideo && duration && hasAttachments ? (
                    <span className="text-muted-foreground/45">•</span>
                  ) : null}

                  {hasAttachments ? (
                    <span>{lecture.attachments?.length} files</span>
                  ) : null}
                </div>
              </div>
            </div>

            {hasAttachments ? (
              <LearnCourseResources
                lecture={lecture}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
