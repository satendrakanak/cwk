"use client";

import * as z from "zod";
import { Course } from "@/types/course";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Controller, useForm, useWatch } from "react-hook-form";
import { SubmitButton } from "@/components/submit-button";
import { pricingSchema } from "@/schemas/courses";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { courseClientService } from "@/services/courses/course.client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";
import { Input } from "@/components/ui/input";

interface PricingFormProps {
  course: Course;
}

export const PricingForm = ({ course }: PricingFormProps) => {
  const router = useRouter();
  const form = useForm<z.input<typeof pricingSchema>>({
    resolver: zodResolver(pricingSchema),
    mode: "onChange",
    defaultValues: {
      isFree: course.isFree ?? false,
      priceInr: course.priceInr ?? "",
      priceUsd: course.priceUsd ?? "",
    },
  });
  const { isValid, isSubmitting } = form.formState;
  const isFree = useWatch({
    control: form.control,
    name: "isFree",
  });

  const onSubmit = async (data: z.input<typeof pricingSchema>) => {
    try {
      const payload = {
        isFree: data.isFree || false,
        priceInr: data.priceInr || "",
        priceUsd: data.priceUsd || "",
      };

      await courseClientService.update(course.id, payload);

      router.refresh();
      toast.success("Course pricing info updated successfully");
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Pricing
        </h3>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          {/* Free Toggle */}
          <Controller
            name="isFree"
            control={form.control}
            render={({ field }) => (
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-white/10 dark:bg-white/4">
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  Free Course
                </span>

                <input
                  type="checkbox"
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="accent-primary h-4 w-4"
                />
              </div>
            )}
          />

          {/* Pricing Fields */}
          <div className="grid gap-3 sm:grid-cols-2">
            {/* INR */}
            <Controller
              name="priceInr"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs">
                      ₹
                    </span>

                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isFree}
                      type="number"
                      placeholder="0"
                      className="h-11 w-full appearance-none rounded-xl border pl-7"
                    />
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* USD */}
            <Controller
              name="priceUsd"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs">
                      $
                    </span>

                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isFree}
                      type="number"
                      placeholder="0"
                      className="h-11 w-full appearance-none rounded-xl border pl-7"
                    />
                  </div>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
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

      {isFree && (
        <p className="text-[11px] text-green-600 dark:text-emerald-300">
          This course will be free.
        </p>
      )}
    </div>
  );
};
