"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { User } from "@/types/user";

interface FacultyCardProps {
  faculty: User;
}

export function FacultyCard({ faculty }: FacultyCardProps) {
  const name = `${faculty.firstName} ${faculty.lastName || ""}`.trim();
  const designation = faculty.facultyProfile?.designation || "Faculty Mentor";

  const socials = [
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
      label: "Twitter",
    },
    {
      href: faculty.profile?.youtube,
      icon: FaYoutube,
      label: "YouTube",
    },
  ].filter((item) => Boolean(item.href));

  return (
    <Link
      href={`/our-faculty/${faculty.id}`}
      className="academy-card group relative block h-full overflow-hidden p-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_28px_80px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_64%)]" />
      </div>

      <div className="relative h-56 overflow-hidden rounded-[22px] border border-border bg-muted">
        <Image
          src={faculty.avatar?.path || "/assets/default.png"}
          alt={name || "Faculty"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/15 to-transparent opacity-75 transition-opacity group-hover:opacity-90" />

        <div className="absolute left-3 top-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-sm backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <span className="line-clamp-1 inline-flex max-w-full rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            {designation}
          </span>
        </div>
      </div>

      <div className="relative z-10 px-2 pb-2 pt-4">
        <h3 className="line-clamp-1 text-lg font-semibold text-card-foreground">
          {name || "Faculty"}
        </h3>

        <div className="mt-4 flex items-center justify-between gap-3">
          {socials.length > 0 ? (
            <div className="flex items-center gap-2">
              {socials.map((social) => {
                const Icon = social.icon;

                return (
                  <span
                    key={social.label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    title={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                );
              })}
            </div>
          ) : (
            <span />
          )}

          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
