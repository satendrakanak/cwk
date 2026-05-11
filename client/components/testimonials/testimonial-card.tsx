"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Quote } from "lucide-react";
import { useState } from "react";

import VideoPreviewModal from "@/components/modals/video-preview-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Testimonial } from "@/types/testimonial";
import { formatDate } from "@/utils/formate-date";
import { TestimonialRating } from "./testimonial-rating";

interface TestimonialCardProps {
  testimonial: Testimonial;
  variant?: "featured" | "compact";
}

export const TestimonialCard = ({
  testimonial,
  variant = "featured",
}: TestimonialCardProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  const isVideo = testimonial.type === "VIDEO";
  const primaryCourse = testimonial.courses?.[0] || null;

  return (
    <>
      <article
        className={`academy-card group relative flex overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_30px_90px_color-mix(in_oklab,var(--primary)_18%,transparent)] ${
          variant === "featured" ? "h-full" : ""
        }`}
      >
        <div className="flex w-full flex-col">
          <div className="mx-7 h-0.75 rounded-b-full bg-linear-to-r from-primary/60 via-primary to-primary/60" />

          <div className="relative flex h-full flex-col p-6 pt-7 md:p-7 md:pt-8">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
              <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_65%)]" />
            </div>

            <div className="relative z-10 mb-5 flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-card bg-muted shadow-[0_10px_30px_rgba(15,23,42,0.12)] ring-4 ring-primary/10">
                  <Image
                    src={testimonial.avatar?.path || "/assets/default.png"}
                    alt={testimonial.avatarAlt || testimonial.name}
                    fill
                    sizes="56px"
                    className="rounded-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-card-foreground">
                    {testimonial.name}
                  </h3>

                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {[testimonial.designation, testimonial.company]
                      .filter(Boolean)
                      .join(" at ") || "Verified learner"}
                  </p>
                </div>
              </div>

              <Badge
                variant="outline"
                className="shrink-0 rounded-full border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                {isVideo ? "Video" : "Review"}
              </Badge>
            </div>

            <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
              <TestimonialRating rating={testimonial.rating} />

              {primaryCourse && (
                <Link
                  href={`/course/${primaryCourse.slug}`}
                  className="line-clamp-1 text-right text-xs font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {primaryCourse.title}
                </Link>
              )}
            </div>

            {isVideo ? (
              <div className="relative z-10 mb-5 overflow-hidden rounded-3xl border border-border bg-slate-950 shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,color-mix(in_oklab,var(--primary)_34%,transparent),transparent_34%),linear-gradient(135deg,#020617_0%,#0f2a55_48%,#020617_100%)]" />

                <div className="relative flex aspect-video flex-col justify-between p-5 text-white">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                      <Quote className="h-5 w-5 text-white/80" />
                    </div>

                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
                      Student Voice
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className="max-w-xs text-sm leading-6 text-white/80">
                      Hear {testimonial.name}&apos;s experience in their own
                      words.
                    </p>

                    <Button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="h-11 rounded-full bg-white px-5 font-semibold text-slate-950 shadow-sm transition hover:bg-white/90"
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Watch Story
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 mb-5 flex-1 overflow-hidden rounded-3xl border border-border bg-muted/45 p-5">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />

                <Quote className="relative mb-4 h-8 w-8 text-primary/60" />

                <p className="relative text-[15px] leading-7 text-card-foreground/85">
                  {testimonial.message}
                </p>
              </div>
            )}

            <div className="relative z-10 mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
              <span>{formatDate(testimonial.createdAt)}</span>

              <span className="rounded-full bg-muted px-3 py-1 font-semibold text-muted-foreground">
                {isVideo ? "Video testimonial" : "Text testimonial"}
              </span>
            </div>
          </div>
        </div>
      </article>

      <VideoPreviewModal
        videoUrl={previewOpen ? testimonial.video?.path || null : null}
        title={`${testimonial.name} testimonial`}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
};
