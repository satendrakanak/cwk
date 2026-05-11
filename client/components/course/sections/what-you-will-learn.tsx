"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Course } from "@/types/course";

interface WhatYouWillLearnProps {
  course: Course;
}

export const WhatYouWillLearn = ({ course }: WhatYouWillLearnProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="academy-card p-5 md:p-6">
      <div className="mb-5 border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-card-foreground">
          What you&apos;ll learn
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          A quick overview of the key outcomes and concepts covered in this
          course.
        </p>
      </div>

      <div className="relative">
        <div
          className={cn(
            "prose max-w-none text-sm leading-7",
            "prose-p:text-muted-foreground prose-p:leading-7",
            "prose-li:text-muted-foreground prose-li:leading-7 prose-li:marker:text-primary",
            "prose-strong:text-card-foreground prose-headings:text-card-foreground prose-a:text-primary",
            !expanded && "line-clamp-5",
          )}
          dangerouslySetInnerHTML={{ __html: course.description ?? "" }}
        />

        {!expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-card to-transparent" />
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
      >
        {expanded ? "Show Less" : "Show More"}

        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>
    </div>
  );
};
