"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineRotateLeft } from "react-icons/md";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";

import { Course } from "@/types/course";
import VideoPlayIcon from "../icons/video-play-icon";
import CourseFeatureItem from "./course-feature-item";
import { AddToCartButton } from "../cart/add-to-cart-button";
import { getCourseMeta } from "@/helpers/course-meta";
import { Button } from "../ui/button";
import { useCartStore } from "@/store/cart-store";
import { couponClientService } from "@/services/coupons/coupon.client";
import CoursePrice from "./course-price";
import {
  getCourseDeliveryLabel,
  hasLiveClasses,
  hasRecordedLearning,
} from "@/lib/course-delivery";

interface CourseSidebarCardProps {
  course: Course;
}

export const CourseSidebarCard = ({ course }: CourseSidebarCardProps) => {
  const applyAutoCoupon = useCartStore((state) => state.applyAutoCoupon);

  const [couponData, setCouponData] = useState<{
    code: string;
    discount: number;
    finalAmount: number;
  } | null>(null);

  const [meta, setMeta] = useState({
    totalLectures: 0,
    totalDuration: "0m",
  });

  useEffect(() => {
    let isMounted = true;

    const loadMeta = async () => {
      const data = await getCourseMeta(course);

      if (isMounted) {
        setMeta(data);
      }
    };

    loadMeta();

    return () => {
      isMounted = false;
    };
  }, [course]);

  useEffect(() => {
    applyAutoCoupon();
  }, [applyAutoCoupon, course.id]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const res = await couponClientService.autoApplyCoupon({
          cartTotal: Number(course.priceInr),
          courseIds: [course.id],
        });

        if (isMounted) {
          setCouponData(res.data || null);
        }
      } catch {
        if (isMounted) {
          setCouponData(null);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [course.id, course.priceInr]);

  const discount = couponData?.discount || 0;
  const finalAmount = couponData?.finalAmount || Number(course.priceInr);
  const couponCode = couponData?.code;

  const isEnrolled = course.isEnrolled;
  const percent = course.progress?.progress || 0;
  const delivery = getCourseDeliveryLabel(course.mode);
  const recordedLearning = hasRecordedLearning(course);
  const liveClasses = hasLiveClasses(course);
  const liveOnly = liveClasses && !recordedLearning;

  return (
    <aside className="academy-card overflow-hidden p-4 shadow-[0_28px_90px_color-mix(in_oklab,var(--primary)_14%,transparent)]">
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <Image
          src={course.image?.path || "/placeholder.jpg"}
          alt={course.title || "Course Image"}
          width={950}
          height={600}
          className="aspect-video w-full object-cover"
          priority
        />

        <div className="absolute inset-0 bg-linear-to-t from-foreground/70 via-foreground/10 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center">
          <VideoPlayIcon
            videoUrl={course.video?.path || null}
            isFree={course.chapters?.[0]?.isFree}
            title={course.title}
          />
        </div>

        <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/90 px-3 py-1 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
          <PlayCircle className="h-3.5 w-3.5" />
          Preview
        </div>
      </div>

      <div className="mt-4">
        {isEnrolled ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {liveOnly ? "Classroom access active" : "Lifetime access unlocked"}
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <Clock className="h-3.5 w-3.5" />
            Few seats left
          </div>
        )}
      </div>

      {!isEnrolled && (
        <div className="mt-4">
          <CoursePrice
            course={course}
            discount={discount}
            finalAmount={finalAmount}
            couponCode={couponCode}
          />
        </div>
      )}

      <div className="mt-5 space-y-3">
        {!isEnrolled ? (
          <AddToCartButton course={course} />
        ) : (
          <>
            {liveOnly ? (
              <div className="rounded-2xl border border-border bg-muted/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  <Clock className="h-3.5 w-3.5" />
                  Live classroom
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  Batch schedule, class links, and faculty updates are available
                  inside your classroom.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-muted/50 p-4">
                <div className="mb-2 flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Your Progress</span>
                  <span>{percent}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              asChild
              className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Link href={`/course/${course.slug}/learn`}>
                {liveOnly
                  ? "Open Classroom"
                  : percent > 0
                    ? "Continue Learning"
                    : "Start Learning"}
              </Link>
            </Button>
          </>
        )}
      </div>

      <p className="mt-4 flex items-center justify-center rounded-2xl border border-border bg-muted/50 px-3 py-2 text-center text-sm text-muted-foreground">
        <MdOutlineRotateLeft className="mr-1 h-4 w-4 text-primary" />
        15 days money back guarantee
      </p>

      <div className="mt-5 rounded-2xl border border-border bg-muted/50 p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">
          This course includes
        </p>

        <div className="space-y-2">
          <CourseFeatureItem
            title="Duration"
            value={course.duration || "N/A"}
          />

          <CourseFeatureItem title="Course Type" value={delivery.shortLabel} />

          {recordedLearning ? (
            <>
              <CourseFeatureItem title="Lectures" value={meta.totalLectures} />

              <CourseFeatureItem
                title="Total Video Duration"
                value={meta.totalDuration}
              />
            </>
          ) : null}

          {liveClasses ? (
            <CourseFeatureItem title="Live Classes" value="Batch schedule" />
          ) : null}

          <CourseFeatureItem
            title="Experience Level"
            value={course.experienceLevel || "No prior experience required"}
          />

          <CourseFeatureItem
            title="Language"
            value={course.language || "English - Hindi"}
          />
        </div>
      </div>
    </aside>
  );
};
