"use client";

import { Chapter } from "@/types/chapter";
import { useState } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { ChapterAccordionItem } from "./chapter-accordion-item";
import ChapterDrawer from "./chapter-drawer";

interface ChapterAccordionProps {
  chapter: Chapter;
  index: number;
  activeId: number | null;
  courseId: number;
  setActiveId: (id: number | null) => void;
  onTooglePublish: (id: number, isPublished: boolean) => void;
  onLecturePublishChange: (lectureId: number, isPublished: boolean) => void;
  onDelete: (id: number) => void;
  viewType: string;
  dragHandle?: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap;
  };
  isFacultyLed?: boolean;
  onChapterSaved: (chapter: Chapter, previousId: number) => void;
}

export default function ChapterAccordion({
  chapter,
  activeId,
  setActiveId,
  courseId,
  index,
  onTooglePublish,
  onLecturePublishChange,
  onDelete,
  viewType,
  dragHandle,
  isFacultyLed = false,
  onChapterSaved,
}: ChapterAccordionProps) {
  const [open, setOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter>(chapter);
  if (!chapter) return null;

  const isTemp = chapter.isTemp;
  const isPublishedView = viewType === "published";

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setOpen(true);
  };

  return (
    <>
      <ChapterAccordionItem
        chapter={chapter}
        index={index}
        activeId={activeId}
        setActiveId={setActiveId}
        onTooglePublish={onTooglePublish}
        isPublishedView={isPublishedView}
        onLecturePublishChange={onLecturePublishChange}
        isTemp={isTemp}
        onDelete={onDelete}
        dragHandle={dragHandle}
        onEdit={handleEdit}
        isFacultyLed={isFacultyLed}
      />
      <ChapterDrawer
        courseId={courseId}
        open={open}
        onClose={() => setOpen(false)}
        chapter={editingChapter}
        isFacultyLed={isFacultyLed}
        onSaved={onChapterSaved}
      />
    </>
  );
}
