"use client";

import { featuresData } from "@/data/features-data";
import { FeatureCard } from "./feature-card";

export default function WhyJoinOurCourses() {
  return (
    <section className="relative overflow-hidden py-24 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="academy-hero-animated-bg-light dark:academy-hero-animated-bg-dark absolute inset-0" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,color-mix(in_oklab,var(--primary)_34%,transparent),transparent_32%),radial-gradient(circle_at_85%_25%,color-mix(in_oklab,var(--primary)_28%,transparent),transparent_36%),radial-gradient(circle_at_45%_85%,color-mix(in_oklab,var(--primary)_20%,transparent),transparent_40%)]" />

        <div className="academy-glow-one absolute -left-40 -top-40 h-140 w-140 rounded-full bg-primary/20 blur-[120px]" />
        <div className="academy-glow-two absolute -right-55 top-20 h-140 w-140 rounded-full bg-primary/20 blur-[130px]" />
        <div className="academy-glow-three absolute -bottom-65 left-1/2 h-140 w-190 -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />

        <div className="academy-hero-shine absolute inset-0 opacity-45" />
        <div className="academy-hero-grid absolute inset-0 opacity-20" />
        <div className="absolute inset-0 bg-black/35" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-white/75">
            Why Join Us
          </p>

          <h2 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
            Why Join Our Courses?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/75">
            We provide a powerful learning experience to help you grow and
            succeed.
          </p>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-3">
          {featuresData.slice(0, 3).map((item) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              desc={item.desc}
              Icon={item.icon}
            />
          ))}
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {featuresData.slice(3).map((item) => (
            <FeatureCard
              key={item.title}
              title={item.title}
              desc={item.desc}
              Icon={item.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
