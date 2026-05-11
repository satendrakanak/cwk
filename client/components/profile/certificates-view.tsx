"use client";

import Link from "next/link";
import { Award, Download, ExternalLink } from "lucide-react";

import { Certificate } from "@/types/certificate";
import { slugify } from "@/utils/slugify";
import { downloadRemoteFile } from "@/lib/download-file";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/utils/formate-date";

interface CertificatesViewProps {
  certificates: Certificate[];
}

export function CertificatesView({ certificates }: CertificatesViewProps) {
  const handleDownload = async (certificate: Certificate) => {
    if (!certificate.file?.path) return;

    const learner = slugify(
      `${certificate.user?.firstName || ""} ${
        certificate.user?.lastName || ""
      }`.trim() || "learner",
    );

    const course = slugify(certificate.course?.title || "course");

    await downloadRemoteFile(certificate.file.path, `${learner}-${course}.pdf`);
  };

  if (!certificates.length) {
    return (
      <div className="academy-card flex flex-col items-center justify-center border-dashed p-10 text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Award className="h-10 w-10" />
        </div>

        <h3 className="text-2xl font-semibold text-card-foreground">
          No certificates yet
        </h3>

        <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
          Complete a course and your certificate will appear here automatically.
        </p>

        <Link
          href="/courses"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[0_14px_35px_color-mix(in_oklab,var(--primary)_24%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90"
        >
          Explore Courses
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="academy-card p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Achievement Vault
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-card-foreground">
              Certificates
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Download your earned certificates anytime from your learning
              profile.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            <Award className="h-4 w-4" />
            {certificates.length}{" "}
            {certificates.length > 1 ? "certificates" : "certificate"}
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {certificates.map((certificate) => (
          <article
            key={certificate.id}
            className="academy-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_28px_80px_color-mix(in_oklab,var(--primary)_12%,transparent)]"
          >
            <div className="relative overflow-hidden bg-primary p-6 text-primary-foreground">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,color-mix(in_oklab,var(--primary-foreground)_22%,transparent),transparent_30%),radial-gradient(circle_at_90%_30%,color-mix(in_oklab,var(--primary-foreground)_14%,transparent),transparent_34%)]" />

              <div className="academy-grid-mask absolute inset-0 opacity-15" />

              <div className="relative z-10">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/15 backdrop-blur-md">
                  <Award className="h-6 w-6" />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-foreground/75">
                  Certificate
                </p>

                <h3 className="mt-3 line-clamp-2 text-2xl font-semibold leading-tight">
                  {certificate.course.title}
                </h3>
              </div>
            </div>

            <div className="space-y-5 p-5 md:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoBox
                  label="Certificate ID"
                  value={certificate.certificateNumber}
                />

                <InfoBox
                  label="Issued On"
                  value={formatDateTime(certificate.issuedAt)}
                />
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                Your certificate is stored safely and can be downloaded anytime
                from this page.
              </div>

              <div className="flex flex-wrap gap-3">
                {certificate.file?.path ? (
                  <Button
                    type="button"
                    onClick={() => handleDownload(certificate)}
                    className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_color-mix(in_oklab,var(--primary)_18%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                ) : null}

                <Button
                  asChild
                  type="button"
                  variant="outline"
                  className="h-10 rounded-full border-border bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground **:text-inherit"
                >
                  <Link href={`/course/${certificate.course.slug}`}>
                    <ExternalLink className="h-4 w-4" />
                    View Course
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 wrap-break-word text-sm font-semibold text-card-foreground">
        {value}
      </p>
    </div>
  );
}
