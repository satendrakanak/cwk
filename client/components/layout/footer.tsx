"use client";

import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Grid2X2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

import Container from "../container";
import Logo from "../logo";
import { useSiteSettings } from "@/context/site-settings-context";
import FooterCta from "./footer-cta";

export default function Footer() {
  const { site } = useSiteSettings();

  const socialLinks = [
    {
      href: site.facebookUrl,
      icon: <FaFacebookF size={15} />,
      label: "Facebook",
    },
    {
      href: site.twitterUrl,
      icon: <FaXTwitter size={15} />,
      label: "X",
    },
    {
      href: site.instagramUrl,
      icon: <FaInstagram size={15} />,
      label: "Instagram",
    },
    {
      href: site.linkedinUrl,
      icon: <FaLinkedinIn size={15} />,
      label: "LinkedIn",
    },
  ].filter((item) => item.href);

  const usefulLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/articles", label: "Articles" },
    { href: "/client-testimonials", label: "Testimonials" },
    { href: "/instructors", label: "Instructors" },
  ];

  const companyLinks = [
    { href: "/contact", label: "Contact Us" },
    { href: "/courses", label: "Admissions" },
    { href: "/articles", label: "Learning Resources" },
    { href: "/instructors", label: "Meet the Instructors" },
    { href: "/cart", label: "Your Cart" },
  ];
  const footerStats = [
    { icon: GraduationCap, value: "500+", label: "Learners" },
    { icon: BookOpen, value: "30+", label: "Courses" },
    { icon: UsersRound, value: "30", label: "Instructors" },
    { icon: Grid2X2, value: "Live", label: "Cohorts" },
  ];
  const workflowCards = [
    {
      icon: BookOpen,
      title: "Course demos",
      text: "Free, paid, enrolled, live, and hybrid states.",
    },
    {
      icon: Grid2X2,
      title: "Dashboard flow",
      text: "Learner, instructor, and admin areas included.",
    },
    {
      icon: ShieldCheck,
      title: "Certificates & exams",
      text: "Practical LMS workflows ready for testing.",
    },
  ];

  return (
    <>
      <FooterCta />

      <footer className="relative overflow-hidden bg-background text-muted-foreground">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-border to-transparent" />

          <div className="absolute -left-32 top-16 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />

          <div className="absolute -right-30 bottom-0 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />

          <div className="academy-grid-mask absolute inset-0 opacity-20" />
        </div>

        <Container className="relative z-10">
          <div className="grid gap-10 py-14 lg:grid-cols-[1.05fr_1.55fr]">
            <div className="text-center lg:text-left">
              <div className="mb-5 flex justify-center lg:justify-start">
                <Logo footer />
              </div>

              <p className="mx-auto mb-6 max-w-sm text-sm leading-7 text-muted-foreground lg:mx-0">
                {site.footerAbout || site.siteDescription}
              </p>

              <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 lg:mx-0">
                {footerStats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm"
                    >
                      <Icon className="mx-auto mb-4 h-4 w-4 text-primary" />
                      <p className="text-2xl font-semibold text-foreground">
                        {item.value}
                      </p>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/contact"
                className="group mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Contact With Us
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
              <div>
                <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-foreground">
                  Explore
                </h3>

                <ul className="space-y-3 text-sm">
                  {usefulLinks.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="inline-flex text-muted-foreground transition hover:translate-x-1 hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-foreground">
                  Company
                </h3>

                <ul className="space-y-3 text-sm">
                  {companyLinks.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="inline-flex text-muted-foreground transition hover:translate-x-1 hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-foreground">
                  Contact
                </h3>

              <ul className="mb-6 space-y-4 text-sm text-muted-foreground">
                {site.supportPhone && (
                  <li className="flex justify-center gap-3 md:justify-start">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                      <Phone className="h-4 w-4" />
                    </span>
                    <span>{site.supportPhone}</span>
                  </li>
                )}

                {site.supportEmail && (
                  <li className="flex justify-center gap-3 md:justify-start">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span>{site.supportEmail}</span>
                  </li>
                )}

                {site.supportAddress && (
                  <li className="flex justify-center gap-3 md:justify-start">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="leading-6">{site.supportAddress}</span>
                  </li>
                )}
              </ul>

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                  {socialLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-y border-border py-8 md:grid-cols-3">
            {workflowCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm md:text-left"
                >
                  <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary md:mx-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 text-sm text-muted-foreground md:flex-row">
            <p>{site.footerCopyright}</p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/terms" className="transition hover:text-primary">
                Terms
              </Link>

              <Link href="/privacy" className="transition hover:text-primary">
                Privacy
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}
