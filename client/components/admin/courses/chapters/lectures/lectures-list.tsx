"use client";

import { Lecture } from "@/types/lecture";
import LectureDrawer from "./lecture-drawer";

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

import type { DragEndEvent, DraggableAttributes } from "@dnd-kit/core";
import { SortableItem } from "@/components/admin/sortable-item";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
type SortableRenderProps = {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap;
};
interface LectureListProps {
  chapterId: number;
  lectures: Lecture[];
  addLecture: () => void;
  onTooglePublish: (id: number, isPublished: boolean) => void;
  onDelete: (id: number) => void;
  viewType: string;
  handleDragEnd: (event: DragEndEvent) => void;
  setActiveId: (id: number) => void;
  activeId: number | null;
  dragHandle?: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap;
  };
  isFacultyLed?: boolean;
}

export const LectureList = ({
  chapterId,
  lectures,
  onTooglePublish,
  onDelete,
  addLecture,
  setActiveId,
  activeId,
  handleDragEnd,
  isFacultyLed = false,
}: LectureListProps) => {
  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lectures.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {lectures.map((lecture, index) => (
            <SortableItem key={lecture.id} id={lecture.id}>
              {({ attributes, listeners }: SortableRenderProps) => (
                <LectureDrawer
                  chapterId={chapterId}
                  index={index}
                  activeId={activeId}
                  setActiveId={setActiveId}
                  onDelete={onDelete}
                  onTooglePublish={onTooglePublish}
                  lecture={lecture}
                  dragHandle={{
                    attributes,
                    listeners,
                  }}
                  isFacultyLed={isFacultyLed}
                />
              )}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>

      {/* 🔥 Add Lecture Button */}
      <button
        onClick={addLecture}
        className="w-full cursor-pointer rounded-md border border-dashed border-[var(--brand-400)] py-2.5 text-xs font-medium text-[var(--brand-700)] transition-all hover:bg-[var(--brand-50)] dark:border-[var(--brand-500)]/45 dark:text-[var(--brand-300)] dark:hover:bg-[var(--brand-500)]/10"
      >
        + Add {isFacultyLed ? "Topic" : "Lecture"}
      </button>
    </div>
  );
};
