import { Course } from "@/types/course";
import Container from "../container";
import CourseRatingDetails from "../courses/course-rating-details";
import CourseAuthor from "./course-author";
import CourseUpdateDetails from "../courses/course-update-details";
import guestAuthor from "@/public/assets/guest-user.webp";
import { formatDate } from "@/utils/formate-date";

interface CourseHeroProps {
  course: Course;
}

export const CourseHero = ({ course }: CourseHeroProps) => {
  return (
    <section className="relative overflow-hidden py-16 text-white lg:py-20">
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
        <div className="grid grid-cols-12 items-start gap-8">
          <div className="col-span-12 lg:col-span-7">
            <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/12 px-4 py-1.5 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_28px_rgba(2,6,23,0.20)] backdrop-blur-md">
              Certified Course
            </div>

            <h1 className="mb-4 text-center text-3xl font-semibold leading-tight tracking-tight text-white md:text-5xl lg:text-left lg:text-[50px]">
              {course.title}
            </h1>

            {course.shortDescription && (
              <p className="mx-auto mb-5 max-w-2xl text-center text-sm leading-7 text-white/75 md:text-base lg:mx-0 lg:text-left">
                {course.shortDescription}
              </p>
            )}

            <div className="mb-5">
              <CourseRatingDetails
                rating={4.8}
                reviews={1560}
                enrolledStudentCount={2365}
              />
            </div>

            <div className="flex flex-col items-center gap-4 lg:items-start">
              <CourseAuthor
                authorName={`${course.updatedBy.firstName} ${course.updatedBy.lastName}`}
                authorPhoto={guestAuthor}
              />

              <div className="inline-flex rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-[0_18px_55px_rgba(2,6,23,0.22)] backdrop-blur-xl">
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
