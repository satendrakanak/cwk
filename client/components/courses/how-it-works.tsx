"use client";

import { steps } from "@/data/steps-data";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function HowItWorks() {
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
        <div className="grid gap-10 xl:grid-cols-[1fr_1.15fr] xl:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-white/75">
              How It Works
            </p>

            <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              A guided path from curiosity to certification.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-8 text-white/75">
              We keep the process simple, structured, and professional — from
              choosing a course to earning your certificate.
            </p>

            <div className="mt-8 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-[0_24px_70px_rgba(2,6,23,0.24)] backdrop-blur-xl">
              <div className="grid gap-4 sm:grid-cols-3">
                {["Choose", "Learn", "Certify"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur-md"
                  >
                    <CheckCircle2 className="mx-auto mb-2 h-5 w-5 text-white/80" />
                    <p className="text-sm font-semibold text-white">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                  Learner Promise
                </p>

                <p className="mt-3 text-sm leading-7 text-white/75">
                  Clear onboarding, structured lessons, practical outcomes, and
                  a completion flow that feels professional from start to
                  finish.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-7 top-8 hidden h-[calc(100%-4rem)] w-px bg-linear-to-b from-white/55 via-white/20 to-transparent md:block" />

            <div className="space-y-4">
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="group relative rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_18px_55px_rgba(2,6,23,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/15 hover:shadow-[0_28px_80px_rgba(2,6,23,0.3)] md:pl-24"
                  >
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/15 text-white/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-primary md:absolute md:left-5 md:top-1/2 md:mb-0 md:-translate-y-1/2">
                      <Icon className="h-6 w-6 stroke-[1.8]" />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                          {step.eyebrow}
                        </p>

                        <h3 className="mt-1 text-xl font-semibold text-white">
                          {step.title}
                        </h3>
                      </div>

                      <div className="hidden rounded-full border border-white/10 bg-white/10 p-2 text-white/80 transition-colors group-hover:bg-white group-hover:text-primary md:block">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-white/75">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
