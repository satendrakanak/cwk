"use client";

import * as z from "zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { metaSchema } from "@/schemas/courses";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { useEffect, useState } from "react";
import { slugify } from "@/utils/slugify";
import { getErrorMessage } from "@/lib/error-handler";
import { Article } from "@/types/article";
import { articleClientService } from "@/services/articles/article.client";

interface MetaFormProps {
  article: Article;
}

const MAX_TITLE = 60;
const MAX_DESC = 160;
const MAX_SLUG = 100;

export const MetaForm = ({ article }: MetaFormProps) => {
  const router = useRouter();

  const [manualSlug, setManualSlug] = useState(false);

  const form = useForm<z.input<typeof metaSchema>>({
    resolver: zodResolver(metaSchema),
    mode: "onChange",
    defaultValues: {
      metaTitle: article.metaTitle ?? article.title ?? "",
      metaDescription: article.metaDescription ?? "",
      metaSlug: article.metaSlug ?? article.slug ?? "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const title = useWatch({ control: form.control, name: "metaTitle" }) || "";
  const slug = useWatch({ control: form.control, name: "metaSlug" }) || "";
  const desc =
    useWatch({ control: form.control, name: "metaDescription" }) || "";

  // 🔥 auto slug generation
  useEffect(() => {
    if (!manualSlug) {
      form.setValue("metaSlug", slugify(title));
    }
  }, [form, manualSlug, title]);

  // 🔥 progress color logic
  const getColor = (len: number, max: number) => {
    if (len === 0) return "bg-gray-300";
    if (len < max * 0.6) return "bg-yellow-400";
    if (len <= max) return "bg-green-500";
    return "bg-red-500";
  };

  const Progress = ({ value, max }: { value: number; max: number }) => {
    const percent = Math.min((value / max) * 100, 100);
    const color = getColor(value, max);

    return (
      <div className="space-y-1">
        <div className="h-1.5 bg-gray-200 rounded">
          <div
            className={`h-1.5 rounded transition-all ${color}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {value}/{max}
        </p>
      </div>
    );
  };

  const onSubmit = async (data: z.input<typeof metaSchema>) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v?.trim() ? v : undefined]),
      );

      await articleClientService.update(article.id, payload);

      router.refresh();
      toast.success("Meta updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Meta (SEO)</h3>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* TITLE */}
        <Controller
          name="metaTitle"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-1">
              <Input
                {...field}
                maxLength={MAX_TITLE}
                placeholder="Meta Title"
                className="h-10 w-full rounded-md px-3 text-sm"
              />
              <Progress value={title.length} max={MAX_TITLE} />
            </div>
          )}
        />

        {/* SLUG */}
        <Controller
          name="metaSlug"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-1">
              <Input
                {...field}
                maxLength={MAX_SLUG}
                placeholder="Meta Slug"
                className="h-10 w-full rounded-md px-3 text-sm"
                onChange={(e) => {
                  setManualSlug(true);
                  field.onChange(e.target.value);
                }}
              />
              <Progress value={slug.length} max={MAX_SLUG} />
            </div>
          )}
        />

        {/* DESCRIPTION */}
        <Controller
          name="metaDescription"
          control={form.control}
          render={({ field }) => (
            <div className="space-y-1">
              <Textarea
                {...field}
                maxLength={MAX_DESC}
                placeholder="Meta Description"
                className="min-h-24 w-full rounded-md p-3 text-sm"
              />
              <Progress value={desc.length} max={MAX_DESC} />
            </div>
          )}
        />

        <div className="flex justify-end">
          <SubmitButton
            type="submit"
            disabled={!isValid}
            loading={isSubmitting}
            className="w-auto px-6"
            loadingText="Updating..."
          >
            Update
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};
