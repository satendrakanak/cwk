"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Headphones } from "lucide-react";

import Container from "../container";
import { useSiteSettings } from "@/context/site-settings-context";

export default function FooterCta() {
  const { site } = useSiteSettings();

  const stats = [
    {
      icon: GraduationCap,
      value: "500+",
      label: "Learners mentored",
      desc: "Growing every cohort",
    },
    {
      icon: BookOpen,
      value: "100+",
      label: "Certified outcomes",
      desc: "Focused programs",
    },
    {
      icon: Headphones,
      value: "Live",
      label: "Faculty support",
      desc: "Human-first learning",
    },
  ];

  return (
    <section className="relative overflow-hidden py-20 text-white">
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
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/12 px-5 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_35px_rgba(2,6,23,0.22)] backdrop-blur-md">
              {site.footerCtaEyebrow}
            </span>

            <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
              {site.footerCtaHeading}
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
              {site.footerCtaDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={site.footerPrimaryCtaHref || "/courses"}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_15px_45px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                {site.footerPrimaryCtaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href={site.footerSecondaryCtaHref || "/contact"}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_14px_40px_rgba(2,6,23,0.22)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white hover:text-primary"
              >
                {site.footerSecondaryCtaLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="group rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/15"
                >
                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/12 text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-3xl font-bold text-white">
                    {item.value}
                  </h3>

                  <p className="mt-2 font-semibold text-white">{item.label}</p>

                  <p className="mt-1 text-sm text-white/70">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
