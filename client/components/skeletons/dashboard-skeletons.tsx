import Container from "@/components/container";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function Shell({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn("relative min-h-screen bg-background", className)}>
      <div className="pointer-events-none absolute inset-0 bg-(--surface-shell)" />
      {children}
    </div>
  );
}

function MetricGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      {Array.from({ length: compact ? 4 : 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card) md:p-5"
        >
          <Skeleton className="mb-4 size-10 rounded-2xl bg-primary/10" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-8 w-20" />
          <Skeleton className="mt-4 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

function ContentGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="academy-card p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-7 w-56" />
          </div>
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-background p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="size-10 rounded-xl bg-primary/10" />
                <Skeleton className="size-5 rounded-full" />
              </div>
              <Skeleton className="h-6 w-20" />
              <Skeleton className="mt-3 h-4 w-40" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-3/4" />
            </div>
          ))}
        </div>
      </section>

      <section className="academy-card p-5 md:p-6">
        <div className="mb-5 space-y-3 border-b border-border pb-5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-7 w-48" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-background p-4"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="size-10 shrink-0 rounded-xl bg-primary/10" />
                <div className="min-w-0 flex-1 space-y-3">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function LearnerDashboardSkeleton() {
  return (
    <Shell>
      <Container className="relative z-10">
        <div className="pb-12 pt-6">
          <Skeleton className="mb-5 h-9 w-48 rounded-full" />

          <div className="relative h-40 overflow-hidden rounded-[2rem] border border-border bg-card shadow-(--shadow-card) md:h-56">
            <Skeleton className="absolute inset-0 rounded-none bg-muted/60" />
          </div>

          <div className="relative z-10 px-2 md:px-6">
            <div className="-mt-10 rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card) md:-mt-14 md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="flex items-end gap-4">
                  <Skeleton className="size-24 rounded-3xl ring-4 ring-background md:size-32" />
                  <div className="space-y-3 pb-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64 max-w-full" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-8 w-24 rounded-full" />
                      <Skeleton className="h-8 w-28 rounded-full" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-11 w-36 rounded-full" />
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-border bg-card p-2 shadow-(--shadow-card)">
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="h-10 w-28 shrink-0 rounded-full"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-8 py-8">
              <div className="space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72 max-w-full" />
              </div>

              <MetricGrid />

              <section className="academy-card p-5 md:p-6">
                <Skeleton className="h-5 w-40" />
                <div className="mt-6 h-56 rounded-3xl border border-border bg-background p-4">
                  <div className="flex h-full items-end gap-3">
                    {[55, 78, 42, 88, 63, 72, 48].map((height, index) => (
                      <Skeleton
                        key={index}
                        className="flex-1 rounded-t-2xl bg-primary/10"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </section>

              <ContentGrid />
            </div>
          </div>
        </div>
      </Container>
    </Shell>
  );
}

export function LearnerDashboardContentSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <MetricGrid />

      <section className="academy-card p-5 md:p-6">
        <Skeleton className="h-5 w-40" />
        <div className="mt-6 h-56 rounded-3xl border border-border bg-background p-4">
          <div className="flex h-full items-end gap-3">
            {[55, 78, 42, 88, 63, 72, 48].map((height, index) => (
              <Skeleton
                key={index}
                className="flex-1 rounded-t-2xl bg-primary/10"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </section>

      <ContentGrid />
    </div>
  );
}

export function WorkspaceDashboardSkeleton() {
  return (
    <Shell className="p-3 sm:p-4 lg:p-5">
      <div className="relative z-10 flex min-h-screen gap-4">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card) lg:block">
          <Skeleton className="mb-6 h-12 w-40" />
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="h-11 rounded-2xl" />
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-5">
          <div className="rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card)">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64 max-w-full" />
              </div>
              <Skeleton className="size-11 rounded-full" />
            </div>
          </div>

          <MetricGrid compact />
          <ContentGrid />
        </main>
      </div>
    </Shell>
  );
}
