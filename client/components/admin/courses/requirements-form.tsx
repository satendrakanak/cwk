"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requirementsSchema } from "@/schemas/courses";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { courseClientService } from "@/services/courses/course.client";
import { Course } from "@/types/course";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { getErrorMessage } from "@/lib/error-handler";

interface RequirementsFormProps {
  course: Course;
}

export const RequirementsForm = ({ course }: RequirementsFormProps) => {
  const router = useRouter();

  const form = useForm<z.input<typeof requirementsSchema>>({
    resolver: zodResolver(requirementsSchema),
    defaultValues: {
      technologyRequirements: course.technologyRequirements ?? "",
      eligibilityRequirements: course.eligibilityRequirements ?? "",
      disclaimer: course.disclaimer ?? "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: z.input<typeof requirementsSchema>) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          value?.trim() ? value : "",
        ]),
      );

      await courseClientService.update(course.id, payload);

      router.refresh();
      toast.success("Requirements updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        Requirements
      </h3>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Technology */}
        <Controller
          name="technologyRequirements"
          control={form.control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Technology Requirements"
              className="w-full min-h-20 text-sm border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
        />

        {/* Eligibility */}
        <Controller
          name="eligibilityRequirements"
          control={form.control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Eligibility Requirements"
              className="w-full min-h-20 text-sm border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
        />

        {/* Disclaimer */}
        <Controller
          name="disclaimer"
          control={form.control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder="Disclaimer"
              className="w-full min-h-20 text-sm border rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
        />

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
    </div>
  );
};
