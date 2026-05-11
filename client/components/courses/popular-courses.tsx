import { CouponBulkClient } from "../coupon/coupon-bulk-client";
import { Course } from "@/types/course";

interface PopularCoursesProps {
  courses: Course[];
}

export default function PopularCourses({ courses }: PopularCoursesProps) {
  return (
    <section className="academy-section relative bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />

        <div className="absolute left-1/2 top-0 h-105 w-225 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />

        <div className="absolute -left-36 top-24 h-96 w-96 rounded-full bg-primary/10 blur-[110px]" />

        <div className="absolute -right-35 bottom-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_38%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="academy-badge mb-4">Popular Courses</span>

          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Choose a path that feels purposeful, not overwhelming.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Explore our most loved programs, curated for practical learning and
            real momentum.
          </p>
        </div>

        <CouponBulkClient courses={courses} />
      </div>
    </section>
  );
}
