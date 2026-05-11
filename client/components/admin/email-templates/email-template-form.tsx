"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { getErrorMessage } from "@/lib/error-handler";
import { emailTemplateClientService } from "@/services/email-templates/email-template.client";
import { EmailTemplate } from "@/types/email-template";

const RichEditor = dynamic(() => import("@/components/editor/rich-editor"), {
  ssr: false,
});

const emailTemplateSchema = z.object({
  templateName: z.string().min(3, "Min 3 characters").max(255),
  subject: z.string().min(3, "Min 3 characters").max(2048),
  body: z.string().min(8, "Body is required"),
});

type EmailTemplateFormValues = z.infer<typeof emailTemplateSchema>;

export function EmailTemplateForm({
  template,
  onSuccess,
}: {
  template?: EmailTemplate | null;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema),
    mode: "onChange",
    defaultValues: {
      templateName: template?.templateName || "",
      subject: template?.subject || "",
      body: template?.body || "<p></p>",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (data: EmailTemplateFormValues) => {
    try {
      const payload = {
        templateName: data.templateName.trim(),
        subject: data.subject.trim(),
        body: data.body,
      };

      if (template?.id) {
        await emailTemplateClientService.update(template.id, payload);
        toast.success("Email template updated");
      } else {
        await emailTemplateClientService.create(payload);
        toast.success("Email template created");
        form.reset({
          templateName: "",
          subject: "",
          body: "<p></p>",
        });
      }

      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-3xl border border-[var(--brand-100)] bg-[var(--brand-50)]/45 p-4 dark:border-white/10 dark:bg-white/6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-700)]">
          Dynamic variables
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          Use variables like {"{{name}}"}, {"{{courseTitle}}"}, {"{{orderId}}"},{" "}
          {"{{amount}}"}, {"{{coursesList}}"}, {"{{downloadUrl}}"} inside
          subject or body.
        </p>
      </div>

      <FieldGroup>
        <Controller
          name="templateName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Template key
              </label>
              <Input
                {...field}
                placeholder="course_purchase_success"
                className="h-11"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="subject"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Subject
              </label>
              <Input
                {...field}
                placeholder="Your course purchase is confirmed"
                className="h-11"
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="body"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                Email body
              </label>
              <RichEditor value={field.value} onChange={field.onChange} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end">
        <SubmitButton disabled={!isValid} loading={isSubmitting}>
          {template?.id ? "Update Template" : "Create Template"}
        </SubmitButton>
      </div>
    </form>
  );
}
