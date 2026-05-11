"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { User } from "@/types/user";
import Container from "../container";
import { FacultyCard } from "../faculty/faculty-card";

export default function Faculty({ faculties }: { faculties: User[] }) {
  if (!faculties?.length) return null;

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

        <div className="absolute inset-0 bg-linear-to-r from-black/65 via-black/25 to-black/45" />
      </div>

      <Container className="relative z-10">
        <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl text-center lg:text-left">
            <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/12 px-5 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_35px_rgba(2,6,23,0.22)] backdrop-blur-md">
              Our Experts
            </span>

            <h2 className="text-4xl font-semibold tracking-tight text-white lg:text-5xl">
              Meet the faculty shaping thoughtful practitioners.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">
              Learn from specialists who combine academic depth, industry
              practice, and mentorship that actually guides students forward.
            </p>
          </div>

          <Link
            href="/our-faculty"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/12 px-6 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_14px_40px_rgba(2,6,23,0.22)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white hover:text-primary"
          >
            View All Faculty
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {faculties.slice(0, 4).map((item) => (
            <FacultyCard key={item.id} faculty={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}
