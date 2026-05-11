"use client";

import { stats } from "@/data/stats-data";

export default function StatsTimeline() {
  return (
    <section className="academy-section-tight relative -mt-px bg-background px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-8 h-72 w-170 -translate-x-1/2 rounded-full bg-primary/10 blur-[90px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_32%),radial-gradient(circle_at_85%_30%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_35%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl text-center">
        <span className="academy-badge mb-4">Why Choose Us</span>

        <h2 className="mx-auto mb-14 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-foreground lg:text-5xl">
          Creating A Community Of <br /> Life Long Learners.
        </h2>

        <div className="relative">
          <div className="absolute left-[8%] right-[8%] top-3 hidden h-px bg-linear-to-r from-transparent via-primary/35 to-transparent xl:block" />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="relative flex flex-col items-center"
                >
                  <div className="relative z-20 hidden h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background shadow-[0_0_0_6px_color-mix(in_oklab,var(--primary)_10%,transparent)] xl:flex">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>

                  <div className="relative z-10 hidden h-10 w-px bg-primary/25 xl:block" />

                  <div className="academy-card group relative w-full max-w-72 overflow-hidden px-6 pb-8 pt-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_color-mix(in_oklab,var(--primary)_18%,transparent)]">
                    <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-primary/80 via-primary to-primary/60" />

                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon size={20} />
                    </div>

                    <h3 className="text-3xl font-bold text-primary">
                      {item.value}
                    </h3>

                    <p className="mt-2 text-sm text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
