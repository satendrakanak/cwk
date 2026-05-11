"use client";

import { BookOpen, Headphones, Target } from "lucide-react";

import Container from "../container";

export function CoursesBanner({ totalCourses }: { totalCourses: number }) {
  const stats = [
    {
      icon: BookOpen,
      value: `${totalCourses}+`,
      label: "Published courses",
    },
    {
      icon: Headphones,
      value: "Live",
      label: "Mentor support",
    },
    {
      icon: Target,
      value: "Practical",
      label: "Outcome-first curriculum",
    },
  ];

  return (
    <section className="relative overflow-hidden py-14 text-white md:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="academy-hero-animated-bg-light dark:academy-hero-animated-bg-dark absolute inset-0" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,color-mix(in_oklab,var(--primary)_34%,transparent),transparent_32%),radial-gradient(circle_at_85%_25%,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_36%),radial-gradient(circle_at_45%_85%,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_40%)]" />

        <div className="academy-glow-one absolute -left-40 -top-40 h-140 w-140 rounded-full bg-primary/20 blur-[120px]" />
        <div className="academy-glow-two absolute -right-55 top-20 h-140 w-140 rounded-full bg-primary/20 blur-[130px]" />
        <div className="academy-glow-three absolute -bottom-65 left-1/2 h-140 w-190 -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

        <div className="academy-hero-shine absolute inset-0 opacity-45" />
        <div className="academy-hero-grid absolute inset-0 opacity-20" />

        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-black/50" />
      </div>

      <Container className="relative z-10">
        <p className="mb-4 text-xs font-medium text-white/65">
          Home • All Courses
        </p>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/12 px-4 py-1.5 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_28px_rgba(2,6,23,0.20)] backdrop-blur-md">
              {totalCourses}+ curated programs
            </div>

            <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl lg:text-[46px]">
              Learn through structured, career-conscious wellness education.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
              Browse certification-led, practical programs designed for
              beginners, practitioners, and serious learners building real
              capability.
            </p>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur-xl md:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/75">
              Snapshot
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md"
                  >
                    <Icon className="mb-2 h-4 w-4 text-white/80" />

                    <p className="text-2xl font-bold text-white">
                      {item.value}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/70">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
