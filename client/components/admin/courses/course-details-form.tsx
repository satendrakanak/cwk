"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseDetailsSchema } from "@/schemas/courses";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { courseClientService } from "@/services/courses/course.client";
import { Course } from "@/types/course";
import { SubmitButton } from "@/components/submit-button";
import { getErrorMessage } from "@/lib/error-handler";
import { Input } from "@/components/ui/input";

interface CourseDetailsFormProps {
  course: Course;
}

export const CourseDetailsForm = ({ course }: CourseDetailsFormProps) => {
  const router = useRouter();

  const form = useForm<z.input<typeof courseDetailsSchema>>({
    resolver: zodResolver(courseDetailsSchema),
    mode: "onChange",
    defaultValues: {
      duration: course.duration ?? "",
      experienceLevel: course.experienceLevel ?? "",
      language: course.language ?? "",
      certificate: course.certificate ?? "",
      exams: course.exams ?? "",
      studyMaterial: course.studyMaterial ?? "",
      additionalBook: course.additionalBook ?? "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: z.input<typeof courseDetailsSchema>) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value?.trim() ? value : "",
        ]),
      );

      await courseClientService.update(course.id, payload);

      router.refresh();
      toast.success("Course details updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        Course Details
      </h3>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Duration */}
          <Controller
            name="duration"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Duration"
                className="h-11 w-full rounded-xl px-3 text-sm"
              />
            )}
          />

          {/* Experience */}
          <Controller
            name="experienceLevel"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Experience Level"
                className="h-11 w-full rounded-xl px-3 text-sm"
              />
            )}
          />

          {/* Language */}
          <Controller
            name="language"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Language"
                className="h-11 w-full rounded-xl px-3 text-sm"
              />
            )}
          />

          {/* Certificate */}
          <Controller
            name="certificate"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Certificate"
                className="h-11 w-full rounded-xl px-3 text-sm"
              />
            )}
          />

          {/* Exams */}
          <Controller
            name="exams"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Exams"
                className="h-11 w-full rounded-xl px-3 text-sm"
              />
            )}
          />

          {/* Study Material */}
          <Controller
            name="studyMaterial"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Study Material"
                className="h-11 w-full rounded-xl px-3 text-sm"
              />
            )}
          />

          {/* Book */}
          <Controller
            name="additionalBook"
            control={form.control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Additional Book"
                className="h-11 w-full rounded-xl px-3 text-sm"
              />
            )}
          />
        </div>

        {/* Submit */}
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
