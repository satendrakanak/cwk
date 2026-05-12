import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import Container from "@/components/container";
import { CourseCard } from "@/components/courses/course-card";
import { FacultyReviewsSection } from "@/components/faculty/faculty-reviews-section";
import { WebsiteBreadcrumbs } from "@/components/layout/website-breadcrumbs";
import { getSession } from "@/lib/auth";
import { getFacultyHref } from "@/lib/faculty-slug";
import { buildMetadata } from "@/lib/seo";
import { userServerService } from "@/services/users/user.server";

type PageProps = {
  params: Promise<{ facultySlug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { facultySlug } = await params;

  try {
    const response =
      await userServerService.getFacultyProfileBySlug(facultySlug);
    const faculty = response.data;

    const fullName =
      [faculty.firstName, faculty.lastName].filter(Boolean).join(" ") ||
      "Instructor";

    return buildMetadata({
      title: fullName,
      description:
        faculty.profile?.bio ||
        faculty.facultyProfile?.expertise ||
        "Meet our instructor and explore learner feedback.",
      path: getFacultyHref(faculty),
      image:
        faculty.avatar?.path || faculty.avatarUrl || faculty.coverImage?.path || null,
    });
  } catch {
    return buildMetadata({
      title: "Instructor",
      description: "Meet the instructors behind CodeWithKasa.",
      path: `/instructors/${facultySlug}`,
    });
  }
}

export default async function FacultyDetailPage({ params }: PageProps) {
  const { facultySlug } = await params;

  const [profileResponse, session] = await Promise.all([
    userServerService.getFacultyProfileBySlug(facultySlug),
    getSession(),
  ]).catch(() => notFound());

  const faculty = profileResponse.data;

  const fullName = [faculty.firstName, faculty.lastName]
    .filter(Boolean)
    .join(" ");
  const avatarSrc = faculty.avatar?.path || faculty.avatarUrl || "/assets/default.png";

  const enrolledCourses = session
    ? await userServerService
        .getEnrolledCourses(session.id)
        .then((response) => response.data)
        .catch(() => [])
    : [];

  const enrolledCourseMap = new Map(
    enrolledCourses.map((course) => [course.id, course]),
  );

  const taughtCourses =
    faculty.taughtCourses?.map((course) => {
      const enrolledCourse = enrolledCourseMap.get(course.id);

      if (!enrolledCourse) return course;

      return {
        ...course,
        isEnrolled: true,
        progress: enrolledCourse.progress,
      };
    }) || [];

  const enrolledCount = taughtCourses.filter(
    (course) => course.isEnrolled,
  ).length;
  const courseCount = faculty.taughtCoursesCount || taughtCourses.length;
  const averageRating = faculty.averageRating || 0;
  const totalReviews = faculty.totalReviews || 0;
  const socialLinks = [
    {
      href: faculty.profile?.linkedin,
      icon: FaLinkedinIn,
      label: "LinkedIn",
    },
    {
      href: faculty.profile?.instagram,
      icon: FaInstagram,
      label: "Instagram",
    },
    {
      href: faculty.profile?.facebook,
      icon: FaFacebookF,
      label: "Facebook",
    },
    {
      href: faculty.profile?.twitter,
      icon: FaXTwitter,
      label: "X",
    },
    {
      href: faculty.profile?.youtube,
      icon: FaYoutube,
      label: "YouTube",
    },
  ].filter((item) => Boolean(item.href));

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />
      </div>

      <div className="relative z-10">
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
            <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
              <div className="text-center lg:text-left">
                <WebsiteBreadcrumbs
                  contained={false}
                  variant="hero"
                  className="mb-4 flex justify-center pt-0 lg:block"
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Instructors", href: "/instructors" },
                    { label: fullName || "Instructor" },
                  ]}
                />

                <Link
                  href="/instructors"
                  className="inline-flex rounded-full border border-white/20 bg-white/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_28px_rgba(2,6,23,0.20)] backdrop-blur-md"
                >
                  Instructor profile
                </Link>

                <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-5xl lg:mx-0 lg:text-[46px]">
                  {fullName || "Instructor"}
                </h1>

                <p className="mt-3 text-base font-medium text-white/85 md:text-lg">
                  {faculty.facultyProfile?.designation || "Instructor"}
                </p>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/75 md:text-base lg:mx-0">
                  {faculty.profile?.bio ||
                    faculty.facultyProfile?.expertise ||
                    "Experienced instructor helping learners build practical confidence."}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                    <BookOpen className="h-4 w-4 text-primary" />
                    {courseCount} course{courseCount === 1 ? "" : "s"}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {averageRating.toFixed(1)} rating ({totalReviews} review
                    {totalReviews === 1 ? "" : "s"})
                  </span>

                  {faculty.facultyProfile?.experience ? (
                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                      {faculty.facultyProfile.experience} years experience
                    </span>
                  ) : null}

                  {faculty.profile?.headline ? (
                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                      {faculty.profile.headline}
                    </span>
                  ) : null}

                  {faculty.profile?.location ? (
                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                      {faculty.profile.location}
                    </span>
                  ) : null}

                  {session && enrolledCount > 0 ? (
                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                      You are enrolled in {enrolledCount} course
                      {enrolledCount > 1 ? "s" : ""} by this instructor
                    </span>
                  ) : null}
                </div>

                {socialLinks.length ? (
                  <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                    {socialLinks.map((social) => {
                      const Icon = social.icon;

                      return (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={social.label}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 backdrop-blur-md transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="relative mx-auto w-full max-w-sm lg:justify-self-end">
                <div className="overflow-hidden rounded-[30px] border border-white/15 bg-white/10 p-3 shadow-[0_32px_90px_rgba(2,6,23,0.35)] backdrop-blur-xl">
                  <div className="relative aspect-square overflow-hidden rounded-[24px] bg-white/10">
                    <Image
                      src={avatarSrc}
                      alt={fullName || "Instructor"}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 384px"
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <Container>
          <div className="space-y-12 py-14">
            {taughtCourses.length ? (
              <section className="space-y-6">
                <div className="flex flex-col gap-3 text-center md:flex-row md:items-end md:justify-between md:text-left">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      Courses by instructor
                    </p>

                    <h2 className="mt-2 text-3xl font-semibold text-foreground">
                      Learn directly from {faculty.firstName}
                    </h2>
                  </div>

                  <p className="mx-auto max-w-2xl text-sm leading-6 text-muted-foreground md:mx-0">
                    Explore the programs this instructor currently teaches inside
                    the academy.
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {taughtCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>
            ) : null}

            <FacultyReviewsSection faculty={faculty} />
          </div>
        </Container>
      </div>
    </div>
  );
}
