"use client";

import { useState } from "react";
import { Lecture } from "@/types/lecture";

import { arrayMove } from "@dnd-kit/sortable";

import type { DragEndEvent } from "@dnd-kit/core";
import { lectureClientService } from "@/services/lectures/lecture.client";
import { toast } from "sonner";
import { LectureList } from "./lectures-list";
import { Chapter } from "@/types/chapter";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-handler";

interface LectureFormProps {
  chapter: Chapter;
  onLecturePublishChange: (lectureId: number, isPublished: boolean) => void;
  isFacultyLed?: boolean;
}

export const LectureForm = ({
  chapter,
  onLecturePublishChange,
  isFacultyLed = false,
}: LectureFormProps) => {
  const [lectures, setLectures] = useState<Lecture[]>(() => chapter.lectures ?? []);
  const [activeId, setActiveId] = useState<number | null>(null);

  const router = useRouter();

  const addLecture = () => {
    const newLecture: Lecture = {
      id: Date.now(),
      title: "",
      chapterId: chapter.id,
      description: "",
      video: null,
      isFree: false,
      isPublished: false,
      isTemp: true,
      position: lectures.length,
    };

    setLectures((prev) => [...prev, newLecture]);
    setActiveId(newLecture.id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = lectures.findIndex((l) => l.id === active.id);
    const newIndex = lectures.findIndex((l) => l.id === over.id);

    const newLectures = arrayMove(lectures, oldIndex, newIndex);

    const updated = newLectures.map((l, index) => ({
      ...l,
      position: index,
    }));

    setLectures(updated);

    try {
      await lectureClientService.reorder({
        items: updated.map((c) => ({
          id: c.id,
          position: c.position,
        })),
      });

      toast.success(
        isFacultyLed ? "Topics reordered successfully" : "Lectures reordered successfully",
      );
    } catch (error) {
      console.log(error);
      toast.error(isFacultyLed ? "Failed to reorder topics" : "Failed to reorder lectures");
    }
  };

  const onTooglePublish = async (id: number, isPublished: boolean) => {
    try {
      // 🔥 optimistic update
      setLectures((prev) =>
        prev.map((l) => (l.id === id ? { ...l, isPublished } : l)),
      );
      onLecturePublishChange(id, isPublished);

      // 🔥 API call
      await lectureClientService.update(id, {
        isPublished,
      });
      router.refresh();
      toast.success(isFacultyLed ? "Topic updated successfully" : "Lecture updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);

      // 🔥 rollback
      setLectures((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, isPublished: !isPublished } : l,
        ),
      );
      onLecturePublishChange(id, isPublished);
    }
  };

  const onDelete = async (id: number) => {
    setLectures((prev) => prev.filter((l) => l.id !== id));

    try {
      await lectureClientService.delete(id);
      toast.success(isFacultyLed ? "Topic deleted successfully" : "Lecture deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete lecture");
    }
  };

  return (
    <div className="space-y-2">
      <LectureList
        lectures={lectures}
        chapterId={chapter.id}
        setActiveId={setActiveId}
        addLecture={addLecture}
        activeId={activeId}
        onTooglePublish={onTooglePublish}
        onDelete={onDelete}
        handleDragEnd={handleDragEnd}
        viewType="all"
        isFacultyLed={isFacultyLed}
      />
    </div>
  );
};
