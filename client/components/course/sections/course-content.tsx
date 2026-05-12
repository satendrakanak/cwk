"use client";

import { useEffect, useState } from "react";
import { FileText, Lock, Minus, PlayCircle, Plus } from "lucide-react";

import VideoPreviewModal from "@/components/modals/video-preview-modal";
import {
  formatDuration,
  formatTotalDuration,
  getVideoDuration,
} from "@/helpers/get-section-stats";
import { hasRecordedLearning, isFacultyLedCourse } from "@/lib/course-delivery";
import { cn } from "@/lib/utils";
import { Course } from "@/types/course";

interface CourseContentProps {
  course: Course;
}

export const CourseContent = ({ course }: CourseContentProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const recordedLearning = hasRecordedLearning(course);
  const facultyLedOnly = isFacultyLedCourse(course);
  const [durationMap, setDurationMap] = useState<Record<number, number>>({});
  const [sectionDuration, setSectionDuration] = useState<
    Record<number, number>
  >({});

  const [activeVideo, setActiveVideo] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDurations = async () => {
      if (!recordedLearning) {
        setDurationMap({});
        setSectionDuration({});
        return;
      }

      const lectureDurations: Record<number, number> = {};
      const sectionDurations: Record<number, number> = {};

      await Promise.all(
        (course.chapters ?? []).map(async (chapter) => {
          const durations = await Promise.all(
            (chapter.lectures ?? []).map(async (lecture) => {
              if (!lecture.video?.path) return 0;

              const duration = await getVideoDuration(lecture.video.path);
              lectureDurations[lecture.id] = duration;
              return duration;
            }),
          );

          sectionDurations[chapter.id] = durations.reduce(
            (total, duration) => total + duration,
            0,
          );
        }),
      );

      if (!isMounted) return;

      setDurationMap(lectureDurations);
      setSectionDuration(sectionDurations);
    };

    loadDurations();

    return () => {
      isMounted = false;
    };
  }, [course.chapters, recordedLearning]);

  return (
    <>
      <div className="academy-card p-4 sm:p-5 md:p-6">
        <div className="mb-5 border-b border-border pb-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Course Content
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {facultyLedOnly
              ? "Explore the live course curriculum and module flow before joining your batch."
              : "Explore chapters, lectures, previews, and learning material included in this course."}
          </p>
        </div>

        <div className="space-y-3">
          {course.chapters?.map((chapter, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={chapter.id}
                className={cn(
                  "overflow-hidden rounded-2xl border transition-all duration-300",
                  isOpen
                    ? "border-primary/25 bg-primary/5 shadow-[0_14px_45px_color-mix(in_oklab,var(--primary)_12%,transparent)]"
                    : "border-border bg-card",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-primary/5 sm:gap-4 sm:p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3
                        className={cn(
                          "line-clamp-1 font-semibold text-card-foreground transition-colors",
                          isOpen && "text-primary",
                        )}
                      >
                        {chapter.title}
                      </h3>

                      {facultyLedOnly ? (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          Module {index + 1}
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {chapter.lectures?.length || 0} lectures
                        </span>
                      )}

                      {recordedLearning && sectionDuration[chapter.id] > 0 && (
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatTotalDuration(sectionDuration[chapter.id])}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors sm:h-9 sm:w-9",
                      isOpen
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {isOpen ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </span>
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-none" : "max-h-0",
                  )}
                >
                  <div className="border-t border-border px-3 py-3 sm:px-4 sm:py-4">
                    {chapter.description && (
                      <div className="mb-4 rounded-2xl border border-border bg-muted/50 p-4 text-sm leading-7 text-muted-foreground">
                        {chapter.description}
                      </div>
                    )}

                    {recordedLearning ? (
                      <div className="space-y-2">
                        {chapter.lectures?.map((lecture) => {
                        const isLocked =
                          recordedLearning && !lecture.isFree;
                        const hasVideo = Boolean(lecture.video?.path);
                        const hasAttachment = Boolean(
                          lecture.attachments?.length,
                        );
                        const duration = durationMap[lecture.id];

                        return (
                          <div
                            key={lecture.id}
                            className="rounded-2xl border border-border bg-card px-3 py-3 transition-colors hover:border-primary/25 hover:bg-primary/5 sm:px-4"
                          >
                            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                              <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground sm:h-8 sm:w-8">
                                  {isLocked ? (
                                    <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  ) : recordedLearning && hasVideo ? (
                                    <PlayCircle className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                                  ) : (
                                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  )}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium leading-5 text-card-foreground sm:line-clamp-2">
                                    {lecture.title}
                                  </p>

                                  <div className="mt-1 flex flex-wrap gap-2">
                                    {!isLocked ? (
                                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                        Free preview
                                      </span>
                                    ) : null}

                                    {hasAttachment ? (
                                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                        {lecture.attachments?.length} resource
                                      </span>
                                    ) : null}
                                  </div>

                                  {lecture.description && (
                                    <div className="mt-2 max-w-full text-xs leading-6 text-muted-foreground break-words">
                                      {lecture.description}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex min-w-0 flex-wrap items-center gap-2 pl-9 text-xs text-muted-foreground sm:shrink-0 sm:gap-3 sm:pl-0">
                                {recordedLearning && !isLocked && hasVideo && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveVideo({
                                        url: lecture.video?.path || "",
                                        title: lecture.title,
                                      })
                                    }
                                    className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:px-3"
                                  >
                                    Preview
                                  </button>
                                )}

                                {recordedLearning && hasVideo && duration && (
                                  <span className="whitespace-nowrap rounded-full bg-muted px-2 py-1">
                                    {formatDuration(duration)}
                                  </span>
                                )}

                                {recordedLearning && !hasVideo && hasAttachment && (
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                        })}
                      </div>
                    ) : facultyLedOnly ? (
                      <div className="space-y-2">
                        {chapter.lectures?.map((lecture) => (
                          <div
                            key={lecture.id}
                            className="rounded-2xl border border-border bg-card px-3 py-3 transition-colors hover:border-primary/25 hover:bg-primary/5"
                          >
                            <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-8 sm:w-8">
                                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium leading-5 text-card-foreground sm:line-clamp-2">
                                  {lecture.title}
                                </p>

                                {lecture.description && (
                                  <p className="mt-2 max-w-full text-xs leading-6 text-muted-foreground break-words">
                                    {lecture.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <VideoPreviewModal
        videoUrl={activeVideo?.url || null}
        title={activeVideo?.title}
        onClose={() => setActiveVideo(null)}
      />
    </>
  );
};
