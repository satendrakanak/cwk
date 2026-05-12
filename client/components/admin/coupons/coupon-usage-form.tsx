"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Coupon } from "@/types/coupon";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { couponUsageSchema } from "@/schemas/coupon";
import { couponClientService } from "@/services/coupons/coupon.client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";

interface CouponUsageFormProps {
  coupon: Coupon;
}

export const CouponUsageForm = ({ coupon }: CouponUsageFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof couponUsageSchema>>({
    resolver: zodResolver(couponUsageSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      usageLimit: coupon.usageLimit ?? undefined,
      perUserLimit: coupon.perUserLimit ?? undefined,
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof couponUsageSchema>) => {
    try {
      await couponClientService.update(coupon.id, {
        usageLimit: data.usageLimit ?? null,
        perUserLimit: data.perUserLimit ?? 1,
      });
      router.refresh();
      toast.success("Coupon usage updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold">Usage Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure usage limits for this coupon
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldGroup>
            {/* Usage Limit */}
            <Controller
              name="usageLimit"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Total redemption limit</FieldLabel>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value.replace(/\D/g, "");
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                    placeholder="Unlimited"
                  />
                  <FieldDescription>
                    Maximum number of times this coupon can be used across all
                    learners. Leave blank for unlimited.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Per User Limit */}
            <Controller
              name="perUserLimit"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Limit per learner</FieldLabel>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value.replace(/\D/g, "");
                      field.onChange(value === "" ? undefined : Number(value));
                    }}
                    placeholder="1"
                  />
                  <FieldDescription>
                    How many successful orders one learner can use this coupon
                    on. Keep it 1 for first-use-only coupons.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {/* Footer */}
          <div className="flex items-center justify-end">
            <SubmitButton
              type="submit"
              disabled={!isValid}
              loading={isSubmitting}
              className="px-6"
              loadingText="Updating..."
            >
              Update
            </SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
