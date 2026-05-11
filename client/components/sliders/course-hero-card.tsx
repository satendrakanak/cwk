"use client";

import { Course } from "@/types/course";
import { formatPrice, getDiscountPercent } from "@/utils/prices";
import Image from "next/image";
import Link from "next/link";
interface CourseHeroCardProps {
  course: Course;
  price: number;
  discount: number;
  finalPrice: number;
  variant: "desktop" | "mobile";
}

export default function CourseHeroCard({
  course,
  price,
  discount,
  finalPrice,
  variant,
}: CourseHeroCardProps) {
  const isMobile = variant === "mobile";
  return (
    <div
      className={isMobile ? "academy-card p-3 text-left" : "academy-card p-5"}
    >
      <div
        className={
          isMobile
            ? "relative overflow-hidden rounded-xl"
            : "relative overflow-hidden rounded-2xl"
        }
      >
        <Image
          alt={course.title}
          src={course.image?.path || "/placeholder.jpg"}
          width={950}
          height={600}
          className={
            isMobile ? "h-36 w-full object-cover" : "h-50 w-full object-cover"
          }
        />

        {discount > 0 && (
          <span
            className={
              isMobile
                ? "absolute right-2 top-2 rounded-full bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground shadow-lg"
                : "absolute right-2 top-2 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-lg"
            }
          >
            -{getDiscountPercent(discount, price)}%
          </span>
        )}
      </div>

      <div className={isMobile ? "mt-3" : "mt-4 flex flex-1 flex-col"}>
        <h3
          className={
            isMobile
              ? "line-clamp-2 text-sm font-semibold text-card-foreground"
              : "mb-2 text-lg font-semibold text-card-foreground"
          }
        >
          {course.title}
        </h3>

        <p
          className={
            isMobile
              ? "mt-1 line-clamp-2 text-xs text-muted-foreground"
              : "mb-3 text-sm leading-6 text-muted-foreground"
          }
        >
          {course.shortDescription}
        </p>

        <div
          className={
            isMobile
              ? "mt-2 text-xs text-yellow-500"
              : "mb-3 text-sm text-yellow-500"
          }
        >
          ⭐⭐⭐⭐⭐ <span className="text-muted-foreground">(15)</span>
        </div>

        <div
          className={
            isMobile
              ? "mt-2 flex items-center justify-between"
              : "mt-auto flex items-center justify-between"
          }
        >
          <div className="flex items-center gap-2">
            <p
              className={
                isMobile
                  ? "text-sm font-bold text-primary"
                  : "text-lg font-bold text-primary"
              }
            >
              ₹{formatPrice(finalPrice)}
            </p>

            {discount > 0 && (
              <span
                className={
                  isMobile
                    ? "text-xs text-muted-foreground line-through"
                    : "text-sm text-muted-foreground line-through"
                }
              >
                ₹{formatPrice(price)}
              </span>
            )}
          </div>

          <Link
            href={`/course/${course.slug}`}
            className={
              isMobile
                ? "whitespace-nowrap text-xs font-medium text-primary hover:text-primary/80"
                : "text-sm font-medium text-primary hover:text-primary/80"
            }
          >
            {isMobile ? "Learn →" : "Learn More →"}
          </Link>
        </div>
      </div>
    </div>
  );
}
