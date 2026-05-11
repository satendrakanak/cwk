"use client";

import * as z from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Course } from "@/types/course";
import { courseFaqsSchema } from "@/schemas/courses";
import { courseClientService } from "@/services/courses/course.client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { getErrorMessage } from "@/lib/error-handler";

interface CourseFaqsFormProps {
  course: Course;
}
type CourseFaqsFormValues = z.input<typeof courseFaqsSchema>;
export function CourseFaqsForm({ course }: CourseFaqsFormProps) {
  const router = useRouter();
  const form = useForm<CourseFaqsFormValues>({
    resolver: zodResolver(courseFaqsSchema),
    mode: "onChange",
    defaultValues: {
      faqs: course.faqs?.length
        ? course.faqs.map((faq) => ({
            question: faq.question ?? "",
            answer: faq.answer ?? "",
          }))
        : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs",
  });

  const onSubmit = async (data: CourseFaqsFormValues) => {
    try {
      const sanitizedFaqs =
        data.faqs &&
        data.faqs
          .map((faq) => ({
            question: faq.question.trim(),
            answer: faq.answer.trim(),
          }))
          .filter((faq) => faq.question && faq.answer);

      await courseClientService.update(course.id, {
        faqs: sanitizedFaqs,
      });

      router.refresh();
      toast.success("Course FAQs updated successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_50px_-40px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-700)] dark:text-[var(--brand-200)]">
            Course FAQs
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
            Add learner-ready answers
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-300">
            FAQs appear on the public course page after testimonials. Use short,
            direct questions and practical answers.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="rounded-2xl"
          onClick={() => append({ question: "", answer: "" })}
        >
          <Plus className="size-4" />
          Add FAQ
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup className="gap-5">
          {fields.length ? (
            fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    FAQ {index + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <Field>
                    <FieldLabel>Question</FieldLabel>
                    <Input
                      {...form.register(`faqs.${index}.question`)}
                      className="h-12 rounded-2xl px-4"
                      placeholder="e.g. Is this course suitable for beginners?"
                    />
                    <FieldError
                      errors={[form.formState.errors.faqs?.[index]?.question]}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Answer</FieldLabel>
                    <Textarea
                      {...form.register(`faqs.${index}.answer`)}
                      rows={5}
                      className="min-h-32 rounded-2xl px-4 py-3"
                      placeholder="Add a crisp, helpful answer for learners."
                    />
                    <FieldError
                      errors={[form.formState.errors.faqs?.[index]?.answer]}
                    />
                  </Field>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No FAQs added yet. Start with the most common learner questions.
              </p>
            </div>
          )}
        </FieldGroup>

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="rounded-2xl px-6"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Updating..." : "Save FAQs"}
          </Button>
        </div>
      </form>
    </div>
  );
}
