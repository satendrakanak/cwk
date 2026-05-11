"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";

import { Coupon } from "@/types/coupon";
import { useRouter } from "next/navigation";
import { couponClientService } from "@/services/coupons/coupon.client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { DateRangeTimePicker } from "@/components/ui/date-time-picker";

interface Props {
  coupon: Coupon;
}

const schema = z
  .object({
    validFrom: z.date().nullable(),
    validTill: z.date().nullable(),
  })
  .refine(
    (data) => {
      if (!data.validFrom || !data.validTill) return true;
      return data.validFrom < data.validTill;
    },
    {
      message: "Valid From must be before Valid Till",
      path: ["validTill"],
    },
  );

export const CouponValidityForm = ({ coupon }: Props) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      validFrom: coupon.validFrom ? new Date(coupon.validFrom) : null,
      validTill: coupon.validTill ? new Date(coupon.validTill) : null,
    },
  });

  const { isValid, isDirty, isSubmitting, errors } = form.formState;
  const validFrom = useWatch({ control: form.control, name: "validFrom" });
  const validTill = useWatch({ control: form.control, name: "validTill" });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await couponClientService.update(coupon.id, {
        validFrom: data.validFrom,
        validTill: data.validTill,
      });

      router.refresh();
      toast.success("Coupon validity updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card className="dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Validity</h3>
          <p className="text-sm text-muted-foreground">
            Select date & time range
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldGroup>
            <Field data-invalid={!!errors.validTill}>
              <DateRangeTimePicker
                value={{
                  from: validFrom,
                  to: validTill,
                }}
                onChange={({ from, to }) => {
                  form.setValue("validFrom", from, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });

                  form.setValue("validTill", to, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />

              {errors.validTill && <FieldError errors={[errors.validTill]} />}
            </Field>
          </FieldGroup>

          {/* Footer */}
          <div className="flex justify-end">
            <SubmitButton
              type="submit"
              disabled={!isDirty || !isValid}
              loading={isSubmitting}
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
