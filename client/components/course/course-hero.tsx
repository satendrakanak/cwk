import { Course } from "@/types/course";
import Container from "../container";
import CourseRatingDetails from "../courses/course-rating-details";
import CourseAuthor from "./course-author";
import CourseUpdateDetails from "../courses/course-update-details";
import guestAuthor from "@/public/assets/guest-user.webp";
import { formatDate } from "@/utils/formate-date";
import { getCourseDeliveryLabel } from "@/lib/course-delivery";
import { getFacultyHref } from "@/lib/faculty-slug";
import { WebsiteBreadcrumbs } from "@/components/layout/website-breadcrumbs";
import type { CourseReviewSummary } from "@/types/course-review";
import type { User } from "@/types/user";

interface CourseHeroProps {
  course: Course;
  reviewSummary: CourseReviewSummary;
}

function getUniqueHeroChips(course: Course) {
  const items = [
    {
      key: `mode-${course.mode || "self_learning"}`,
      label: getCourseDeliveryLabel(course.mode).shortLabel,
      tone: "solid",
    },
    ...(course.categories || []).map((category) => ({
      key: `category-${category.slug}`,
      label: category.name,
      tone: "neutral",
    })),
    ...(course.tags || []).map((tag) => ({
      key: `tag-${tag.slug}`,
      label: tag.name,
      tone: "primary",
    })),
  ];
  const seen = new Set<string>();

  return items.filter((item) => {
    const normalized = item.label.toLowerCase().trim();
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function getCourseAuthor(course: Course): User | undefined {
  return course.faculties?.[0] || course.updatedBy || course.createdBy;
}

export const CourseHero = ({ course, reviewSummary }: CourseHeroProps) => {
  const heroChips = getUniqueHeroChips(course).slice(0, 6);
  const author = getCourseAuthor(course);
  const courseFacultyAuthor = course.faculties?.[0];
  const authorName =
    [author?.firstName, author?.lastName].filter(Boolean).join(" ") ||
    "CodeWithKasa Instructor";
  const authorHref = courseFacultyAuthor
    ? getFacultyHref(courseFacultyAuthor)
    : author?.username
      ? `/${author.username}`
      : "/";
  const authorPhoto = author?.avatar?.path || author?.avatarUrl || guestAuthor;
  const rating = reviewSummary.total ? reviewSummary.average : 0;
  const learners = course.enrollmentCount || reviewSummary.total || 0;

  return (
    <section className="relative overflow-hidden py-10 text-white md:py-12 lg:py-14">
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
        <div className="grid grid-cols-12 items-start gap-6">
          <div className="col-span-12 lg:col-span-7">
            <WebsiteBreadcrumbs
              contained={false}
              variant="hero"
              className="mb-3 flex justify-center pt-0 lg:justify-start"
              items={[
                { label: "Home", href: "/" },
                { label: "Courses", href: "/courses" },
                { label: course.title },
              ]}
            />

            <div className="mx-auto mb-3 flex w-fit max-w-full rounded-full border border-white/20 bg-white/12 px-3 py-1 text-center text-[11px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_28px_rgba(2,6,23,0.20)] backdrop-blur-md lg:mx-0">
              Certified Course
            </div>

            <h1 className="mb-3 max-w-3xl text-center text-3xl font-semibold leading-[1.08] tracking-tight text-white md:text-4xl lg:text-left lg:text-[42px]">
              {course.title}
            </h1>

            {course.shortDescription && (
              <p className="mx-auto mb-4 max-w-2xl text-center text-sm leading-6 text-white/75 md:text-[15px] lg:mx-0 lg:text-left">
                {course.shortDescription}
              </p>
            )}

            <div className="mx-auto mb-4 flex max-w-2xl flex-wrap justify-center gap-2 lg:mx-0 lg:justify-start">
              {heroChips.map((chip) => (
                <span
                  key={chip.key}
                  className={
                    chip.tone === "solid"
                      ? "rounded-full border border-white/20 bg-white/18 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md"
                      : chip.tone === "primary"
                        ? "rounded-full border border-primary/35 bg-primary/20 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md"
                        : "rounded-full border border-white/15 bg-black/18 px-2.5 py-1 text-[11px] font-semibold text-white/85 backdrop-blur-md"
                  }
                >
                  {chip.label}
                </span>
              ))}
            </div>

            <div className="mb-4">
              <CourseRatingDetails
                rating={rating || 4.8}
                reviews={reviewSummary.total}
                enrolledStudentCount={learners}
              />
            </div>

            <div className="flex flex-col items-center gap-3 lg:items-start">
              <CourseAuthor
                authorName={authorName}
                authorPhoto={authorPhoto}
                href={authorHref}
              />

              <div className="inline-flex rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-[0_18px_55px_rgba(2,6,23,0.22)] backdrop-blur-xl">
                <CourseUpdateDetails
                  lastUpdateDate={formatDate(course.updatedAt)}
                  language={course.language || "English"}
                  certificate="Certified Course"
                />
              </div>
            </div>
          </div>

          <div className="hidden lg:col-span-5 lg:block" />
        </div>
      </Container>
    </section>
  );
};
