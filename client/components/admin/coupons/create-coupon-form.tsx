"use client";

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { couponClientService } from "@/services/coupons/coupon.client";

const schema = z.object({
  code: z.string().min(3, "Code required"),
});

interface CreateCouponFormProps {
  onSuccess?: (couponId: number) => void;
}

export const CreateCouponForm = ({ onSuccess }: CreateCouponFormProps) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      code: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const response = await couponClientService.create(data);
      onSuccess?.(response.data.id);
      form.reset();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <div className="w-full max-w-none">
      {/* Header */}
      <div>
        <h4 className="text-sm font-semibold">Create Coupon</h4>
        <p className="text-xs text-muted-foreground">Create a new coupon</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-2">
        <FieldGroup>
          {/* Title */}
          <Controller
            name="code"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Input {...field} placeholder="e.g. 'OFF25'" className="h-11" />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        {/* Footer */}
        <div className="flex justify-end">
          <SubmitButton
            type="submit"
            disabled={!isValid}
            loading={isSubmitting}
            className="w-auto px-6"
          >
            Create
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};
