import { couponServerService } from "@/services/coupons/coupon.server";
import { Coupon } from "@/types/coupon";
import { getErrorMessage } from "@/lib/error-handler";
import { CouponHeader } from "@/components/admin/coupons/coupon-header";
import { CouponDiscountForm } from "@/components/admin/coupons/coupon-discount-form";
import { CouponBasicInfoForm } from "@/components/admin/coupons/coupon-basic-info-form";
import { CouponUsageForm } from "@/components/admin/coupons/coupon-usage-form";
import { CouponValidityForm } from "@/components/admin/coupons/coupon-validity-form";
import { RightSidebar } from "@/components/admin/coupons/right-sidebar";
import { CouponCoursesForm } from "@/components/admin/coupons/coupon-courses-form";
import { Course } from "@/types/course";
import { courseServerService } from "@/services/courses/course.server";

export default async function CouponIdPage({
  params,
}: {
  params: Promise<{ couponId: string }>;
}) {
  const { couponId } = await params;

  let courses: Course[] = [];

  try {
    const response = await courseServerService.getAll();
    courses = response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  let coupon: Coupon;

  try {
    const response = await couponServerService.getById(couponId);
    coupon = response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  return (
    <div>
      <CouponHeader coupon={coupon} />

      <div className="grid grid-cols-5 gap-6 py-6">
        <div className="col-span-4 space-y-6">
          <CouponBasicInfoForm coupon={coupon} />
          <CouponDiscountForm coupon={coupon} />
          <CouponCoursesForm coupon={coupon} courses={courses} />
          <CouponUsageForm coupon={coupon} />
          <CouponValidityForm coupon={coupon} />
        </div>

        <div className="col-span-1">
          <RightSidebar coupon={coupon} />
        </div>
      </div>
    </div>
  );
}
