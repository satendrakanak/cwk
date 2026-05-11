import { TestimonialsListLoader } from "@/components/admin/testimonials/testimonials-list-loader";
import { getErrorMessage } from "@/lib/error-handler";
import { testimonialServerService } from "@/services/testimonials/testimonial.server";
import { Testimonial } from "@/types/testimonial";

const TestimonialsPage = async () => {
  let testimonials: Testimonial[] = [];

  try {
    const response = await testimonialServerService.getAll();
    testimonials = response.data.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  return (
    <div>
      <TestimonialsListLoader testimonials={testimonials} />
    </div>
  );
};

export default TestimonialsPage;
