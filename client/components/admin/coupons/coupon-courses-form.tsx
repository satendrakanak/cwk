"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useWatch } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/submit-button";
import { FieldGroup } from "@/components/ui/field";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { couponClientService } from "@/services/coupons/coupon.client";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error-handler";

import { Coupon, CouponScope } from "@/types/coupon";
import { Course } from "@/types/course";
import { Switch } from "@/components/ui/switch";

const schema = z
  .object({
    applyToAll: z.boolean(),
    applicableCourseIds: z.array(z.number()),
  })
  .refine(
    (data) => {
      if (data.applyToAll) return true;
      return data.applicableCourseIds.length > 0;
    },
    {
      message: "Select at least one course",
      path: ["applicableCourseIds"],
    },
  );

interface CouponCoursesFormProps {
  coupon: Coupon;
  courses: Course[];
}

export const CouponCoursesForm = ({
  coupon,
  courses,
}: CouponCoursesFormProps) => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      applyToAll: coupon.applicableCourseIds === null,
      applicableCourseIds: coupon.applicableCourseIds ?? [],
    },
  });

  const { isValid, isSubmitting, isDirty } = form.formState;

  const applyToAll =
    useWatch({ control: form.control, name: "applyToAll" }) ?? false;
  const selected =
    useWatch({ control: form.control, name: "applicableCourseIds" }) || [];

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleCourse = (id: number) => {
    const current = form.getValues("applicableCourseIds") ?? [];

    let updated: number[];

    if (current.includes(id)) {
      updated = current.filter((c) => c !== id);
    } else {
      updated = [...current, id];
    }

    // 🔥 IMPORTANT: remove duplicates + normalize
    updated = Array.from(new Set(updated));

    form.setValue("applicableCourseIds", updated, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const payload = data.applyToAll
        ? {
            applicableCourseIds: null,
            scope: CouponScope.GLOBAL,
          }
        : {
            applicableCourseIds: data.applicableCourseIds ?? [],
            scope: CouponScope.COURSE,
          };

      await couponClientService.update(coupon.id, payload);

      router.refresh();
      toast.success("Coupon courses updated");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card className="dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))]">
      <CardContent className="p-6 space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Course Applicability</h3>
          <p className="text-sm text-muted-foreground">
            Choose where this coupon should be applied
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldGroup>
            {/* Apply to all */}
            <Controller
              name="applyToAll"
              control={form.control}
              render={({ field }) => {
                const handleToggle = (val: boolean) => {
                  field.onChange(val);

                  if (val) {
                    form.setValue("applicableCourseIds", [], {
                      shouldDirty: true,
                    });
                  }
                };

                return (
                  <div
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-white/10 dark:bg-white/4"
                    onClick={() => handleToggle(!field.value)}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Apply to all courses
                      </p>
                      <p className="text-xs text-muted-foreground">
                        If enabled, coupon will work on all courses
                      </p>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(val) => handleToggle(val)}
                      />
                    </div>
                  </div>
                );
              }}
            />

            {/* Multi select */}
            {!applyToAll && (
              <>
                {/* Search */}
                <Input
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {/* Selected */}
                <div className="flex flex-wrap gap-2">
                  {selected.map((id) => {
                    const course = courses.find((c) => c.id === id);
                    if (!course) return null;

                    return (
                      <Badge key={id} variant="secondary">
                        {course.title}
                      </Badge>
                    );
                  })}
                </div>

                {/* List */}
                <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2 dark:border-white/10 dark:bg-white/4">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted dark:hover:bg-white/8"
                      onClick={() => toggleCourse(course.id)}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(course.id)}
                          onCheckedChange={() => toggleCourse(course.id)}
                        />
                      </div>

                      <span className="text-sm">{course.title}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
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
