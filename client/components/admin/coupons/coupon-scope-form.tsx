"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Coupon } from "@/types/coupon";
import { useRouter } from "next/navigation";
import { couponClientService } from "@/services/coupons/coupon.client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";

enum CouponScope {
  GLOBAL = "GLOBAL",
  COURSE = "COURSE",
}

interface Props {
  coupon: Coupon;
}

const schema = z.object({
  scope: z.nativeEnum(CouponScope),
});

export const CouponScopeForm = ({ coupon }: Props) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      scope: coupon.scope || CouponScope.GLOBAL,
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await couponClientService.update(coupon.id, {
        scope: data.scope,
        applicableCourseIds: data.scope === CouponScope.GLOBAL ? null : [],
      });

      router.refresh();
      toast.success("Coupon scope updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Coupon Scope</h3>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Controller
            name="scope"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val as CouponScope)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select coupon scope" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={CouponScope.GLOBAL}>
                      Global (All Courses)
                    </SelectItem>
                    <SelectItem value={CouponScope.COURSE}>
                      Specific Courses
                    </SelectItem>
                  </SelectContent>
                </Select>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* Button */}
        <SubmitButton
          type="submit"
          disabled={!isValid}
          loading={isSubmitting}
          className="w-full h-9 text-sm"
        >
          Save
        </SubmitButton>
      </form>
    </div>
  );
};
