"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { tagClientService } from "@/services/tags/tag.client";
import { Tag } from "@/types/tag";
import { slugify } from "@/utils/slugify";
import { getErrorMessage } from "@/lib/error-handler";

const tagFormSchema = z.object({
  name: z.string().min(3, "Min 3 characters").max(96, "Max 96 characters"),
  description: z.string().optional(),
});

interface CreateTagFormProps {
  tag?: Tag;
  onSuccess?: () => void;
}

export const CreateTagForm = ({ tag, onSuccess }: CreateTagFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof tagFormSchema>>({
    resolver: zodResolver(tagFormSchema),
    mode: "onChange",
    defaultValues: {
      name: tag?.name || "",
      description: tag?.description || "",
    },
  });

  useEffect(() => {
    form.reset({
      name: tag?.name || "",
      description: tag?.description || "",
    });
  }, [tag, form]);

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof tagFormSchema>) => {
    try {
      const payload = {
        name: data.name.trim(),
        slug: slugify(data.name),
        description: data.description?.trim() || undefined,
      };

      if (tag?.id) {
        await tagClientService.update(tag.id, payload);
        toast.success("Tag updated successfully");
      } else {
        await tagClientService.create(payload);
        toast.success("Tag created successfully");
        form.reset({
          name: "",
          description: "",
        });
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
          Shared tag
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Tags are reusable across both courses and articles, so keep names short and evergreen.
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Tag name
              </label>
              <Input {...field} placeholder="e.g. ayurveda, yoga, wellness" className="h-11" />
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
                placeholder="Optional internal context for editors."
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
          {tag?.id ? "Update Tag" : "Create Tag"}
        </SubmitButton>
      </div>
    </form>
  );
};
