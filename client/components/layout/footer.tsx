"use client";

import Link from "next/link";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
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
    { href: "/our-faculty", label: "Faculty" },
  ];

  const companyLinks = [
    { href: "/contact", label: "Contact Us" },
    { href: "/courses", label: "Admissions" },
    { href: "/articles", label: "Learning Resources" },
    { href: "/our-faculty", label: "Meet the Faculty" },
    { href: "/cart", label: "Your Cart" },
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
          <div className="grid gap-10 py-16 md:grid-cols-2 xl:grid-cols-[1.25fr_0.8fr_0.9fr_1.1fr]">
            <div>
              <div className="mb-5">
                <Logo footer />
              </div>

              <p className="mb-6 max-w-sm text-sm leading-7 text-muted-foreground">
                {site.footerAbout || site.siteDescription}
              </p>

              <Link
                href="/contact"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                Contact With Us
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div>
              <h3 className="mb-5 text-base font-semibold text-foreground">
                Useful Links
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
              <h3 className="mb-5 text-base font-semibold text-foreground">
                Our Company
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
              <h3 className="mb-5 text-base font-semibold text-foreground">
                Get Contact
              </h3>

              <ul className="mb-6 space-y-4 text-sm text-muted-foreground">
                {site.supportPhone && (
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                      <Phone className="h-4 w-4" />
                    </span>
                    <span>{site.supportPhone}</span>
                  </li>
                )}

                {site.supportEmail && (
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                      <Mail className="h-4 w-4" />
                    </span>
                    <span>{site.supportEmail}</span>
                  </li>
                )}

                {site.supportAddress && (
                  <li className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary shadow-sm">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <span className="leading-6">{site.supportAddress}</span>
                  </li>
                )}
              </ul>

              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
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
