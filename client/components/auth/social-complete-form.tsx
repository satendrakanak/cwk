"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, MailPlus } from "lucide-react";

import { CardWrapper } from "./card-wrapper";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "../submit-button";
import { authService } from "@/services/auth.service";

const socialEmailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const providerLabelMap: Record<string, string> = {
  google: "Google",
  apple: "Apple",
  meta: "Meta",
};

export function SocialCompleteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const token = searchParams.get("token") || "";
  const provider = (searchParams.get("provider") || "").toLowerCase();
  const providerLabel = providerLabelMap[provider] || "social provider";
  const inputClass =
    "h-12 rounded-2xl border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-none transition focus-visible:border-primary focus-visible:ring-primary";

  const form = useForm<z.infer<typeof socialEmailSchema>>({
    resolver: zodResolver(socialEmailSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof socialEmailSchema>) => {
    try {
      setError("");

      if (!token) {
        setError("This social login session has expired. Please try again.");
        return;
      }

      const response = await authService.completeSocialAuthEmail({
        token,
        email: values.email,
      });

      startTransition(() => {
        router.refresh();
        router.push(response.data.redirectTo || "/dashboard");
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to continue social login",
      );
    }
  };

  return (
    <CardWrapper
      headerLabel="Complete your social sign in"
      backButtonLabel="Back to login"
      backButtonHref="/auth/sign-in"
      imageUrl="/assets/login-form.jpg"
      alt="Social login completion"
      width={600}
      height={600}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-2xl border border-border bg-muted p-4 text-sm leading-6 text-muted-foreground">
          {providerLabel} did not share your email address with us. Add your
          email once so we can create or link your account and sign you in.
        </div>

        <FieldGroup className="gap-5">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-sm font-semibold text-foreground">
                  Email address
                </FieldLabel>
                <Input
                  {...field}
                  type="email"
                  placeholder="m@example.com"
                  className={inputClass}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          {error ? (
            <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-300/20 dark:bg-red-300/10 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <SubmitButton
            type="submit"
            disabled={!form.formState.isValid || isPending}
            loading={isPending}
            loadingText="Connecting account..."
            className="academy-btn-primary h-12 w-full text-base disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <MailPlus className="h-4 w-4" />
            Continue with {providerLabel}
          </SubmitButton>
        </FieldGroup>
      </form>
    </CardWrapper>
  );
}
