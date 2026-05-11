"use client";

import { Course } from "@/types/course";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCourseMeta } from "@/helpers/course-meta";
import { CourseProgressBar } from "./course-progress-bar";
import { CouponApplyResponse } from "@/types/coupon";
import {
  getCourseDeliveryLabel,
  hasLiveClasses,
  hasRecordedLearning,
} from "@/lib/course-delivery";

interface CourseCardProps {
  course: Course & {
    isEnrolled?: boolean;
    progress?: {
      progress: number;
    };
  };
  coupon?: CouponApplyResponse | null;
}

const getInstructorLabel = (course: Course) => {
  const facultyNames =
    course.faculties
      ?.map((faculty) =>
        [faculty.firstName, faculty.lastName].filter(Boolean).join(" ").trim(),
      )
      .filter(Boolean) || [];

  if (facultyNames.length) {
    return facultyNames.join(", ");
  }

  return [course.createdBy?.firstName, course.createdBy?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
};

export function CourseCard({ course, coupon }: CourseCardProps) {
  const addToCart = useCartStore((s) => s.addToCart);
  const [meta, setMeta] = useState({
    totalLectures: 0,
    totalDuration: "0m",
  });

  const router = useRouter();

  useEffect(() => {
    const loadMeta = async () => {
      const data = await getCourseMeta(course);
      setMeta(data);
    };

    loadMeta();
  }, [course]);

  // 🔥 hydration-safe (no function call)
  const alreadyAdded = useCartStore((s) =>
    s.cartItems.some((i) => i.id === course.id),
  );

  const isEnrolled = course.isEnrolled;
  const delivery = getCourseDeliveryLabel(course.mode);
  const recordedLearning = hasRecordedLearning(course);
  const liveClasses = hasLiveClasses(course);
  const basePrice = Number(course.priceInr);
  const finalPrice = coupon?.finalAmount ?? basePrice;
  const discount = coupon?.discount ?? 0;
  const couponCode = coupon?.code;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (alreadyAdded) return;

    addToCart({
      id: course.id,
      title: course.title,
      price: Number(course.priceInr),
      image: course.image?.path,
      instructor: getInstructorLabel(course),
      totalDuration: meta.totalDuration,
      totalLectures: meta.totalLectures,
      slug: course.slug,
    });

    toast.success("Added to cart 🛒", {
      description: course.title,
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart"),
      },
    });
  };

  return (
    <div className="academy-card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_color-mix(in_oklab,var(--primary)_18%,transparent)]">
      {/* IMAGE */}
      <div className="relative h-48 overflow-hidden">
        <Link href={`/course/${course.slug}`}>
          <Image
            src={course.image?.path || "/assets/default.png"}
            alt={course.imageAlt || course.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        <span
          className={
            isEnrolled
              ? "absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-lg"
              : "absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg"
          }
        >
          {isEnrolled ? "Enrolled" : delivery.shortLabel}
        </span>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/course/${course.slug}`}>
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-card-foreground transition-colors hover:text-primary">
            {course.title}
          </h3>
        </Link>

        <p className="mb-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {course.shortDescription}
        </p>

        <div className="mb-3 text-sm text-yellow-500">
          ⭐⭐⭐⭐⭐ <span className="text-muted-foreground">(120)</span>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {recordedLearning ? (
            <>
              <span>🎬 {meta.totalLectures} lectures</span>
              <span>⏱ {meta.totalDuration}</span>
            </>
          ) : null}
          {liveClasses ? <span>📅 Live batches</span> : null}
          <span>📊 {course.experienceLevel || "All Levels"}</span>
        </div>

        {course.isEnrolled ? (
          <CourseProgressBar
            percent={course.progress.progress}
            slug={course.slug}
            mode={course.mode}
          />
        ) : (
          <div className="mt-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              {discount > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-primary">
                      ₹{new Intl.NumberFormat("en-IN").format(finalPrice)}
                    </span>

                    <span className="text-xs text-muted-foreground line-through">
                      ₹{new Intl.NumberFormat("en-IN").format(basePrice)}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    🎉 {couponCode} applied
                  </span>
                </>
              ) : (
                <span className="text-base font-semibold text-primary">
                  ₹{new Intl.NumberFormat("en-IN").format(basePrice)}
                </span>
              )}
            </div>

            <button
              onClick={handleAdd}
              className={
                alreadyAdded
                  ? "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-emerald-600 bg-emerald-600 text-white transition hover:opacity-90"
                  : "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
              }
              title={alreadyAdded ? "View cart" : "Add to cart"}
            >
              {alreadyAdded ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
