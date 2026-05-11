"use client";

import { ChevronDown, Folder } from "lucide-react";

import { Attachment } from "@/types/attachment";
import { Lecture } from "@/types/lecture";
import { getFileIcon } from "@/utils/get-file-type";

interface LearnCourseResourcesProps {
  lecture: Lecture;
  openMenu: number | null;
  setOpenMenu: (id: number | null) => void;
}

export const LearnCourseResources = ({
  lecture,
  openMenu,
  setOpenMenu,
}: LearnCourseResourcesProps) => {
  const isOpen = openMenu === lecture.id;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenMenu(isOpen ? null : lecture.id)}
        className="flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
      >
        <Folder className="h-3.5 w-3.5" />
        Resources
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-[0_18px_55px_color-mix(in_oklab,var(--foreground)_14%,transparent)]">
          {lecture.attachments?.map((file: Attachment) => {
            const Icon = getFileIcon(file.name);

            return (
              <a
                key={file.id}
                href={file.file.path}
                download
                className="flex items-start gap-2 px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                <span className="break-all">{file.name}</span>
              </a>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
