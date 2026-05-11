"use client";

import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { useSession } from "@/context/session-context";
import { getErrorMessage } from "@/lib/error-handler";
import { contactLeadClientService } from "@/services/contact-leads/contact-lead.client";

const contactSchema = z.object({
  fullName: z.string().trim().min(3, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phoneNumber: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[0-9+\-\s()]{10,20}$/.test(value),
      "Enter a valid phone number",
    ),
  subject: z
    .string()
    .trim()
    .min(3, "Subject is required")
    .max(180, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(10, "Message should be a little more detailed"),
});

export function ContactForm() {
  const { user } = useSession();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      fullName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    form.reset({
      fullName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      subject: form.getValues("subject"),
      message: form.getValues("message"),
    });
  }, [form, user]);

  const handleSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      try {
        await contactLeadClientService.create({
          ...values,
          source: "website-contact",
          pageUrl: "/contact",
        });

        toast.success("Your message has been sent");

        form.reset({
          fullName: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
          email: user?.email || "",
          phoneNumber: user?.phoneNumber || "",
          subject: "",
          message: "",
        });
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  });

  const inputClass =
    "h-12 rounded-2xl border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-none transition focus-visible:border-primary focus-visible:ring-primary";

  return (
    <form onSubmit={handleSubmit} className="academy-card p-5 md:p-6">
      <div className="mb-6 rounded-3xl border border-primary/15 bg-primary/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Contact form
            </p>

            <h3 className="mt-2 text-2xl font-semibold text-card-foreground md:text-3xl">
              Tell us what you need.
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              Share your question, program interest, or support request and the
              team will get back to you quickly.
            </p>
          </div>

          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15 md:flex">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
      </div>

      <FieldGroup className="gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field>
            <FieldLabel className="text-sm font-semibold text-card-foreground">
              Full name
            </FieldLabel>

            <Controller
              name="fullName"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Full name"
                  className={inputClass}
                />
              )}
            />

            <FieldError errors={[form.formState.errors.fullName]} />
          </Field>

          <Field>
            <FieldLabel className="text-sm font-semibold text-card-foreground">
              Email address
            </FieldLabel>

            <Controller
              name="email"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="Email address"
                  className={inputClass}
                />
              )}
            />

            <FieldError errors={[form.formState.errors.email]} />
          </Field>

          <Field>
            <FieldLabel className="text-sm font-semibold text-card-foreground">
              Phone number
            </FieldLabel>

            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Phone number"
                  className={inputClass}
                />
              )}
            />

            <FieldError errors={[form.formState.errors.phoneNumber]} />
          </Field>

          <Field>
            <FieldLabel className="text-sm font-semibold text-card-foreground">
              Subject
            </FieldLabel>

            <Controller
              name="subject"
              control={form.control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Subject"
                  className={inputClass}
                />
              )}
            />

            <FieldError errors={[form.formState.errors.subject]} />
          </Field>
        </div>

        <Field>
          <FieldLabel className="text-sm font-semibold text-card-foreground">
            Message
          </FieldLabel>

          <Controller
            name="message"
            control={form.control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Tell us how we can help..."
                rows={7}
                className="min-h-40 resize-none rounded-2xl border-border bg-muted px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground shadow-none transition focus-visible:border-primary focus-visible:ring-primary"
              />
            )}
          />

          <FieldError errors={[form.formState.errors.message]} />
        </Field>
      </FieldGroup>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">
          By submitting, you allow the academy team to contact you about your
          enquiry.
        </p>

        <button
          type="submit"
          disabled={isPending || !form.formState.isValid}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <Send className="h-4 w-4" />
          {isPending ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  );
}
