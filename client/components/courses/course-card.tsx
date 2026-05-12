"use client";

import { Course } from "@/types/course";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Check,
  MonitorPlay,
  RadioTower,
  ShoppingCart,
  SplitSquareHorizontal,
  Star,
  Tags,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  const cardRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isMobilePreviewActive, setIsMobilePreviewActive] = useState(false);
  const [meta, setMeta] = useState<{
    totalLectures: number;
    totalDuration: string;
  } | null>({
    totalLectures: 0,
    totalDuration: course.duration || "0m",
  });

  const router = useRouter();

  useEffect(() => {
    if (!course.chapters?.length) {
      return;
    }

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
  const totalLectures = meta?.totalLectures ?? 0;
  const totalDuration = meta?.totalDuration || course.duration || "Self-paced";
  const basePrice = Number(course.priceInr);
  const finalPrice = coupon?.finalAmount ?? basePrice;
  const discount = coupon?.discount ?? 0;
  const couponCode = coupon?.code;
  const modeIcon =
    course.mode === "faculty_led"
      ? RadioTower
      : course.mode === "hybrid"
        ? SplitSquareHorizontal
        : MonitorPlay;
  const ModeIcon = modeIcon;
  const primaryCategory = course.categories?.[0];
  const visibleTags = course.tags?.slice(0, 2) || [];
  const averageRating = course.averageRating || 0;
  const totalReviews = course.totalReviews || 0;
  const previewVideoUrl =
    course.video?.type === "video" || course.video?.mime?.startsWith("video/")
      ? course.video.path
      : null;
  const shouldShowPreview = isPreviewActive || isMobilePreviewActive;

  useEffect(() => {
    if (!previewVideoUrl || typeof window === "undefined") return;

    const prefersTouch = window.matchMedia("(hover: none)").matches;
    const card = cardRef.current;

    if (!prefersTouch || !card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsMobilePreviewActive(entry.isIntersecting && entry.intersectionRatio > 0.65);
      },
      { threshold: [0, 0.65, 1] },
    );

    observer.observe(card);

    return () => observer.disconnect();
  }, [previewVideoUrl]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !previewVideoUrl) return;

    if (shouldShowPreview) {
      video.currentTime = 0;
      void video.play().catch(() => {
        setIsPreviewActive(false);
        setIsMobilePreviewActive(false);
      });
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [shouldShowPreview, previewVideoUrl]);

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
      totalDuration,
      totalLectures,
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

  const startPreview = () => {
    if (previewVideoUrl) {
      setIsPreviewActive(true);
    }
  };

  const stopPreview = () => {
    setIsPreviewActive(false);
  };

  return (
    <div
      ref={cardRef}
      className="academy-card group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
    >
      {/* IMAGE */}
      <div
        className="relative h-48 overflow-hidden"
        onMouseEnter={startPreview}
        onMouseLeave={stopPreview}
        onFocus={startPreview}
        onBlur={stopPreview}
      >
        <Link href={`/course/${course.slug}`}>
          <Image
            src={course.image?.path || "/assets/default.png"}
            alt={course.imageAlt || course.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className={
              previewVideoUrl
                ? `object-cover transition duration-500 group-hover:scale-105 ${shouldShowPreview ? "opacity-0" : "opacity-100"}`
                : "object-cover transition duration-500 group-hover:scale-105"
            }
          />
          {previewVideoUrl ? (
            <video
              ref={videoRef}
              src={previewVideoUrl}
              className={`absolute inset-0 h-full w-full object-cover transition duration-300 ${shouldShowPreview ? "opacity-100" : "opacity-0"}`}
              muted
              playsInline
              loop
              preload="metadata"
              aria-label={`${course.title} preview video`}
            />
          ) : null}
        </Link>

        {previewVideoUrl ? (
          <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-sm backdrop-blur-md transition group-hover:opacity-100">
            <MonitorPlay className="h-3.5 w-3.5" />
            Preview
          </span>
        ) : null}

        <span
          className={
            isEnrolled
              ? "absolute left-3 top-3 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-lg"
              : "absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-lg"
          }
        >
          {isEnrolled ? "Enrolled" : delivery.shortLabel}
        </span>

        {primaryCategory ? (
          <Link
            href={`/courses?category=${primaryCategory.slug}`}
            className="absolute bottom-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border border-white/15 bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-md transition hover:bg-primary hover:text-primary-foreground"
          >
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">{primaryCategory.name}</span>
          </Link>
        ) : null}
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

        <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ModeIcon className="h-3.5 w-3.5" />
            {delivery.shortLabel}
          </span>

          {visibleTags.map((tag) => (
            <Link
              key={tag.id}
              href={`/courses?tag=${tag.slug}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              <Tags className="h-3 w-3 text-primary" />
              {tag.name}
            </Link>
          ))}
        </div>

        <div className="mb-3 flex items-center gap-1.5 text-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-card-foreground">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-muted-foreground">({totalReviews})</span>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {recordedLearning ? (
            <>
              {totalLectures > 0 ? (
                <span>🎬 {totalLectures} lectures</span>
              ) : null}
              <span>⏱ {totalDuration}</span>
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
          <div className="mt-auto flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex flex-col text-center sm:text-left">
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
                  ? "flex h-10 w-full cursor-pointer items-center justify-center rounded-full border border-emerald-600 bg-emerald-600 text-white transition hover:opacity-90 sm:h-9 sm:w-9"
                  : "flex h-10 w-full cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground sm:h-9 sm:w-9"
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
