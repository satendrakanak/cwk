"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Loader2, MailCheck, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { CardWrapper } from "@/components/auth/card-wrapper";
import { authService } from "@/services/auth.service";

export const VerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [, startTransition] = useTransition();

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const onSubmit = useCallback(async () => {
    if (success || error) return;

    if (!token) {
      setError("Missing token!");
      return;
    }

    try {
      await authService.verifyEmail(token);

      setSuccess("Email verified successfully!");

      startTransition(() => {
        router.push("/dashboard?verified=true");
        router.refresh();
      });
    } catch {
      setError("Invalid or expired token!");
    }
  }, [token, success, error, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void onSubmit();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your email"
      backButtonLabel="Back to login"
      backButtonHref="/auth/sign-in"
      imageUrl="/assets/login-form.jpg"
      alt="Email verification form image"
      width={600}
      height={600}
    >
      <div className="flex min-h-56 flex-col items-center justify-center px-4 py-8 text-center">
        {!success && !error ? (
          <>
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <Loader2 className="h-10 w-10 animate-spin" />
            </div>

            <h2 className="text-2xl font-semibold text-foreground">
              Verifying your email
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">
              Please wait while we confirm your email address and prepare your
              learning dashboard.
            </p>
          </>
        ) : null}

        {success ? (
          <div className="w-full rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-center dark:border-emerald-300/20 dark:bg-emerald-300/10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-emerald-700 ring-1 ring-emerald-100 dark:bg-white/10 dark:text-emerald-300 dark:ring-white/10">
              <MailCheck className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-semibold text-emerald-800 dark:text-emerald-300">
              Email verified
            </h2>

            <p className="mt-2 text-sm leading-6 text-emerald-700 dark:text-emerald-200">
              {success} Redirecting you to your dashboard.
            </p>
          </div>
        ) : null}

        {!success && error ? (
          <div className="w-full rounded-3xl border border-red-100 bg-red-50 p-5 text-center dark:border-red-300/20 dark:bg-red-300/10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-red-700 ring-1 ring-red-100 dark:bg-white/10 dark:text-red-300 dark:ring-white/10">
              <AlertCircle className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300">
              Verification failed
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-200">
              {error}
            </p>
          </div>
        ) : null}
      </div>
    </CardWrapper>
  );
};
