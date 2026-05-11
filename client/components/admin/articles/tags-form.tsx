"use client";

import { useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { tagClientService } from "@/services/tags/tag.client";
import { Tag } from "@/types/tag";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-handler";
import { Article } from "@/types/article";
import { articleClientService } from "@/services/articles/article.client";
import { Input } from "@/components/ui/input";

interface TagsFormProps {
  article: Article;
}

export function TagsForm({ article }: TagsFormProps) {
  const [tags, setTags] = useState<Tag[]>(article.tags || []);
  const [newTag, setNewTag] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");

  const router = useRouter();

  // 🔥 important: prevent duplicate API calls
  const lastSavedRef = useRef<string>("");

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
      await articleClientService.update(article.id, {
        tagIds: updated.map((t) => t.id),
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
    const previous = tags;

    // 🔥 optimistic update
    const updated = tags.filter((t) => t.id !== tagId);
    setTags(updated);

    try {
      await articleClientService.update(article.id, {
        tagIds: updated.map((t) => t.id),
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
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Tags</h3>
      </div>

      <div className="space-y-3 p-4">
        <div className="relative">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                handleAddTagsFromInput();
              }
            }}
            placeholder="Add tag"
            className="h-11 pr-10"
          />

          {newTag.trim() && (
            <button
              onClick={handleAddTagsFromInput}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[var(--brand-700)] dark:hover:text-[var(--brand-200)]"
            >
              <Check size={16} />
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground dark:text-slate-300">
          Separate tags with commas
        </p>

        {/* Selected tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-slate-700 dark:bg-white/10 dark:text-slate-200"
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
            <div className="space-y-2 rounded-xl border border-slate-100 p-3 dark:border-white/10 dark:bg-white/6">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tags..."
                className="h-10"
              />

              <div className="max-h-40 overflow-y-auto space-y-1">
                {suggestedTags.map((tag) => {
                  const isSelected = tags.some((t) => t.id === tag.id);

                  return (
                    <div
                      key={tag.id}
                      onClick={() => {
                        if (isSelected) return;

                        const updated = [...tags, tag];
                        setTags(updated);
                        saveTags(updated);
                      }}
                      className={`text-sm px-2 py-1 rounded cursor-pointer ${
                        isSelected
                          ? "bg-gray-200 text-muted-foreground dark:bg-white/10 dark:text-slate-400"
                          : "text-slate-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-white/8"
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
