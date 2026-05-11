"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { FileUpload } from "@/components/media/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryClientService } from "@/services/categories/category.client";
import { Category, CategoryType } from "@/types/category";
import { FileType } from "@/types/file";
import { slugify } from "@/utils/slugify";
import { getErrorMessage } from "@/lib/error-handler";

const categoryFormSchema = z.object({
  name: z.string().min(3, "Min 3 characters").max(96, "Max 96 characters"),
  type: z.enum(["course", "article"]),
  description: z.string().optional(),
  imageAlt: z.string().max(96, "Max 96 characters").optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CreateCategoryFormProps {
  category?: Category;
  defaultType?: CategoryType;
  onSuccess?: () => void;
}

export const CreateCategoryForm = ({
  category,
  defaultType = "course",
  onSuccess,
}: CreateCategoryFormProps) => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<FileType | null>(
    category?.image || null,
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    mode: "onChange",
    defaultValues: {
      name: category?.name || "",
      type: category?.type || defaultType,
      description: category?.description || "",
      imageAlt: category?.imageAlt || "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      const payload = {
        name: data.name.trim(),
        slug: slugify(data.name),
        type: data.type,
        description: data.description?.trim() || undefined,
        imageId: selectedImage?.id,
        imageAlt: data.imageAlt?.trim() || undefined,
      };

      if (category?.id) {
        await categoryClientService.update(category.id, payload);
        toast.success("Category updated successfully");
      } else {
        await categoryClientService.create(payload);
        toast.success("Category created successfully");
        form.reset({
          name: "",
          type: defaultType,
          description: "",
          imageAlt: "",
        });
        setSelectedImage(null);
      }

      onSuccess?.();
      router.refresh();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-3xl border border-[var(--brand-100)] bg-[var(--brand-50)]/45 p-4 dark:border-white/10 dark:bg-white/6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-700)] dark:text-[var(--brand-200)]">
          Scope
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Choose where this category should appear across the platform.
        </p>
      </div>

      <FieldGroup>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Category name
                </label>
                <Input {...field} placeholder="e.g. Nutrition Basics" className="h-11" />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Type
                </label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <FileUpload
          label="Featured image"
          previewType="image"
          value={selectedImage}
          onUpload={async (file) => setSelectedImage(file)}
          className="h-44"
        />

        <Controller
          name="imageAlt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Image alt text
              </label>
              <Input {...field} value={field.value ?? ""} placeholder="Accessible image description" className="h-11" />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Description
              </label>
              <Textarea
                {...field}
                value={field.value ?? ""}
                placeholder="Write a short context for editors and admins."
                className="min-h-32"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-white/10">
        <SubmitButton
          type="submit"
          disabled={!isValid}
          loading={isSubmitting}
          className="bg-[var(--brand-600)] px-6 text-white hover:bg-[var(--brand-700)] dark:bg-[var(--brand-500)] dark:hover:bg-[var(--brand-400)]"
        >
          {category?.id ? "Update Category" : "Create Category"}
        </SubmitButton>
      </div>
    </form>
  );
};
