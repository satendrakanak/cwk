"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, MailCheck, Send } from "lucide-react";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CardWrapper } from "./card-wrapper";
import { fogotPasswordFormSchema } from "@/schemas";
import { authService } from "@/services/auth.service";
import { SubmitButton } from "../submit-button";

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  const form = useForm<z.infer<typeof fogotPasswordFormSchema>>({
    resolver: zodResolver(fogotPasswordFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof fogotPasswordFormSchema>) => {
    try {
      setError("");

      await authService.forgotPassword(data);

      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const inputClass =
    "h-12 rounded-2xl border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-none transition focus-visible:border-primary focus-visible:ring-primary";

  if (isSuccess) {
    return (
      <CardWrapper
        headerLabel="Check your email"
        backButtonLabel="Back to login"
        backButtonHref="/auth/sign-in"
        imageUrl="/assets/login-form.jpg"
        alt="Password reset verification"
        width={600}
        height={600}
      >
        <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <MailCheck className="h-10 w-10" />
          </div>

          <h2 className="text-2xl font-semibold text-foreground">
            Verify your email
          </h2>

          <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
            We’ve sent a password reset link to your email address. Please check
            your inbox and open the link to reset your password.
          </p>

          <div className="my-5 h-0.5 w-12 rounded-full bg-border" />

          <p className="rounded-2xl border border-border bg-muted p-3 text-xs leading-5 text-muted-foreground">
            Didn’t receive it? Check your spam folder or submit the request
            again.
          </p>
        </div>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      headerLabel="Forgot your password?"
      backButtonLabel="Back to sign in"
      backButtonHref="/auth/sign-in"
      imageUrl="/assets/login-form.jpg"
      alt="Forgot password form image"
      width={600}
      height={600}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
            loadingText="Sending link..."
            className="academy-btn-primary h-12 w-full text-base disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <Send className="h-4 w-4" />
            Send reset link
          </SubmitButton>
        </FieldGroup>
      </form>
    </CardWrapper>
  );
}
