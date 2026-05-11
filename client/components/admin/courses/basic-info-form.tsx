"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { courseSchema } from "@/schemas/courses";
import { SlugField } from "../slug-field";
import { Course } from "@/types/course";
import { courseClientService } from "@/services/courses/course.client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-handler";

interface BasicInfoFormProps {
  course: Course;
}
export const BasicInfoForm = ({ course }: BasicInfoFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    mode: "onChange",
    defaultValues: {
      title: course.title || "",
      shortDescription: course.shortDescription || "",
      slug: course.slug || "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const title = form.watch("title");
  const slug = form.watch("slug");

  const onSubmit = async (data: z.infer<typeof courseSchema>) => {
    try {
      await courseClientService.update(course.id, data);
      router.refresh();
      toast.success("Course basic info updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <Card className="rounded-2xl border bg-white shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardContent className="space-y-6 p-5 sm:p-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Basic Info</h3>
          <p className="text-sm text-muted-foreground">
            Update your course basic information
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
                    className="mb-0 h-11"
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
                onChange={(val) =>
                  form.setValue("slug", val, { shouldValidate: true })
                }
              />
            )}

            {/* Description */}
            <Controller
              name="shortDescription"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Textarea
                    {...field}
                    placeholder="Write a short description..."
                    className="min-h-32"
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
