import { Button } from "@/components/ui/button";
import { Chapter } from "@/types/chapter";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "../../sortable-item";
import type { DragEndEvent, DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import ChapterAccordion from "./chapter-accordion";

type SortableRenderProps = {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap;
};

interface ChaptersListProps {
  chapters: Chapter[];
  activeId: number | null;
  courseId: number;
  setActiveId: (id: number | null) => void;
  addChapter: () => void;
  onTooglePublish: (id: number, isPublished: boolean) => void;
  viewType: string;
  onDelete: (id: number) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  onLecturePublishChange: (lectureId: number, isPublished: boolean) => void;
  isFacultyLed?: boolean;
  onChapterSaved: (chapter: Chapter, previousId: number) => void;
}

export default function ChaptersList({
  chapters,
  activeId,
  courseId,
  setActiveId,
  addChapter,
  onTooglePublish,
  viewType,
  onDelete,
  handleDragEnd,
  onLecturePublishChange,
  isFacultyLed = false,
  onChapterSaved,
}: ChaptersListProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white/70 p-3 dark:border-white/10 dark:bg-white/4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
          {isFacultyLed ? "Curriculum" : "Chapters"}
        </h3>
        <Button size="sm" onClick={addChapter}>
          + Add
        </Button>
      </div>

      <div className="space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={chapters.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {chapters.map((chapter, index) => (
              <SortableItem key={chapter.id} id={chapter.id}>
                {({ attributes, listeners }: SortableRenderProps) => (
                  <ChapterAccordion
                    chapter={chapter}
                    index={index}
                    activeId={activeId}
                    setActiveId={setActiveId}
                    courseId={courseId}
                    onTooglePublish={onTooglePublish}
                    onLecturePublishChange={onLecturePublishChange}
                    isFacultyLed={isFacultyLed}
                    onChapterSaved={onChapterSaved}
                    onDelete={onDelete}
                    viewType={viewType}
                    dragHandle={{
                      attributes,
                      listeners,
                    }}
                  />
                )}
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
