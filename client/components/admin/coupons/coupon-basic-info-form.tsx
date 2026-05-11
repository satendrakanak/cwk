"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/error-handler";
import { Coupon } from "@/types/coupon";
import { couponSchema } from "@/schemas/coupon";
import { couponClientService } from "@/services/coupons/coupon.client";

interface CouponBasicInfoFormProps {
  coupon: Coupon;
}
export const CouponBasicInfoForm = ({ coupon }: CouponBasicInfoFormProps) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof couponSchema>>({
    resolver: zodResolver(couponSchema),
    mode: "onChange",
    defaultValues: {
      code: coupon.code || "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof couponSchema>) => {
    try {
      await couponClientService.update(coupon.id, data);
      router.refresh();
      toast.success("Coupon basic info updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <Card className="rounded-2xl border bg-white shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Basic Info</h3>
          <p className="text-sm text-muted-foreground">
            Update your coupon basic information
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldGroup>
            {/* Title */}
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    placeholder="Enter a coupon code"
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
