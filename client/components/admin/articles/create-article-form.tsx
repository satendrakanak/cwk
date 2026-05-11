"use client";

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { articleClientService } from "@/services/articles/article.client";
import { slugify } from "@/utils/slugify";

const schema = z.object({
  title: z.string().min(3, "Title required"),
});

interface CreateArticleFormProps {
  onSuccess?: (articleId: number) => void;
}

export const CreateArticleForm = ({ onSuccess }: CreateArticleFormProps) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      title: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const payload = {
        title: data.title,
        slug: slugify(data.title),
      };
      const response = await articleClientService.create(payload);
      onSuccess?.(response.data.id);
      form.reset();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <div className="w-full max-w-none">
      {/* Header */}
      <div>
        <h4 className="text-sm font-semibold">Create Article</h4>
        <p className="text-xs text-muted-foreground">
          Start by giving your article a name
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
        <FieldGroup>
          {/* Title */}
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  placeholder="e.g. The Ultimate Guide to Learning React"
                  className="h-11"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* Footer */}
        <div className="flex justify-end">
          <SubmitButton
            type="submit"
            disabled={!isValid}
            loading={isSubmitting}
            className="w-auto px-6"
          >
            Create
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};
