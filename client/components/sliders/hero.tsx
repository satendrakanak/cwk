"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Autoplay, EffectCards, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { couponClientService } from "@/services/coupons/coupon.client";
import { CouponMap } from "@/types/coupon";
import { Course } from "@/types/course";
import CourseHeroCard from "./course-hero-card";

interface HeroProps {
  courses: Course[];
}

export default function Hero({ courses }: HeroProps) {
  const [couponMap, setCouponMap] = useState<CouponMap>({});

  useEffect(() => {
    if (!courses?.length) return;

    const fetchCoupons = async () => {
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

    fetchCoupons();
  }, [courses]);

  return (
    <section className="academy-hero relative overflow-hidden text-white">
      {/* Original hero background - do not change */}
      <div className="academy-hero-animated-bg-light dark:academy-hero-animated-bg-dark absolute inset-0" />

      <div className="academy-glow-one absolute -left-40 -top-40 h-140 w-140 rounded-full bg-white/10 blur-[120px]" />
      <div className="academy-glow-two absolute -right-55 top-20 h-140 w-140 rounded-full bg-blue-400/20 blur-[130px]" />
      <div className="academy-glow-three absolute -bottom-65 left-1/2 h-140 w-190 -translate-x-1/2 rounded-full bg-indigo-400/15 blur-[140px]" />

      <div className="academy-hero-shine absolute inset-0 opacity-45" />
      <div className="academy-hero-grid absolute inset-0 opacity-20" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 mx-auto flex min-h-190 max-w-360 flex-col px-6 pt-9 lg:min-h-162.5 lg:flex-row lg:items-center lg:px-12 lg:py-20 xl:px-16">
        <div className="z-20 max-w-130 text-center lg:text-left">
          <p className="mb-5 inline-flex rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_10px_30px_rgba(15,23,42,0.28)] backdrop-blur-md">
            🏆 The Leader in Online Learning
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl">
            Learn with clarity, apply with confidence, grow for the long term.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/80 lg:mx-0 lg:text-lg">
            Learn practical skills with expert-led courses designed to help you
            grow, build confidence, and advance your career.
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row lg:w-auto lg:items-start">
            <Link
              href="/courses"
              className="inline-flex h-12 w-full max-w-64 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-slate-950 shadow-[0_15px_45px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-white/90 sm:w-auto lg:max-w-none"
            >
              View Courses →
            </Link>

            <Link
              href="/contact"
              className="inline-flex h-12 w-full max-w-64 items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_15px_45px_rgba(15,23,42,0.28)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 sm:w-auto lg:max-w-none"
            >
              Speak to our team
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-[50%] hidden -translate-x-1/2 lg:block">
          <div className="relative h-155 w-130 drop-shadow-[0_35px_70px_rgba(0,0,0,0.45)]">
            <Image
              src="/assets/courses/banner-01.webp"
              alt="Hero student"
              fill
              priority
              className="object-contain object-bottom"
            />
          </div>
        </div>

        <div className="absolute right-10 top-1/2 z-20 hidden w-105 -translate-y-1/2 lg:block">
          <Swiper
            modules={[Pagination, EffectCards, Autoplay]}
            effect="cards"
            loop={courses.length > 1}
            autoplay={{ delay: 3000 }}
            pagination={{ clickable: true }}
          >
            {courses.map((course) => {
              const price = Number(course.priceInr);
              const coupon = couponMap[course.id];
              const discount = coupon?.discount ?? 0;
              const finalPrice = coupon?.finalAmount ?? price;

              return (
                <SwiperSlide key={course.id}>
                  <CourseHeroCard
                    course={course}
                    price={price}
                    discount={discount}
                    finalPrice={finalPrice}
                    variant="desktop"
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        <div className="relative mt-8 flex w-full flex-col items-center pb-0 lg:hidden">
          <div className="relative z-40 w-full max-w-85">
            <Swiper
              modules={[Pagination, Autoplay]}
              loop={courses.length > 1}
              autoplay={{ delay: 3000 }}
              pagination={{ clickable: true }}
              className="pb-8"
            >
              {courses.map((course) => {
                const price = Number(course.priceInr);
                const coupon = couponMap[course.id];
                const discount = coupon?.discount ?? 0;
                const finalPrice = coupon?.finalAmount ?? price;

                return (
                  <SwiperSlide key={course.id}>
                    <CourseHeroCard
                      course={course}
                      price={price}
                      discount={discount}
                      finalPrice={finalPrice}
                      variant="mobile"
                    />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          <div className="relative z-20 mt-2 h-82.5 w-full drop-shadow-[0_30px_55px_rgba(0,0,0,0.42)]">
            <Image
              src="/assets/courses/banner-01.webp"
              alt="Hero student"
              fill
              priority
              className="object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
