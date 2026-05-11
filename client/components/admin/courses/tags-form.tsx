"use client";

import { useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { tagClientService } from "@/services/tags/tag.client";
import { Tag } from "@/types/tag";
import { Course } from "@/types/course";
import { courseClientService } from "@/services/courses/course.client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-handler";

interface TagsFormProps {
  course: Course;
}

export function TagsForm({ course }: TagsFormProps) {
  const [tags, setTags] = useState<Tag[]>(course.tags || []);
  const [newTag, setNewTag] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");

  const router = useRouter();

  // 🔥 important: prevent duplicate API calls
  const lastSavedRef = useRef<string>("");

  const courseTagIds = useMemo(
    () => (course.tags || []).map((tag) => tag.id).sort().join(","),
    [course.tags],
  );
  const tagsChangedLocally = useMemo(
    () => tags.map((tag) => tag.id).sort().join(",") !== courseTagIds,
    [courseTagIds, tags],
  );

  const displayedTags = tagsChangedLocally ? tags : (course.tags ?? []);

  // load suggestions (later search API laga sakta hai)
  const loadSuggestedTags = async () => {
    const res = await tagClientService.getAll();
    setSuggestedTags(res.data as Tag[]);
  };

  // core save
  const saveTags = async (updated: Tag[]) => {
    const ids = updated
      .map((t) => t.id)
      .sort()
      .join(",");

    if (ids === lastSavedRef.current) {
      return;
    }

    lastSavedRef.current = ids;

    try {
      await courseClientService.update(course.id, {
        tags: updated.map((t) => t.id),
      });
      router.refresh();
      toast.success("Tags updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  // remove tag
  const removeTag = async (tagId: number) => {
    const previous = displayedTags;

    // 🔥 optimistic update
    const updated = displayedTags.filter((t) => t.id !== tagId);
    setTags(updated);

    try {
      await courseClientService.update(course.id, {
        tags: updated.map((t) => t.id),
      });

      toast.success("Tag removed successfully");
      router.refresh();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);

      // 🔥 rollback
      setTags(previous);
    }
  };

  // 🔥 add via input (comma / enter)
  const handleAddTagsFromInput = async () => {
    const values = Array.from(
      new Set(
        newTag
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v.length > 0),
      ),
    );

    if (!values.length) return;

    try {
      const res = await tagClientService.bulkCreate(values);
      const createdTags: Tag[] = res.data;

      setTags((prev) => {
        const existingIds = prev.map((t) => t.id);

        const unique = createdTags.filter((t) => !existingIds.includes(t.id));

        const updated = [...prev, ...unique];

        saveTags(updated);
        return updated;
      });

      setNewTag("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      {/* Header */}
      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
          Tags
        </h3>
      </div>

      <div className="space-y-3 p-4">
        {/* Input */}
        <div className="relative">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                handleAddTagsFromInput();
              }
            }}
            placeholder="Add tag"
            className="w-full rounded-xl border px-3 py-2 pr-9 text-sm outline-none dark:border-white/10 dark:bg-white/8 dark:text-slate-100"
          />

          {newTag.trim() && (
            <button
              onClick={handleAddTagsFromInput}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-[var(--brand-700)] dark:hover:text-[var(--brand-200)]"
            >
              <Check size={16} />
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Separate tags with commas
        </p>

        {/* Selected tags */}
        <div className="flex flex-wrap gap-2">
          {displayedTags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 rounded-xl bg-gray-100 px-2.5 py-1.5 text-xs dark:bg-white/10 dark:text-slate-100"
            >
              {tag.name}
              <button
                onClick={() => removeTag(tag.id)}
                className="cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <button
            onClick={() => {
              setShowSuggestions((prev) => !prev);
              loadSuggestedTags();
            }}
            className="cursor-pointer text-xs text-[var(--brand-700)] hover:underline dark:text-[var(--brand-200)]"
          >
            Choose from the most used tags
          </button>

          {showSuggestions && (
            <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-white/10 dark:bg-white/4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tags..."
                className="w-full rounded-lg border px-3 py-2 text-sm dark:border-white/10 dark:bg-white/8 dark:text-slate-100"
              />

              <div className="max-h-40 overflow-y-auto space-y-1">
                {suggestedTags.map((tag) => {
                const isSelected = displayedTags.some((t) => t.id === tag.id);

                  return (
                    <div
                      key={tag.id}
                      onClick={() => {
                        if (isSelected) return;

                        const updated = [...displayedTags, tag];
                        setTags(updated);
                        saveTags(updated);
                      }}
                      className={`cursor-pointer rounded-lg px-2 py-1.5 text-sm ${
                        isSelected
                          ? "bg-gray-200 text-muted-foreground dark:bg-white/10 dark:text-slate-400"
                          : "hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-white/8"
                      }`}
                    >
                      {tag.name}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
