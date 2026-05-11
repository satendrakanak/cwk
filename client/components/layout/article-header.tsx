"use client";

import Container from "../container";

export function ArticleHeader() {
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

        <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/30 to-black/55" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl">
          <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.26em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_28px_rgba(2,6,23,0.20)] backdrop-blur-md">
            Articles
          </span>

          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl lg:text-[46px]">
            Read ideas that make the learning journey more practical.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
            Explore wellness, learning, nutrition, and career-oriented insights
            written for thoughtful readers.
          </p>
        </div>
      </Container>
    </section>
  );
}
