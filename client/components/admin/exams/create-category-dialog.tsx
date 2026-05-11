"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/error-handler";
import { examClientService } from "@/services/exams/exam.client";
import { QuestionBankCategory } from "@/types/exam";

type CreateCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: QuestionBankCategory | null;
  categories?: QuestionBankCategory[];
  mode?: "create" | "edit" | "duplicate";
};

export function CreateCategoryDialog({
  open,
  onOpenChange,
  category,
  categories = [],
  mode = "create",
}: CreateCategoryDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = mode === "edit";
  const isDuplicate = mode === "duplicate";

  useEffect(() => {
    if (!open) return;

    if (category) {
      setName(isDuplicate ? `${category.name} Copy` : category.name);
      setDescription(category.description ?? "");
      setParentId(category.parent?.id ? String(category.parent.id) : "");
      return;
    }

    setName("");
    setDescription("");
    setParentId("");
  }, [category, isDuplicate, open]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      if (isEdit && category) {
        await examClientService.updateCategory(category.id, {
          name,
          description: description || undefined,
          parentId: parentId ? Number(parentId) : undefined,
        });
        toast.success("Question category updated");
      } else {
        await examClientService.createCategory({
          name,
          description: description || undefined,
          parentId: parentId ? Number(parentId) : undefined,
        });
        toast.success(
          isDuplicate
            ? "Question category duplicated"
            : "Question category created",
        );
      }
      onOpenChange(false);
      setName("");
      setDescription("");
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit Question Category"
              : isDuplicate
                ? "Duplicate Question Category"
                : "Create Question Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Description</Label>
            <Textarea
              id="category-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Parent Category</Label>
            <NativeSelect
              className="w-full"
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
            >
              <NativeSelectOption value="">Root category</NativeSelectOption>
              {categories
                .filter((item) => item.id !== category?.id)
                .map((item) => (
                  <NativeSelectOption key={item.id} value={item.id}>
                    {item.parent ? `${item.parent.name} / ${item.name}` : item.name}
                  </NativeSelectOption>
                ))}
            </NativeSelect>
            <p className="text-xs text-muted-foreground">
              Root categories are top-level groups. Child categories sit inside a
              parent group.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : isEdit
                  ? "Save Category"
                  : isDuplicate
                    ? "Duplicate Category"
                    : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
