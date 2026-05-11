import { Course } from "@/types/course";

interface CoursePriceProps {
  course: Course;
  discount: number | null;
  finalAmount: number | null;
  couponCode?: string;
}

export default function CoursePrice({
  course,
  discount,
  finalAmount,
  couponCode,
}: CoursePriceProps) {
  const hasDiscount = Boolean(discount && discount > 0);

  const formatPrice = (value: number | string | null | undefined) =>
    new Intl.NumberFormat("en-IN").format(Number(value || 0));

  return (
    <div className="rounded-2xl border border-border bg-muted/50 p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">
        Course Price
      </p>

      {hasDiscount ? (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <span className="text-3xl font-bold leading-none text-card-foreground">
              ₹{formatPrice(finalAmount)}
            </span>

            <span className="text-base font-semibold text-muted-foreground line-through">
              ₹{formatPrice(course.priceInr)}
            </span>
          </div>

          <div className="mt-3 inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            🎉 {couponCode || "Coupon"} applied
          </div>
        </>
      ) : (
        <span className="text-3xl font-bold leading-none text-card-foreground">
          ₹{formatPrice(course.priceInr)}
        </span>
      )}
    </div>
  );
}
