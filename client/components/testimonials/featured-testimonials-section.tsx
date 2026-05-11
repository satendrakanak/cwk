import Link from "next/link";

import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import { Testimonial } from "@/types/testimonial";
import { TestimonialCard } from "./testimonial-card";

export const FeaturedTestimonialsSection = ({
  testimonials,
}: {
  testimonials: Testimonial[];
}) => {
  if (!testimonials.length) return null;

  return (
    <section className="academy-section relative bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />

        <div className="absolute -left-40 top-8 h-105 w-105 rounded-full bg-primary/10 blur-[120px]" />

        <div className="absolute -right-40 top-28 h-105 w-105 rounded-full bg-primary/10 blur-[120px]" />

        <div className="absolute -bottom-40 left-1/2 h-90 w-190 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

        <div className="academy-grid-mask absolute inset-0 opacity-40" />
      </div>

      <Container>
        <div className="relative z-10">
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="academy-badge mb-4">Client Testimonials</span>

              <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                Real transformations, not generic praise.
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Explore a mix of written stories and video experiences from
                learners who trusted CodeWithKasa with their growth.
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-border bg-card/80 px-6 font-semibold text-primary shadow-sm backdrop-blur-md transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Link href="/client-testimonials">View All Testimonials</Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.slice(0, 3).map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                variant="featured"
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
