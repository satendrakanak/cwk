"use client";

import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/error-handler";
import { changePasswordSchema } from "@/schemas/profile";
import { userClientService } from "@/services/users/user.client";

export function ChangePasswordForm() {
  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof changePasswordSchema>) => {
    try {
      await userClientService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success("Password updated successfully");
      form.reset();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const inputClass =
    "h-12 rounded-2xl border-border bg-muted px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-none transition focus-visible:border-primary focus-visible:ring-primary";

  return (
    <section className="academy-card p-5 md:p-6">
      <div className="flex items-start gap-3 border-b border-border pb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <LockKeyhole className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Security
          </p>

          <h3 className="mt-2 text-2xl font-semibold text-card-foreground">
            Change password
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Update your password to keep your learning account secure.
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <FieldGroup className="gap-5">
          <Controller
            name="currentPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-sm font-semibold text-card-foreground">
                  Current password
                </FieldLabel>

                <Input
                  {...field}
                  type="password"
                  placeholder="Enter current password"
                  className={inputClass}
                />

                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />

          <Controller
            name="newPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-sm font-semibold text-card-foreground">
                  New password
                </FieldLabel>

                <Input
                  {...field}
                  type="password"
                  placeholder="Enter new password"
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
                <FieldLabel className="text-sm font-semibold text-card-foreground">
                  Confirm password
                </FieldLabel>

                <Input
                  {...field}
                  type="password"
                  placeholder="Confirm new password"
                  className={inputClass}
                />

                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : null}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-muted-foreground">
            Use a strong password that you do not reuse on other websites.
          </p>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="h-11 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Update Password
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
