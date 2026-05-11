"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";

import { useSiteSettings } from "@/context/site-settings-context";

export function ContactInfo() {
  const { site } = useSiteSettings();

  return (
    <div className="space-y-4">
      <div className="academy-card p-4 md:p-5">
        <div className="mb-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">
            Get in touch
          </p>

          <h3 className="mt-2 text-xl font-semibold tracking-tight text-card-foreground md:text-2xl">
            Let&apos;s help with the right next step.
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Reach out for course guidance, support, admissions help, or faculty
            questions. We usually respond within one working day.
          </p>
        </div>

        <div className="grid gap-2.5">
          <InfoRow
            icon={Mail}
            label="Email"
            value={site.supportEmail || "info@codewithkasa.com"}
          />

          <InfoRow
            icon={Phone}
            label="Phone"
            value={site.supportPhone || "+91-9809-XXXXXX"}
          />

          <InfoRow
            icon={MapPin}
            label="Address"
            value={site.supportAddress || "India"}
          />

          <InfoRow
            icon={Clock3}
            label="Support hours"
            value="Monday to Saturday, 10:00 AM to 6:00 PM"
          />
        </div>
      </div>

      <div className="academy-card p-4 md:p-5">
        <h4 className="text-base font-semibold text-card-foreground">
          Prefer exploring first?
        </h4>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Browse the latest programs, testimonials, and faculty stories before
          talking to the team.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/courses"
            className="group inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Explore Courses
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/client-testimonials"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-muted px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            View Testimonials
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-border bg-muted/50 p-3 transition-colors hover:border-primary/25 hover:bg-primary/5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-card-foreground">{label}</p>

        <p className="mt-0.5 wrap-break-word text-sm leading-5 text-muted-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
