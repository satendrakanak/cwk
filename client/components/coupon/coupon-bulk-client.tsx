"use client";

import { useEffect, useState } from "react";
import { couponClientService } from "@/services/coupons/coupon.client";
import { Course } from "@/types/course";
import { CourseCard } from "../courses/course-card";
import { useLicenseSummary } from "@/hooks/use-license-summary";
import { isLicenseFeatureEnabled } from "@/lib/license/feature-access";

type CouponApplyResponse = {
  couponId: number;
  code: string;
  discount: number;
  finalAmount: number;
};

type CouponMap = Record<number, CouponApplyResponse | null>;

type Props = {
  courses: Course[];
};

export const CouponBulkClient = ({ courses }: Props) => {
  const [couponMap, setCouponMap] = useState<CouponMap>({});
  const { summary, isLoading } = useLicenseSummary();

  useEffect(() => {
    if (!courses.length || isLoading || !isLicenseFeatureEnabled(summary, "coupons")) {
      return;
    }

    const run = async () => {
      try {
        const res = await couponClientService.autoApplyBulk({
          courses: courses.map((c) => ({
            id: c.id,
            price: Number(c.priceInr),
          })),
        });

        setCouponMap(res.data.data || {});
      } catch (e) {
        console.error("❌ BULK FAILED", e);
      }
    };

    run();
  }, [courses, isLoading, summary]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          coupon={couponMap[course.id]}
        />
      ))}
    </div>
  );
};
