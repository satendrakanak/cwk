import Container from "@/components/container";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const heroSurface = (
  <div className="pointer-events-none absolute inset-0">
    <div className="academy-hero-animated-bg-light dark:academy-hero-animated-bg-dark absolute inset-0" />
    <div className="academy-hero-shine absolute inset-0 opacity-45" />
    <div className="academy-hero-grid absolute inset-0 opacity-20" />
    <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/30 to-black/55" />
  </div>
);

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function HeroLine({ className }: { className?: string }) {
  return <Skeleton className={cn("bg-white/20", className)} />;
}

export function SimpleHeroSkeleton({ withStats = false }: { withStats?: boolean }) {
  return (
    <section className="relative overflow-hidden py-14 text-white md:py-16">
      {heroSurface}
      <Container className="relative z-10">
        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="max-w-3xl">
            <HeroLine className="mb-4 h-8 w-44 rounded-full" />
            <HeroLine className="h-10 w-full max-w-3xl md:h-14" />
            <HeroLine className="mt-3 h-10 w-4/5 max-w-2xl md:h-12" />
            <div className="mt-5 space-y-2">
              <HeroLine className="h-4 w-full max-w-2xl" />
              <HeroLine className="h-4 w-2/3 max-w-xl" />
            </div>
          </div>

          {withStats ? (
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <HeroLine className="h-3 w-28" />
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/10 p-3"
                  >
                    <HeroLine className="mb-3 h-5 w-5 rounded-full" />
                    <HeroLine className="h-7 w-16" />
                    <HeroLine className="mt-2 h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

export function HomeHeroSkeleton() {
  return (
    <section className="academy-hero relative overflow-hidden text-white">
      {heroSurface}
      <div className="relative z-10 mx-auto flex min-h-190 max-w-360 flex-col px-6 pt-9 lg:min-h-162.5 lg:flex-row lg:items-center lg:px-12 lg:py-20 xl:px-16">
        <div className="z-20 max-w-130 text-center lg:text-left">
          <HeroLine className="mx-auto mb-5 h-10 w-62 rounded-full lg:mx-0" />
          <HeroLine className="mx-auto h-12 w-full max-w-120 lg:mx-0 lg:h-16" />
          <HeroLine className="mx-auto mt-3 h-12 w-5/6 max-w-110 lg:mx-0 lg:h-16" />
          <div className="mt-6 space-y-3">
            <HeroLine className="mx-auto h-4 w-full max-w-xl lg:mx-0" />
            <HeroLine className="mx-auto h-4 w-4/5 max-w-lg lg:mx-0" />
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <HeroLine className="h-12 w-full max-w-64 rounded-full" />
            <HeroLine className="h-12 w-full max-w-64 rounded-full" />
          </div>
        </div>

        <div className="absolute right-10 top-1/2 z-20 hidden w-105 -translate-y-1/2 lg:block">
          <CourseCardSkeleton hero />
        </div>

        <div className="relative mt-8 flex w-full flex-col items-center pb-0 lg:hidden">
          <div className="w-full max-w-85">
            <CourseCardSkeleton hero />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CourseCardSkeleton({ hero = false }: { hero?: boolean }) {
  return (
    <div
      className={cn(
        "academy-card flex h-full flex-col overflow-hidden",
        hero && "border-white/15 bg-white/12 p-3 backdrop-blur-xl",
      )}
    >
      <Skeleton className={cn("h-48 w-full", hero && "rounded-2xl bg-white/20")} />
      <div className="flex flex-1 flex-col p-5">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
        <Skeleton className="mt-4 h-4 w-32" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-18 rounded-full" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="academy-card h-full overflow-hidden p-3">
      <Skeleton className="h-52 w-full rounded-[24px]" />
      <div className="min-h-47.5 px-3 pb-3 pt-5">
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="mt-3 h-5 w-3/4" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-4/5" />
        <div className="mt-8 flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TestimonialCardSkeleton() {
  return (
    <article className="academy-card h-full overflow-hidden">
      <div className="mx-7 h-0.75 rounded-b-full bg-primary/40" />
      <div className="p-6 pt-7 md:p-7 md:pt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div>
              <Skeleton className="h-5 w-34" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-7 w-18 rounded-full" />
        </div>
        <div className="mt-5 flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mt-5 rounded-3xl border border-border bg-muted/45 p-5">
          <Skeleton className="mb-4 h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-3 h-4 w-4/5" />
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32 rounded-full" />
        </div>
      </div>
    </article>
  );
}

export function FacultyCardSkeleton() {
  return (
    <div className="academy-card h-full overflow-hidden p-3">
      <Skeleton className="h-56 w-full rounded-[22px]" />
      <div className="px-2 pb-2 pt-4">
        <Skeleton className="h-5 w-3/4" />
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CardsGridSkeleton({
  type,
  count = 9,
}: {
  type: "course" | "article" | "testimonial" | "faculty";
  count?: number;
}) {
  const gridClass =
    type === "faculty"
      ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid gap-6 md:grid-cols-2 xl:grid-cols-3";

  const Card =
    type === "course"
      ? CourseCardSkeleton
      : type === "article"
        ? ArticleCardSkeleton
        : type === "testimonial"
          ? TestimonialCardSkeleton
          : FacultyCardSkeleton;

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} />
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div>
      <HomeHeroSkeleton />
      <Container className="space-y-16 py-14">
        <FeatureStripSkeleton />
        <SectionSkeleton type="course" count={3} />
        <FeatureStripSkeleton columns={4} />
        <SectionSkeleton type="testimonial" count={3} />
        <SectionSkeleton type="faculty" count={4} />
        <SectionSkeleton type="article" count={3} />
      </Container>
    </div>
  );
}

export function ListingPageSkeleton({
  type,
  withStats = false,
  count,
}: {
  type: "course" | "article" | "testimonial" | "faculty";
  withStats?: boolean;
  count?: number;
}) {
  return (
    <PageShell>
      <SimpleHeroSkeleton withStats={withStats} />
      <section className="py-12 pb-20">
        <Container>
          {type === "testimonial" ? (
            <div className="mb-8 rounded-3xl border border-border bg-card p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-11 rounded-full" />
                <Skeleton className="h-11 rounded-full" />
                <Skeleton className="h-11 rounded-full" />
              </div>
            </div>
          ) : null}
          <CardsGridSkeleton
            type={type}
            count={count ?? (type === "faculty" ? 8 : 9)}
          />
        </Container>
      </section>
    </PageShell>
  );
}

export function CourseDetailSkeleton() {
  return (
    <PageShell>
      <section className="relative overflow-hidden py-16 text-white lg:py-20">
        {heroSurface}
        <Container className="relative z-10">
          <div className="grid grid-cols-12 items-start gap-8">
            <div className="col-span-12 lg:col-span-7">
              <HeroLine className="mb-5 h-8 w-40 rounded-full" />
              <HeroLine className="h-12 w-full max-w-2xl md:h-16" />
              <HeroLine className="mt-4 h-12 w-5/6 max-w-xl" />
              <div className="mt-6 flex flex-wrap gap-3">
                <HeroLine className="h-6 w-36 rounded-full" />
                <HeroLine className="h-6 w-44 rounded-full" />
              </div>
              <HeroLine className="mt-6 h-14 w-72 rounded-2xl" />
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start lg:gap-10">
          <div className="order-2 min-w-0 space-y-6 lg:order-1 lg:mt-10">
            <Skeleton className="h-12 w-full rounded-full" />
            <DetailContentSkeleton />
          </div>
          <div className="order-1 w-full min-w-0 lg:sticky lg:top-30 lg:z-40 lg:order-2 lg:-mt-80">
            <CourseSidebarSkeleton />
          </div>
        </div>
      </Container>

      <Container className="py-14">
        <SectionSkeleton type="course" count={3} />
      </Container>
    </PageShell>
  );
}

export function ArticleDetailSkeleton() {
  return (
    <PageShell>
      <section className="relative overflow-hidden py-14 text-white md:py-16">
        {heroSurface}
        <Container className="relative z-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <HeroLine className="h-8 w-38 rounded-full" />
              <HeroLine className="mt-5 h-12 w-full max-w-3xl md:h-14" />
              <HeroLine className="mt-4 h-4 w-full max-w-2xl" />
              <HeroLine className="mt-2 h-4 w-4/5 max-w-xl" />
            </div>
            <HeroLine className="h-64 rounded-3xl bg-white/20 md:h-72" />
          </div>
        </Container>
      </section>

      <Container>
        <div className="flex flex-col items-start gap-10 py-10 lg:flex-row">
          <div className="min-w-0 max-w-4xl flex-1">
            <DetailContentSkeleton />
          </div>
          <aside className="w-full self-start lg:sticky lg:top-24 lg:w-80">
            <SidebarPanelSkeleton />
          </aside>
        </div>
      </Container>

      <Container className="pb-16">
        <SectionSkeleton type="article" count={3} />
      </Container>
    </PageShell>
  );
}

export function FacultyDetailSkeleton() {
  return (
    <PageShell>
      <section className="relative overflow-hidden py-14 text-white md:py-16">
        {heroSurface}
        <Container className="relative z-10">
          <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
            <div>
              <HeroLine className="h-8 w-42 rounded-full" />
              <HeroLine className="mt-5 h-12 w-full max-w-xl md:h-14" />
              <HeroLine className="mt-4 h-5 w-60" />
              <HeroLine className="mt-5 h-4 w-full max-w-2xl" />
              <HeroLine className="mt-2 h-4 w-4/5 max-w-xl" />
              <div className="mt-6 flex flex-wrap gap-3">
                <HeroLine className="h-9 w-36 rounded-full" />
                <HeroLine className="h-9 w-44 rounded-full" />
                <HeroLine className="h-9 w-32 rounded-full" />
              </div>
            </div>
            <div className="mx-auto w-full max-w-sm lg:justify-self-end">
              <HeroLine className="aspect-square rounded-[30px] bg-white/20" />
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <div className="space-y-12 py-14">
          <SectionSkeleton type="course" count={3} />
          <SectionSkeleton type="testimonial" count={3} />
        </div>
      </Container>
    </PageShell>
  );
}

function SectionSkeleton({
  type,
  count,
}: {
  type: "course" | "article" | "testimonial" | "faculty";
  count: number;
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-3 h-8 w-72 max-w-full" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      <CardsGridSkeleton type={type} count={count} />
    </section>
  );
}

function FeatureStripSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="academy-card p-5">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="mt-5 h-5 w-36" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      ))}
    </section>
  );
}

function DetailContentSkeleton() {
  return (
    <div className="space-y-8">
      <div className="academy-card p-6">
        <Skeleton className="h-7 w-56" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton
              key={index}
              className={cn("h-4 w-full", index % 3 === 2 && "w-4/5")}
            />
          ))}
        </div>
      </div>
      <div className="academy-card p-6">
        <Skeleton className="h-6 w-44" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="academy-card p-6">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="mt-5 h-24 rounded-2xl" />
      </div>
    </div>
  );
}

function CourseSidebarSkeleton() {
  return (
    <aside className="academy-card overflow-hidden p-4">
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <Skeleton className="mt-4 h-8 w-32 rounded-full" />
      <Skeleton className="mt-4 h-9 w-36" />
      <Skeleton className="mt-5 h-12 w-full rounded-full" />
      <Skeleton className="mt-4 h-10 w-full rounded-2xl" />
      <div className="mt-5 rounded-2xl border border-border bg-muted/50 p-4">
        <Skeleton className="mb-4 h-4 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function SidebarPanelSkeleton() {
  return (
    <div className="space-y-5">
      <div className="academy-card p-5">
        <Skeleton className="h-5 w-36" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-9 rounded-full" />
          ))}
        </div>
      </div>
      <div className="academy-card p-5">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-5 h-20 rounded-2xl" />
      </div>
    </div>
  );
}
