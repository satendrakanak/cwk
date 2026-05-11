"use client";

import dynamic from "next/dynamic";

import { Testimonial } from "@/types/testimonial";

const TestimonialsList = dynamic(
  () => import("./testimonials-list").then((mod) => mod.TestimonialsList),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="h-56 animate-pulse rounded-[28px] border border-slate-100 bg-slate-100/70" />
        <div className="h-96 animate-pulse rounded-[28px] border border-slate-100 bg-white" />
      </div>
    ),
  },
);

export function TestimonialsListLoader({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  return <TestimonialsList testimonials={testimonials} />;
}
