"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LogIn } from "lucide-react";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CardWrapper } from "./card-wrapper";
import { SubmitButton } from "../submit-button";
import { loginFormSchema } from "@/schemas";
import { authService } from "@/services/auth.service";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export function LoginForm() {
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryError = searchParams.get("error");

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof loginFormSchema>) => {
    try {
      setError("");

      await authService.login(data);

      const rawCallbackUrl = searchParams.get("callbackUrl");
      const callbackUrl =
        rawCallbackUrl &&
        rawCallbackUrl.startsWith("/") &&
        !rawCallbackUrl.startsWith("//")
          ? rawCallbackUrl
          : DEFAULT_LOGIN_REDIRECT;

      startTransition(() => {
        router.refresh();
        router.push(callbackUrl);
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const isLoading = isSubmitting || isPending;

  const inputClass =
    "h-12 rounded-2xl border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-none transition focus-visible:border-primary focus-visible:ring-primary";
  const labelClass = "text-sm font-semibold text-foreground";

  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/sign-up"
      showSocial
      imageUrl="/assets/login-form.jpg"
      alt="Login form image"
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
                <FieldLabel className={labelClass}>
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

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel className={labelClass}>
                    Password
                  </FieldLabel>

                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-semibold text-primary transition hover:text-primary/85 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  {...field}
                  type="password"
                  placeholder="Enter your password"
                  className={inputClass}
                />

                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          {error || queryError ? (
            <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-300/20 dark:bg-red-300/10 dark:text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error || queryError}</span>
            </div>
          ) : null}

          <SubmitButton
            type="submit"
            disabled={!isValid || isLoading}
            loading={isLoading}
            loadingText="Logging you in..."
            className="academy-btn-primary h-12 w-full text-base disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <LogIn className="h-4 w-4" />
            Login
          </SubmitButton>
        </FieldGroup>
      </form>
    </CardWrapper>
  );
}
