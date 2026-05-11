"use client";

import { useRouter } from "next/navigation";
import { LockKeyhole, ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "../ui/button";

interface EnrollmentGateProps {
  hasAccess: boolean;
  children: React.ReactNode;
  courseSlug: string;
}

export const EnrollmentGate = ({
  hasAccess,
  children,
  courseSlug,
}: EnrollmentGateProps) => {
  const router = useRouter();

  if (!hasAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
        <div className="academy-card relative w-full max-w-2xl overflow-hidden p-6 text-center md:p-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[90px]" />
          </div>

          <div className="relative z-10">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <LockKeyhole className="h-10 w-10" />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Course Locked
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground md:text-4xl">
              Unlock this course to continue learning.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
              You need to purchase or enroll in this course before accessing
              lessons, videos, resources, and progress tracking.
            </p>

            <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              Secure checkout and lifetime learning access after enrollment.
            </div>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={() => router.push(`/course/${courseSlug}`)}
                className="h-12 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Buy Course
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/courses")}
                className="h-12 rounded-full border-border bg-background px-6 text-base font-semibold text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground **:text-inherit"
              >
                Explore Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
