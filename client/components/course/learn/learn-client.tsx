"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ListVideo } from "lucide-react";

import { OpenClassroomButton } from "@/components/classroom/open-classroom-button";
import { LearnFooter } from "@/components/layout/learn-footer";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getNextLecture,
  getResumeLecture,
  mergeCourseProgress,
} from "@/helpers/course-progress";
import { userProgressClientService } from "@/services/user-progress/user-progress.client";
import { Course } from "@/types/course";
import type { FacultyClassSession } from "@/types/faculty-workspace";
import type { Assignment } from "@/types/assignment";
import type { LicenseSummary } from "@/types/license";
import { Lecture } from "@/types/lecture";
import {
  hasLiveClasses,
  hasRecordedLearning,
  isFacultyLedCourse,
} from "@/lib/course-delivery";
import { formatDateTime } from "@/utils/formate-date";
import { FacultyLedLearningClient } from "./faculty-led-learning-client";
import { CourseTabs } from "./course-tabs";
import { LearnCourseSidebar } from "./learn-course-sidebar";
import { PlayerHeader } from "./player-header";
import { VideoPlayer } from "./video-player";

interface LearnClientProps {
  course: Course;
  liveSessions?: FacultyClassSession[];
  assignments?: Assignment[];
  licenseSummary?: LicenseSummary | null;
}

export const LearnClient = ({
  course,
  liveSessions = [],
  assignments = [],
  licenseSummary,
}: LearnClientProps) => {
  const [courseData, setCourseData] = useState(course);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [isContentSheetOpen, setIsContentSheetOpen] = useState(false);
  const showLiveSessions = hasLiveClasses(course) && liveSessions.length > 0;

  useEffect(() => {
    if (!hasRecordedLearning(course)) {
      return;
    }

    const load = async () => {
      const res = await userProgressClientService.getCourse(course.id);
      const updated = mergeCourseProgress(course, res.data);

      setCourseData(updated);
      setCurrentLecture(getResumeLecture(updated));
    };

    load();
  }, [course]);

  const selectLecture = (lecture: Lecture) => {
    setCurrentLecture(lecture);
    setIsContentSheetOpen(false);
  };

  const handleNextLecture = () => {
    if (!currentLecture) return;

    const next = getNextLecture(courseData, currentLecture.id);

    if (next) {
      setCurrentLecture(next);
    }
  };

  const handleProgressUpdate = (
    lectureId: number,
    progress: number,
    lastTime: number,
    alreadyCompleted?: boolean,
  ) => {
    const nextIsCompleted = alreadyCompleted || progress >= 90;

    setCourseData((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) => ({
        ...chapter,
        lectures: chapter.lectures.map((lecture) =>
          lecture.id === lectureId
            ? {
                ...lecture,
                progress: {
                  isCompleted: nextIsCompleted,
                  progress,
                  lastTime,
                },
              }
            : lecture,
        ),
      })),
    }));

    setCurrentLecture((current) =>
      current?.id === lectureId
        ? {
            ...current,
            progress: {
              isCompleted: nextIsCompleted,
              progress,
              lastTime,
            },
          }
        : current,
    );

  };

  if (isFacultyLedCourse(course)) {
    return (
      <FacultyLedLearningClient
        course={course}
        sessions={liveSessions}
        assignments={assignments}
      />
    );
  }

  if (!currentLecture) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Learning content is not ready</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            No published lecture is available for this course yet. Please check
            back after the course content is published.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <PlayerHeader course={courseData} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <main className="min-w-0 flex-1 overflow-y-auto bg-foreground">
          <VideoPlayer
            lecture={currentLecture}
            onNext={handleNextLecture}
            onProgressUpdate={handleProgressUpdate}
          />

          <div className="relative bg-background">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-(--surface-shell)" />
            </div>

            <div className="relative z-10">
              <div className="sticky top-0 z-20 border-b border-border bg-background/95 p-3 backdrop-blur-xl lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsContentSheetOpen(true)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left shadow-sm"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                      Course content
                    </span>
                    <span className="mt-1 line-clamp-1 text-sm font-semibold text-card-foreground">
                      {currentLecture.title}
                    </span>
                  </span>

                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ListVideo className="h-5 w-5" />
                  </span>
                </button>
              </div>

              <CourseTabs
                course={courseData}
                assignments={assignments}
                licenseSummary={licenseSummary}
              />
              {showLiveSessions ? (
                <section className="mx-auto max-w-6xl px-4 pb-8 md:px-6">
                  <div className="rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
                          Live classroom
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">
                          Upcoming faculty sessions
                        </h3>
                      </div>
                      <Badge variant="secondary">
                        {liveSessions.length} upcoming
                      </Badge>
                    </div>

                    <div className="grid gap-3">
                      {liveSessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className="grid gap-3 rounded-xl border bg-background p-4 md:grid-cols-[minmax(0,1fr)_auto]"
                        >
                          <div className="min-w-0">
                            <h4 className="truncate font-semibold">
                              {session.title}
                            </h4>
                            <p className="mt-1 flex gap-2 text-sm text-muted-foreground">
                              <CalendarDays className="mt-0.5 size-4 text-primary" />
                              <span>
                                {formatDateTime(session.startsAt)} to{" "}
                                {formatDateTime(session.endsAt)}
                              </span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Batch: {session.batch.name}
                            </p>
                          </div>

                          <OpenClassroomButton
                            sessionId={session.id}
                            variant="outline"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}
              <LearnFooter />
            </div>
          </div>
        </main>

        <aside className="hidden w-90 flex-col border-l border-border bg-card lg:flex">
          <div className="sticky top-0 z-10 border-b border-border bg-card/95 p-4 backdrop-blur-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Course content
            </p>

            <h2 className="mt-1 font-semibold text-card-foreground">
              Lessons & chapters
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            <LearnCourseSidebar
              course={courseData}
              currentLecture={currentLecture}
              onSelectLecture={selectLecture}
            />
          </div>
        </aside>

        <Sheet open={isContentSheetOpen} onOpenChange={setIsContentSheetOpen}>
          <SheetContent
            side="right"
            className="w-[90vw] max-w-sm gap-0 p-0 sm:max-w-md"
          >
            <SheetHeader className="border-b border-border pr-14">
              <SheetTitle>Course content</SheetTitle>
              <SheetDescription>
                Pick a lesson and continue learning.
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <LearnCourseSidebar
                course={courseData}
                currentLecture={currentLecture}
                onSelectLecture={selectLecture}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
