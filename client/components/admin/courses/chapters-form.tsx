"use client";

import { useState } from "react";

import { Chapter } from "@/types/chapter";
import ChaptersList from "./chapters/chapters-list";
import PublishedList from "./chapters/published-chapters";
import { Course } from "@/types/course";
import { chapterClientService } from "@/services/chapters/chapter.client";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { isFacultyLedCourse, isBlendedCourse } from "@/lib/course-delivery";

interface ChaptersFormProps {
  course: Course;
}

export default function ChaptersForm({ course }: ChaptersFormProps) {
  const [chapters, setChapters] = useState<Chapter[]>(course.chapters ?? []);
  const [activeId, setActiveId] = useState<number | null>(null);
  const isFacultyLed = isFacultyLedCourse(course);
  const isHybrid = isBlendedCourse(course);

  const addChapter = () => {
    const newChapter: Chapter = {
      id: Date.now(),
      title: "",
      courseId: course.id,
      description: "",
      lectures: [],
      isFree: false,
      isPublished: false,
      isTemp: true,
      position: chapters.length,
    };

    setChapters((prev) => [...prev, newChapter]);
    setActiveId(newChapter.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = chapters.findIndex((c) => c.id === active.id);
    const newIndex = chapters.findIndex((c) => c.id === over.id);
    const movedChapter = chapters[oldIndex];

    if (!movedChapter || movedChapter.isTemp) {
      toast.info("Save this chapter before changing its order");
      return;
    }

    const newChapters = arrayMove(chapters, oldIndex, newIndex);

    const updated = newChapters.map((c, index) => ({
      ...c,
      position: index,
    }));

    setChapters(updated);

    try {
      await chapterClientService.reorder({
        items: updated
          .filter((c) => !c.isTemp)
          .map((c) => ({
            id: c.id,
            position: c.position,
          })),
      });

      toast.success("Chapters reordered successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to reorder chapters");
    }
  };
  const onLecturePublishChange = (lectureId: number, isPublished: boolean) => {
    setChapters((prev) =>
      prev.map((chapter) => {
        // update lectures
        const updatedLectures = chapter.lectures.map((lecture) =>
          lecture.id === lectureId ? { ...lecture, isPublished } : lecture,
        );

        // check if at least one published lecture exists
        const hasPublishedLecture = updatedLectures.some(
          (lecture) => lecture.isPublished,
        );

        return {
          ...chapter,
          lectures: updatedLectures,

          // 🔥 auto unpublish chapter
          isPublished: hasPublishedLecture ? chapter.isPublished : false,
        };
      }),
    );
  };

  const onTooglePublish = async (id: number, isPublished: boolean) => {
    try {
      // 🔥 optimistic update
      setChapters((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isPublished } : c)),
      );

      // 🔥 API call
      await chapterClientService.update(id, {
        isPublished,
      });
      toast.success("Chapter updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);

      // 🔥 rollback
      setChapters((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isPublished: !isPublished } : c,
        ),
      );
    }
  };

  const onDelete = async (id: number) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));

    try {
      await chapterClientService.delete(id);
      toast.success("Chapter deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete chapter");
    }
  };

  const onChapterSaved = (savedChapter: Chapter, previousId: number) => {
    setChapters((prev) => {
      const exists = prev.some((chapter) => chapter.id === previousId);

      if (!exists) {
        return [...prev, savedChapter].sort((a, b) => a.position - b.position);
      }

      return prev.map((chapter) =>
        chapter.id === previousId
          ? {
              ...savedChapter,
              lectures: savedChapter.lectures ?? chapter.lectures ?? [],
              position: chapter.position,
              isTemp: false,
            }
          : chapter,
      );
    });
  };

  return (
    <>
      <div className="grid gap-4 rounded-2xl border bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {isHybrid ? (
          <div className="rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm leading-6 text-primary lg:col-span-2">
            Hybrid courses use the normal recorded chapter and lecture builder
            here, plus faculty batches and live sessions from Faculty Workspace.
          </div>
        ) : null}
        <ChaptersList
          chapters={chapters}
          activeId={activeId}
          courseId={course.id}
          setActiveId={setActiveId}
          addChapter={addChapter}
          onTooglePublish={onTooglePublish}
          onDelete={onDelete}
          viewType="all"
          handleDragEnd={handleDragEnd}
          onLecturePublishChange={onLecturePublishChange}
          isFacultyLed={isFacultyLed}
          onChapterSaved={onChapterSaved}
        />

        <PublishedList
          chapters={chapters.filter((c) => c.isPublished)}
          activeId={activeId}
          courseId={course.id}
          setActiveId={setActiveId}
          onTooglePublish={onTooglePublish}
          onDelete={onDelete}
          viewType="published"
          handleDragEnd={handleDragEnd}
          onLecturePublishChange={onLecturePublishChange}
          isFacultyLed={isFacultyLed}
          onChapterSaved={onChapterSaved}
        />
      </div>
    </>
  );
}
