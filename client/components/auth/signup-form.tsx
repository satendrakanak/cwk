"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, UserPlus } from "lucide-react";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { toast } from "sonner";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CardWrapper } from "./card-wrapper";
import { registerFormSchema } from "@/schemas";
import { authService } from "@/services/auth.service";
import { SubmitButton } from "../submit-button";
import { SignupVerificationDialog } from "./signup-verification-dialog";
import { getErrorMessage } from "@/lib/error-handler";

export function SignupForm() {
  const [error, setError] = useState<string>("");
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [maskedVerificationEmail, setMaskedVerificationEmail] = useState("");
  const [pendingSignupData, setPendingSignupData] = useState<z.infer<
    typeof registerFormSchema
  > | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;
  const isLoading = isSubmitting;

  const onSubmit = async (data: z.infer<typeof registerFormSchema>) => {
    try {
      setError("");

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
      };

      const response = await authService.register(payload);

      setPendingSignupData(data);
      setVerificationEmail(data.email);
      setMaskedVerificationEmail(response.data?.maskedEmail || data.email);
      setVerificationOpen(true);

      toast.success("Verification code sent to your email");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleVerifyOtp = async (code: string) => {
    try {
      setIsVerifyingOtp(true);

      await authService.verifySignupOtp({
        email: verificationEmail,
        code,
      });

      toast.success("Your account is verified and ready.");
      setVerificationOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingSignupData) return;

    try {
      const payload = {
        firstName: pendingSignupData.firstName,
        lastName: pendingSignupData.lastName,
        email: pendingSignupData.email,
        phoneNumber: pendingSignupData.phoneNumber,
        password: pendingSignupData.password,
      };

      const response = await authService.register(payload);

      setMaskedVerificationEmail(
        response.data?.maskedEmail || pendingSignupData.email,
      );

      toast.success("A fresh verification code has been sent");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const inputClass =
    "h-12 rounded-2xl border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-none transition focus-visible:border-primary focus-visible:ring-primary";

  const labelClass = "text-sm font-semibold text-foreground";

  return (
    <>
      <CardWrapper
        headerLabel="Create your account"
        backButtonLabel="Already have an account?"
        backButtonHref="/auth/sign-in"
        showSocial
        imageUrl="/assets/register-form.jpg"
        alt="Signup form image"
        width={600}
        height={900}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldGroup className="gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className={labelClass}>First name</FieldLabel>

                    <Input
                      {...field}
                      placeholder="John"
                      className={inputClass}
                    />

                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className={labelClass}>Last name</FieldLabel>

                    <Input
                      {...field}
                      placeholder="Doe"
                      className={inputClass}
                    />

                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className={labelClass}>Email address</FieldLabel>

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
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className={labelClass}>Phone number</FieldLabel>

                  <div className="overflow-hidden rounded-2xl border border-border bg-muted text-foreground transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/45">
                    <PhoneInput
                      defaultCountry="in"
                      value={field.value}
                      onChange={(phone) => field.onChange(phone)}
                      inputClassName="!h-12 !w-full !border-0 !bg-transparent !px-3 !text-sm !text-foreground !outline-none !ring-0 placeholder:!text-muted-foreground"
                      countrySelectorStyleProps={{
                        buttonClassName:
                          "!h-12 !border-0 !bg-transparent !px-3 hover:!bg-accent",
                        dropdownStyleProps: {
                          className:
                            "!z-50 !rounded-2xl !border !border-border !bg-popover !shadow-xl",
                        },
                      }}
                    />
                  </div>

                  {fieldState.error ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className={labelClass}>Password</FieldLabel>

                    <Input
                      {...field}
                      type="password"
                      placeholder="Create password"
                      className={inputClass}
                    />

                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className={labelClass}>
                      Confirm password
                    </FieldLabel>

                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm password"
                      className={inputClass}
                    />

                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />
            </div>

            {error ? (
              <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-300/20 dark:bg-red-300/10 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <SubmitButton
              type="submit"
              disabled={!isValid || isLoading}
              loading={isLoading}
              loadingText="Sending code..."
              className="academy-btn-primary h-12 w-full text-base disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </SubmitButton>
          </FieldGroup>
        </form>
      </CardWrapper>

      <SignupVerificationDialog
        open={verificationOpen}
        onOpenChange={setVerificationOpen}
        maskedEmail={maskedVerificationEmail}
        isSubmitting={isVerifyingOtp}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />
    </>
  );
}
