import { TestimonialCard } from "@/components/testimonials/testimonial-card";
import { Testimonial } from "@/types/testimonial";

export const CourseTestimonials = ({
  testimonials,
}: {
  testimonials: Testimonial[];
}) => {
  return (
    <section className="academy-card p-5 md:p-6">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-card-foreground">
          Student Testimonials
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Real stories and learning experiences from students of this course.
        </p>
      </div>

      {testimonials?.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              variant="compact"
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center">
          <p className="text-sm font-semibold text-card-foreground">
            No testimonials yet
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Testimonials for this course will be added soon.
          </p>
        </div>
      )}
    </section>
  );
};
