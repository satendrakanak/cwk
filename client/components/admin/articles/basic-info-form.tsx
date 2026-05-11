"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useWatch } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { courseSchema } from "@/schemas/courses";
import { SlugField } from "../slug-field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-handler";
import { Article } from "@/types/article";
import { articleSchema } from "@/schemas/articles";
import { articleClientService } from "@/services/articles/article.client";

interface BasicInfoFormProps {
  article: Article;
}
export const BasicInfoForm = ({ article }: BasicInfoFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof articleSchema>>({
    resolver: zodResolver(articleSchema),
    mode: "onChange",
    defaultValues: {
      title: article.title || "",
      slug: article.slug || "",
      excerpt: article.excerpt || "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const title = useWatch({ control: form.control, name: "title" }) ?? "";
  const slug = useWatch({ control: form.control, name: "slug" }) ?? "";

  const onSubmit = async (data: z.infer<typeof courseSchema>) => {
    try {
      await articleClientService.update(article.id, data);
      router.refresh();
      toast.success("Article basic info updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <Card className="rounded-2xl bg-white shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardContent className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Basic Info</h3>
          <p className="text-sm text-muted-foreground">
            Update your article basic information
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldGroup>
            {/* Title */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    placeholder="Enter course title"
                    className="h-10 mb-0"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {title.length > 0 && (
              <SlugField
                title={title}
                value={slug}
                forSlug="article"
                onChange={(val) =>
                  form.setValue("slug", val, { shouldValidate: true })
                }
              />
            )}

            {/* Description */}
            <Controller
              name="excerpt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Textarea
                    {...field}
                    placeholder="Write a excerpt..."
                    className="min-h-30"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {/* Footer */}
          <div className="flex items-center justify-end">
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
      </CardContent>
    </Card>
  );
};
