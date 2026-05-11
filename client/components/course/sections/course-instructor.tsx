"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star, Users, UserRound } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

import { Course } from "@/types/course";

interface CourseInstructorProps {
  course: Course;
}

export const CourseInstructor = ({ course }: CourseInstructorProps) => {
  const faculties = course.faculties || [];

  if (!faculties.length) {
    return (
      <section className="academy-card p-5 md:p-6">
        <div className="mb-5 border-b border-border pb-4">
          <h2 className="text-xl font-semibold text-card-foreground">
            Instructor
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/50 px-6 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <UserRound className="h-7 w-7" />
          </div>

          <p className="text-sm font-semibold text-card-foreground">
            No instructor assigned yet
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Instructor details will appear here once assigned.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="academy-card p-5 md:p-6">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-card-foreground">
          Instructor{faculties.length > 1 ? "s" : ""}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Meet the faculty guiding this course with practical experience and
          subject depth.
        </p>
      </div>

      <div className="space-y-5">
        {faculties.map((instructor) => {
          const profile = instructor.profile;
          const facultyProfile = instructor.facultyProfile;
          const name = `${instructor.firstName || ""} ${
            instructor.lastName || ""
          }`.trim();

          const avatar = instructor.avatar?.path || "/assets/default.png";

          const socials = [
            {
              href: profile?.linkedin,
              icon: FaLinkedinIn,
              label: "LinkedIn",
            },
            {
              href: profile?.facebook,
              icon: FaFacebookF,
              label: "Facebook",
            },
            {
              href: profile?.instagram,
              icon: FaInstagram,
              label: "Instagram",
            },
            {
              href: profile?.twitter,
              icon: FaXTwitter,
              label: "X",
            },
          ].filter((item) => Boolean(item.href));

          return (
            <article
              key={instructor.id}
              className="group relative overflow-hidden rounded-3xl border border-border bg-muted/50 p-4 transition-all duration-300 hover:border-primary/25 hover:bg-primary/5 hover:shadow-[0_16px_48px_color-mix(in_oklab,var(--primary)_12%,transparent)] md:p-5"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="h-full bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_65%)]" />
              </div>

              <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-start">
                <div className="relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-3xl border-4 border-card bg-muted shadow-[0_14px_36px_rgba(15,23,42,0.12)] ring-1 ring-primary/10 md:mx-0">
                  <Image
                    src={avatar}
                    alt={name || "Instructor"}
                    fill
                    sizes="112px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="min-w-0 flex-1 text-center md:text-left">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <Link href={`/our-faculty/${instructor.id}`}>
                        <h3 className="text-lg font-semibold text-card-foreground transition-colors hover:text-primary">
                          {name || "Course Instructor"}
                        </h3>
                      </Link>

                      <p className="mt-1 text-sm font-semibold text-primary">
                        {facultyProfile?.designation || "Course Instructor"}
                      </p>
                    </div>

                    {socials.length > 0 && (
                      <div className="flex justify-center gap-2 md:justify-end">
                        {socials.map((social) => {
                          const Icon = social.icon;

                          return (
                            <a
                              key={social.label}
                              href={social.href}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={social.label}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                            >
                              <Icon className="h-4 w-4" />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-medium text-muted-foreground md:justify-start">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      -- Rating
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      -- Students
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      -- Courses
                    </span>
                  </div>

                  {facultyProfile?.expertise && (
                    <div className="mt-4 rounded-2xl border border-border bg-card p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Expertise
                      </p>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {facultyProfile.expertise}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
