"use client";

import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { categoryClientService } from "@/services/categories/category.client";
import { Category } from "@/types/category";
import { slugify } from "@/utils/slugify";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-handler";
import { Article } from "@/types/article";
import { articleClientService } from "@/services/articles/article.client";
import { Input } from "@/components/ui/input";

interface CategoryFormProps {
  article: Article;
}

export const CategoryForm = ({ article }: CategoryFormProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const router = useRouter();
  // 🔥 Load categories + preselect
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoryClientService.getAllBy("ARTICLE");
        setCategories(response.data as Category[]);

        // prefill from course
        const existing = article.categories?.map((c) => c.id) || [];
        setSelected(existing);
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        toast.error(message);
      }
    };

    loadCategories();
  }, [article]);

  // 🔥 Auto Save
  const saveCategories = async (updated: number[]) => {
    try {
      await articleClientService.update(article.id, {
        categoryIds: updated,
      });
      router.refresh();
      toast.success("Categories updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };
  const toggleCategory = (id: number) => {
    let updated: number[];

    if (selected.includes(id)) {
      updated = selected.filter((item) => item !== id);
    } else {
      updated = [...selected, id];
    }

    setSelected(updated);
    saveCategories(updated);
  };

  // 🔥 Add new category
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      // 1️⃣ create category
      const res = await categoryClientService.create({
        name: newCategory,
        slug: slugify(newCategory),
        type: "article",
      });

      const created = res.data;

      // 2️⃣ update UI list
      setCategories((prev) => [...prev, created]);

      // 3️⃣ attach to course
      const updated = [...selected, created.id];
      setSelected(updated);

      await saveCategories(updated);

      // reset
      setNewCategory("");
      setShowInput(false);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Categories</h3>
      </div>

      <div className="space-y-3 p-4">
        <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/6">
          <div className="space-y-2">
            {categories.map((cat) => {
              const isChecked = selected.includes(cat.id);

              return (
                <label
                  key={cat.id}
                  className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.id)}
                    className="h-4 w-4 accent-primary cursor-pointer"
                  />
                  {cat.name}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          {!showInput ? (
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="flex cursor-pointer items-center gap-1 text-sm text-[var(--brand-700)] hover:underline dark:text-[var(--brand-200)]"
            >
              <Plus size={14} />
              Add New Category
            </button>
          ) : (
            <div className="relative mt-1">
              <Input
                autoFocus
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                placeholder="New category"
                className="h-11 pr-10"
              />

              {/* Icon inside input */}
              {newCategory.trim() && (
                <button
                  onClick={handleAddCategory}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[var(--brand-700)] dark:hover:text-[var(--brand-200)]"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
