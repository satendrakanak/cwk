"use client";

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { userClientService } from "@/services/users/user.client";
const adminCreateUserSchema = z.object({
  firstName: z
    .string()
    .min(3, "Min 3 characters")
    .max(96, "First name too long"),
  lastName: z
    .string()
    .max(96, "Last name too long")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Invalid email"),
  phoneNumber: z
    .string()
    .max(15, "Phone too long")
    .optional()
    .or(z.literal("")),
});

interface CreateUserFormProps {
  onSuccess?: (userId?: number) => void;
}

const DEFAULT_USER_PASSWORD = "Temp@1234";

export const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const form = useForm<z.infer<typeof adminCreateUserSchema>>({
    resolver: zodResolver(adminCreateUserSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof adminCreateUserSchema>) => {
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName?.trim() || undefined,
        email: data.email,
        phoneNumber: data.phoneNumber?.trim() || undefined,
        password: DEFAULT_USER_PASSWORD,
      };
      const response = await userClientService.create(payload);

      toast.success("User created successfully");
      form.reset();
      onSuccess?.(response.data.id);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="w-full max-w-none">
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          Create User
        </h4>
        <p className="text-xs text-muted-foreground dark:text-slate-300">
          Add a new user with just the essentials. Username, student role, and default password are handled automatically.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-3">
        <FieldGroup>
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input {...field} placeholder="First name" className="h-11" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input {...field} placeholder="Last name" className="h-11" />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>

        <FieldGroup>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input
                  {...field}
                  placeholder="Email address"
                  className="h-11"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            name="phoneNumber"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input {...field} placeholder="Phone number" className="h-11" />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>

        <div className="rounded-2xl border border-[var(--brand-100)] bg-[var(--brand-50)]/45 p-4 dark:border-white/10 dark:bg-white/6">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Default account setup
          </h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Username
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                Auto-generated
              </p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Password
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                {DEFAULT_USER_PASSWORD}
              </p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Role
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                student
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <SubmitButton
            type="submit"
            disabled={!isValid}
            loading={isSubmitting}
            className="px-6"
          >
            Create User
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};
