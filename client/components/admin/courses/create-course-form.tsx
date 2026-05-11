"use client";

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { courseClientService } from "@/services/courses/course.client";
import { getErrorMessage } from "@/lib/error-handler";

const schema = z.object({
  title: z.string().min(3, "Title required"),
});

interface CreateCourseFormProps {
  onSuccess?: (courseId: number) => void;
}

export const CreateCourseForm = ({ onSuccess }: CreateCourseFormProps) => {
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
      const response = await courseClientService.create(data);
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
        <h4 className="text-sm font-semibold">Create Course</h4>
        <p className="text-xs text-muted-foreground">
          Start by giving your course a name
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
                  placeholder="e.g. React Mastery"
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
