"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-handler";
import { User } from "@/types/user";
import { userBasicSchema } from "@/schemas/user";
import { userClientService } from "@/services/users/user.client";

interface UserBasicInfoFormProps {
  user: User;
}

export const UserBasicInfoForm = ({ user }: UserBasicInfoFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof userBasicSchema>>({
    resolver: zodResolver(userBasicSchema),
    mode: "onChange",
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      username: user.username || "",
      canRequestRefund: user.canRequestRefund ?? false,
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof userBasicSchema>) => {
    try {
      await userClientService.update(user.id, data);
      router.refresh();
      toast.success("User updated successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-6">
        <h3 className="font-semibold">Basic Info</h3>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 🔥 GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="First Name" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Last Name */}
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="Last Name" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Username */}
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="Username" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="Email" type="email" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Phone */}
            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input {...field} placeholder="Phone Number" />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-card-foreground">
                Refund Request Access
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Allow this user to initiate refund requests from their orders.
              </p>
            </div>

            <Controller
              name="canRequestRefund"
              control={form.control}
              render={({ field }) => (
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                  className="cursor-pointer"
                />
              )}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <SubmitButton
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
              loadingText="Updating..."
              className="px-6"
            >
              Update
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
