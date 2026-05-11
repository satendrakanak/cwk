"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";

import { Coupon } from "@/types/coupon";
import { useRouter } from "next/navigation";
import { couponDiscountSchema } from "@/schemas/coupon";
import { couponClientService } from "@/services/coupons/coupon.client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { SubmitButton } from "@/components/submit-button";

interface CouponDiscountFormProps {
  coupon: Coupon;
}

export const CouponDiscountForm = ({ coupon }: CouponDiscountFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof couponDiscountSchema>>({
    resolver: zodResolver(couponDiscountSchema),
    mode: "onChange",
    defaultValues: {
      value: coupon.value ? parseFloat(String(coupon.value)) : undefined,
      maxDiscount: coupon.maxDiscount
        ? parseFloat(String(coupon.maxDiscount))
        : undefined,
      minOrderValue: coupon.minOrderValue
        ? parseFloat(String(coupon.minOrderValue))
        : undefined,
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof couponDiscountSchema>) => {
    try {
      await couponClientService.update(coupon.id, data);
      router.refresh();
      toast.success("Coupon discount updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <Card className="dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardContent className="p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Discount Settings</h3>
          <p className="text-sm text-muted-foreground">
            Configure discount value and limits
          </p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldGroup>
            {/* Value */}
            <Controller
              name="value"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                    placeholder="Enter a coupon value"
                    className="h-10 mb-0"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Max Discount */}
            <Controller
              name="maxDiscount"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                    placeholder="Enter a max discount"
                    className="h-10 mb-0"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Min Order Value */}
            <Controller
              name="minOrderValue"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                    placeholder="Enter a min order value"
                    className="h-10 mb-0"
                  />
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
              className="w-auto px-6"
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
