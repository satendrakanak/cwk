"use client";

import { useEffect, useState } from "react";
import { FileText, Lock, Minus, PlayCircle, Plus } from "lucide-react";

import VideoPreviewModal from "@/components/modals/video-preview-modal";
import { getVideoDuration, formatDuration } from "@/helpers/get-section-stats";
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

      for (const chapter of course.chapters ?? []) {
        let total = 0;

        for (const lecture of chapter.lectures ?? []) {
          if (!lecture.video?.path) continue;

          const duration = await getVideoDuration(lecture.video.path);

          lectureDurations[lecture.id] = duration;
          total += duration;
        }

        sectionDurations[chapter.id] = total;
      }

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
      <div className="academy-card p-5 md:p-6">
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
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-primary/5"
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
                          {formatDuration(sectionDuration[chapter.id])}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
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
                    isOpen ? "max-h-300" : "max-h-0",
                  )}
                >
                  <div className="border-t border-border px-4 py-4">
                    {chapter.description && (
                      <div className="mb-4 rounded-2xl border border-border bg-muted/50 p-4 text-sm leading-7 text-muted-foreground">
                        {chapter.description}
                      </div>
                    )}

                    {recordedLearning ? (
                      <div className="space-y-2">
                        {chapter.lectures?.map((lecture) => {
                        const isLocked =
                          recordedLearning && (!lecture.isFree || !chapter.isFree);
                        const hasVideo = Boolean(lecture.video?.path);
                        const hasAttachment = Boolean(
                          lecture.attachments?.length,
                        );
                        const duration = durationMap[lecture.id];

                        return (
                          <div
                            key={lecture.id}
                            className="rounded-2xl border border-border bg-card px-3 py-3 transition-colors hover:border-primary/25 hover:bg-primary/5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-start gap-3">
                                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                  {isLocked ? (
                                    <Lock className="h-4 w-4" />
                                  ) : recordedLearning && hasVideo ? (
                                    <PlayCircle className="h-4 w-4 text-primary" />
                                  ) : (
                                    <FileText className="h-4 w-4" />
                                  )}
                                </span>

                                <div className="min-w-0">
                                  <p className="line-clamp-2 text-sm font-medium text-card-foreground">
                                    {lecture.title}
                                  </p>

                                  {lecture.description && (
                                    <div className="mt-2 text-xs leading-6 text-muted-foreground">
                                      {lecture.description}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                                {recordedLearning && !isLocked && hasVideo && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setActiveVideo({
                                        url: lecture.video?.path || "",
                                        title: lecture.title,
                                      })
                                    }
                                    className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                                  >
                                    Preview
                                  </button>
                                )}

                                {recordedLearning && hasVideo && duration && (
                                  <span className="whitespace-nowrap">
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
