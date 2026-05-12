"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { courseClientService } from "@/services/courses/course.client";
import { Course } from "@/types/course";
import { cn } from "@/lib/utils";

const modeLabel: Record<string, string> = {
  self_learning: "Self learning",
  faculty_led: "Faculty led",
  hybrid: "Hybrid",
};

function getModeLabel(mode?: string | null) {
  if (!mode) return "Course";
  return modeLabel[mode] || mode.replace(/_/g, " ");
}

function getCourseMeta(course: Course) {
  const category = course.categories?.[0]?.name;
  const tag = course.tags?.[0]?.name;
  return [getModeLabel(course.mode), category || tag]
    .filter(Boolean)
    .join(" · ");
}

type CoursesMegaMenuProps = {
  open: boolean;
  onNavigate: () => void;
};

export function CoursesMegaMenu({ open, onNavigate }: CoursesMegaMenuProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadCourses() {
      try {
        const response = await courseClientService.getMegaMenuCourses();
        if (!ignore) setCourses(response.data || []);
      } catch {
        if (!ignore) setCourses([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    void loadCourses();

    return () => {
      ignore = true;
    };
  }, []);

  const skillAreas = useMemo(() => {
    const names = new Set<string>();
    courses.forEach((course) => {
      course.categories?.forEach((category) => names.add(category.name));
      course.tags?.slice(0, 1).forEach((tag) => names.add(tag.name));
    });

    return Array.from(names).slice(0, 4);
  }, [courses]);

  return (
    <div
      className={cn(
        "absolute left-1/2 top-[calc(100%+0.75rem)] z-50 w-[min(860px,calc(100vw-2rem))] -translate-x-1/2 transition-all duration-200",
        open
          ? "visible translate-y-0 opacity-100"
          : "invisible translate-y-2 opacity-0",
      )}
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-border/80 bg-popover shadow-[0_24px_70px_color-mix(in_oklab,var(--foreground)_18%,transparent)]">
        <div className="grid min-h-[300px] grid-cols-[230px_1fr]">
          <Link
            href="/courses"
            onClick={onNavigate}
            className="group/feature relative flex overflow-hidden bg-primary p-6 text-primary-foreground"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_15%,rgba(255,255,255,0.28),transparent_38%)]" />
            <Image
              src="/assets/courses/banner-01.webp"
              alt="CodeWithKasa learner"
              fill
              sizes="260px"
              className="object-contain object-bottom opacity-95"
            />
            <div className="relative z-10 flex min-h-full flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground/75">
                  Featured
                </p>
                <h3 className="mt-4 max-w-44 text-2xl font-bold leading-tight">
                  Explore CodeWithKasa Programs
                </h3>
                <p className="mt-3 max-w-44 text-sm leading-6 text-primary-foreground/78">
                  Recorded, live, and hybrid learning paths.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm text-primary-foreground dark:text-white font-bold">
                View all courses
                <ArrowRight className="size-4 transition group-hover/feature:translate-x-0.5" />
              </span>
            </div>
          </Link>

          <div className="grid gap-6 overflow-hidden bg-popover p-6 text-popover-foreground lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.78fr)_minmax(0,0.95fr)]">
            <div>
              <MenuHeading>Featured Courses</MenuHeading>
              <div className="mt-5 space-y-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-12 w-16 animate-pulse rounded-xl bg-muted" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-44 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  ))
                ) : courses.length ? (
                  courses.slice(0, 5).map((course) => (
                    <Link
                      key={course.id}
                      href={`/course/${course.slug}`}
                      onClick={onNavigate}
                      className="group/course flex items-center gap-3 rounded-2xl p-1.5 transition hover:bg-muted/70"
                    >
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                        {course.image?.path ? (
                          <Image
                            src={course.image.path}
                            alt={course.imageAlt || course.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <BookOpenCheck className="m-3 size-6 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-popover-foreground transition group-hover/course:text-primary">
                          {course.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted-foreground capitalize">
                          {getCourseMeta(course)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-2xl border border-border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
                    Select courses for this menu from the admin course toggles.
                  </p>
                )}
              </div>
            </div>

            <div>
              <MenuHeading>Delivery Modes</MenuHeading>
              <div className="mt-6 space-y-4">
                {[
                  ["Self learning", "Recorded lessons and exams"],
                  ["Faculty led", "Live classes with instructors"],
                  ["Hybrid", "Recorded plus live sessions"],
                  ["Free preview", "Try lessons before enrolling"],
                ].map(([title, description], index) => (
                  <Link
                    key={title}
                    href={index === 3 ? "/courses?tag=free" : "/courses"}
                    onClick={onNavigate}
                    className="block rounded-2xl p-2 transition hover:bg-muted/70"
                  >
                    <p className="text-sm font-bold text-popover-foreground">
                      {title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <MenuHeading>Skill Areas</MenuHeading>
              <div className="mt-6 space-y-4">
                {(skillAreas.length
                  ? skillAreas
                  : ["Web Development", "Backend", "Career Skills", "Data"]
                ).map((item, index) => (
                  <Link
                    key={item}
                    href="/courses"
                    onClick={onNavigate}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl p-3 transition",
                      "hover:bg-muted/70",
                      index === 3 && "bg-primary/10 text-primary",
                    )}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {index % 2 === 0 ? (
                        <Sparkles className="size-4" />
                      ) : (
                        <GraduationCap className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-popover-foreground">
                        {item}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        Curated learning tracks
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuHeading({ children }: React.PropsWithChildren) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  );
}
