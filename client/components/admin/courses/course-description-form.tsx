"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { courseDescriptionSchema } from "@/schemas/courses";
import { Course } from "@/types/course";
import { courseClientService } from "@/services/courses/course.client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import RichEditor from "@/components/editor/rich-editor";
import { getErrorMessage } from "@/lib/error-handler";

interface CourseDescriptionProps {
  course: Course;
}
export const CourseDescription = ({ course }: CourseDescriptionProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof courseDescriptionSchema>>({
    resolver: zodResolver(courseDescriptionSchema),
    mode: "onChange",
    defaultValues: {
      description: course.description || "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof courseDescriptionSchema>) => {
    try {
      await courseClientService.update(course.id, data);
      router.refresh();
      toast.success("Course description updated successfully");
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
          <h3 className="text-lg font-semibold">Course Description</h3>
          <p className="text-sm text-muted-foreground">
            Update your course description
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldGroup>
            {/* Description */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <RichEditor
                    value={field.value || ""}
                    onChange={field.onChange}
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
