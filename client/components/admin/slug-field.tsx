"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Check, Pencil } from "lucide-react";

interface SlugFieldProps {
  title: string;
  value: string;
  forSlug?: string;
  onChange: (val: string) => void;
}

export const SlugField = ({
  title,
  value,
  forSlug,
  onChange,
}: SlugFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSlug, setTempSlug] = useState(value);
  const [isManual, setIsManual] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // slug auto generate
  useEffect(() => {
    if (!isManual && title) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-");

      setTempSlug(generated);
      onChange(generated);
    }
  }, [title, isManual]);

  const handleSave = () => {
    setIsManual(true);
    onChange(tempSlug);
    setIsEditing(false);
  };

  return (
    <div className="space-y-1">
      {/* 🔥 VIEW MODE */}
      {!isEditing ? (
        <div className="flex items-center text-sm">
          <span className="text-muted-foreground">
            {baseUrl}/{forSlug || "course"}/
          </span>

          <span className="font-medium text-foreground">
            {value || "your-slug"}
          </span>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="cursor-pointer ml-2 text-muted-foreground hover:text-foreground transition"
          >
            <Pencil className="size-3" />
          </button>
        </div>
      ) : (
        /* 🔥 EDIT MODE */
        <div className="flex items-center w-full text-sm">
          <span className="text-muted-foreground mr-1">
            {baseUrl}/{forSlug || "course"}/
          </span>

          <div className="relative flex-1">
            <Input
              value={tempSlug}
              onChange={(e) => setTempSlug(e.target.value)}
              className="h-6 w-full focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none shadow-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />

            {/* 🔥 Save Icon inside input */}
            <button
              type="button"
              onClick={handleSave}
              className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-green-600 transition"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
