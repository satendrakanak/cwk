import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  BadgeCheck,
  BookOpenCheck,
  ClipboardCheck,
  Globe,
  Trophy,
} from "lucide-react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa";

import Container from "@/components/container";
import { ProfileCover } from "@/components/profile/profile-cover";
import { ProfileHeader } from "@/components/profile/profile-header";
import ProgressChart from "@/components/profile/progress-chart";
import { cn } from "@/lib/utils";
import { userServerService } from "@/services/users/user.server";
import { Course } from "@/types/course";
import { formatDate } from "@/utils/formate-date";

type PageProps = {
  params: Promise<{ username: string }>;
};

const reserved = [
  "dashboard",
  "login",
  "courses",
  "orders",
  "settings",
  "profile",
  "exams",
  "certificates",
  "articles",
  "article",
  "course",
  "contact",
  "cart",
  "checkout",
  "our-faculty",
  "client-testimonials",
  "auth",
  "admin",
  "api",
];

export default async function PublicProfilePage({ params }: PageProps) {
  const { username: rawUsername } = await params;

  const username = rawUsername.startsWith("@")
    ? rawUsername.slice(1)
    : rawUsername;

  if (reserved.includes(username)) {
    return notFound();
  }

  const response = await userServerService.getPublicProfile(username);
  const bundle = response.data;

  if (!bundle) {
    return notFound();
  }

  const { user, stats, weeklyProgress, courses, certificates, examHistory } =
    bundle;

  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />
      </div>

      <Container className="relative z-10">
        <div className="pb-12 pt-6">
          <ProfileCover coverImage={user.coverImage?.path} isOwner={false} />

          <div className="relative z-10 px-2 md:px-6">
            <ProfileHeader user={user} isOwner={false} stats={stats} />
          </div>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="academy-card p-5 md:p-6">
              <SectionHeader
                icon={BookOpenCheck}
                eyebrow="About"
                title="Learning journey in focus"
                description="A public snapshot of this learner’s progress, exams, recognitions, and visible course portfolio."
              />

              <p className="mt-5 text-sm leading-7 text-muted-foreground md:text-base">
                {user.profile?.bio ||
                  "This learner has made the profile public to showcase educational momentum, exam activity, and earned recognitions."}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatPill label="Courses" value={String(stats.courses)} />
                <StatPill
                  label="Progress"
                  value={`${stats.progress}%`}
                  active
                />
                <StatPill
                  label="Passed Exams"
                  value={String(stats.examsPassed)}
                />
                <StatPill
                  label="Certificates"
                  value={String(stats.certificatesEarned)}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {user.profile?.website ? (
                  <ActionBadge
                    href={user.profile.website}
                    icon={<Globe className="h-4 w-4" />}
                  >
                    Visit website
                  </ActionBadge>
                ) : null}

                {user.profile?.linkedin ? (
                  <ActionBadge
                    href={user.profile.linkedin}
                    icon={<FaLinkedinIn className="h-4 w-4" />}
                  >
                    LinkedIn
                  </ActionBadge>
                ) : null}

                {user.profile?.instagram ? (
                  <ActionBadge
                    href={user.profile.instagram}
                    icon={<FaInstagram className="h-4 w-4" />}
                  >
                    Instagram
                  </ActionBadge>
                ) : null}
              </div>
            </div>

            <div className="academy-card p-4 md:p-5">
              <ProgressChart weeklyProgress={weeklyProgress} />
            </div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-2">
            <div className="academy-card p-5 md:p-6">
              <SectionHeader
                icon={ClipboardCheck}
                eyebrow="Final Exam Highlights"
                title="Public assessment report"
                description="Published exam activity and assessment progress visible on this profile."
              />

              {examHistory.length === 0 ? (
                <EmptyBlock
                  icon={ClipboardCheck}
                  title="No final exam activity"
                  description="No public final exam activity is available on this profile yet."
                />
              ) : (
                <div className="mt-5 space-y-4">
                  {examHistory.map((item) => (
                    <div
                      key={item.courseId}
                      className="rounded-3xl border border-border bg-muted/50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h4 className="line-clamp-2 text-base font-semibold text-card-foreground">
                            {item.courseTitle}
                          </h4>

                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {item.attempts} attempt
                            {item.attempts > 1 ? "s" : ""} • Best{" "}
                            {item.bestPercentage}% • Latest{" "}
                            {item.latestPercentage}%
                          </p>
                        </div>

                        <span
                          className={cn(
                            "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border px-3 text-xs font-bold",
                            item.passed
                              ? "border-primary/15 bg-primary/10 text-primary"
                              : "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          {item.passed ? (
                            <BadgeCheck className="h-4 w-4" />
                          ) : (
                            <ClipboardCheck className="h-4 w-4" />
                          )}

                          {item.passed ? "Passed" : "In Progress"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="academy-card p-5 md:p-6">
              <SectionHeader
                icon={Award}
                eyebrow="Certificate Wall"
                title="Earned recognitions"
                description="Certificates shared publicly by this learner."
              />

              {certificates.length === 0 ? (
                <EmptyBlock
                  icon={Award}
                  title="No public certificates"
                  description="No certificates are public on this profile yet."
                />
              ) : (
                <div className="mt-5 space-y-4">
                  {certificates.map((certificate) => (
                    <div
                      key={certificate.id}
                      className="rounded-3xl border border-primary/15 bg-primary/5 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background text-primary ring-1 ring-primary/15">
                          <Trophy className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-2 text-base font-semibold text-card-foreground">
                            {certificate.course.title}
                          </p>

                          <p className="mt-1 wrap-break-word text-sm text-muted-foreground">
                            Certificate #{certificate.certificateNumber}
                          </p>

                          <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                            Issued {formatDate(certificate.issuedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {courses.length ? (
            <section className="academy-card mt-8 p-5 md:p-6">
              <div className="mb-6 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                    Visible Courses
                  </p>

                  <h3 className="mt-2 text-2xl font-semibold text-card-foreground">
                    Public learning portfolio
                  </h3>
                </div>

                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Public profile par learner access ya internal progress show
                  nahi hota. Yahan sirf visible course showcase dikh raha hai.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <PublicCourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </Container>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof BookOpenCheck;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border pb-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-card-foreground">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  active = false,
}: {
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3",
        active
          ? "border-primary/20 bg-primary/10"
          : "border-border bg-muted/50",
      )}
    >
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-none text-card-foreground">
          {value}
        </p>

        <p
          className={cn(
            "mt-1.5 line-clamp-1 text-[10px] font-bold uppercase tracking-[0.14em]",
            active ? "text-primary" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function ActionBadge({
  children,
  href,
  icon,
}: {
  children: React.ReactNode;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex h-10 items-center gap-2 rounded-full border border-border bg-muted px-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
    >
      <span className="text-primary transition-colors group-hover:text-primary-foreground">
        {icon}
      </span>

      {children}
    </Link>
  );
}

function EmptyBlock({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Award;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-border bg-muted/50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="h-7 w-7" />
      </div>

      <p className="text-sm font-semibold text-card-foreground">{title}</p>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PublicCourseCard({ course }: { course: Course }) {
  return (
    <article className="academy-card group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_26px_80px_color-mix(in_oklab,var(--primary)_12%,transparent)]">
      <Link href={`/course/${course.slug}`} className="block">
        <div className="relative h-52 overflow-hidden bg-muted">
          <Image
            src={course.image?.path || "/assets/default.png"}
            alt={course.imageAlt || course.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-linear-to-t from-foreground/55 via-transparent to-transparent opacity-70" />
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/course/${course.slug}`}>
          <h4 className="line-clamp-2 text-lg font-semibold leading-7 text-card-foreground transition-colors hover:text-primary">
            {course.title}
          </h4>
        </Link>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {course.shortDescription ||
            "A public showcase course from this learner's visible portfolio."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {course.experienceLevel ? (
            <CourseTag>{course.experienceLevel}</CourseTag>
          ) : null}

          {course.language ? <CourseTag>{course.language}</CourseTag> : null}
        </div>
      </div>
    </article>
  );
}

function CourseTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-muted px-3 py-1.5 font-semibold text-muted-foreground">
      {children}
    </span>
  );
}
