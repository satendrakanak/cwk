"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import { Course } from "@/types/course";
import { CouponMap } from "@/types/coupon";
import { couponClientService } from "@/services/coupons/coupon.client";
import { CourseCard } from "../courses/course-card";

interface RelatedCoursesProps {
  courses: Course[];
}

export const RelatedCourses = ({ courses }: RelatedCoursesProps) => {
  const [couponMap, setCouponMap] = useState<CouponMap>({});

  useEffect(() => {
    if (!courses?.length) return;

    const run = async () => {
      try {
        const res = await couponClientService.autoApplyBulk({
          courses: courses.map((course) => ({
            id: course.id,
            price: Number(course.priceInr),
          })),
        });

        setCouponMap(res.data?.data || {});
      } catch {
        setCouponMap({});
      }
    };

    run();
  }, [courses]);

  if (!courses?.length) return null;

  return (
    <section className="py-16">
      <div className="academy-card p-5 md:p-6">
        <div className="mb-8 flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Keep Learning
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-card-foreground lg:text-3xl">
              Related Courses
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Explore more courses similar to this one.
            </p>
          </div>

          <div className="hidden items-center gap-2 text-sm font-semibold text-primary md:flex">
            Swipe to explore
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        <div className="related-courses-slider">
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 1.08, spaceBetween: 14 },
              640: { slidesPerView: 2, spaceBetween: 18 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 20 },
            }}
          >
            {courses.map((course) => (
              <SwiperSlide key={course.id} className="h-auto">
                <div className="h-full pb-2">
                  <CourseCard
                    course={course}
                    coupon={couponMap[course.id] || null}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};
