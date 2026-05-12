import Container from "@/components/container";
import { CourseHero } from "@/components/course/course-hero";
import { CourseSidebarCard } from "@/components/course/course-sidebar-card";
import { CourseTabs } from "@/components/course/course-tabs";
import { RelatedCourses } from "@/components/course/related-courses";
import { getErrorMessage } from "@/lib/error-handler";
import { courseServerService } from "@/services/courses/course.server";
import { courseReviewServerService } from "@/services/course-reviews/course-review.server";
import { testimonialServerService } from "@/services/testimonials/testimonial.server";
import { Course } from "@/types/course";
import { CourseReviewSummary } from "@/types/course-review";
import { Testimonial } from "@/types/testimonial";
import { buildMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type CoursePageProps = {
  params: Promise<{ courseSlug: string }>;
};

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;

  try {
    const response = await courseServerService.getBySlug(courseSlug);
    const course = response.data;

    return buildMetadata({
      title: course.metaTitle || course.title,
      description:
        course.metaDescription || course.shortDescription || course.description,
      path: `/course/${course.slug}`,
      image: course.image?.path,
    });
  } catch {
    return buildMetadata({
      title: "Course not found",
      description: "This course is not currently available.",
      path: `/course/${courseSlug}`,
    });
  }
}

export default async function CourseSlugPage({ params }: CoursePageProps) {
  const { courseSlug } = await params;

  if (!courseSlug) {
    notFound();
  }

  let course: Course;

  try {
    const response = await courseServerService.getBySlug(courseSlug);
    course = response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error).toLowerCase();
    if (message.includes("not found") || message.includes("404")) {
      notFound();
    }
    throw new Error(getErrorMessage(error));
  }

  let relatedCourses: Course[] = [];
  let testimonials: Testimonial[] = [];
  let reviewSummary: CourseReviewSummary = {
    average: 0,
    total: 0,
    breakdown: [5, 4, 3, 2, 1].map((rating) => ({ rating, count: 0 })),
  };

  try {
    const [
      relatedCoursesResponse,
      testimonialsResponse,
      reviewSummaryResponse,
    ] = await Promise.all([
      courseServerService.getRealtedCourses(course.id),
      testimonialServerService.getPublic({
        courseId: course.id,
        limit: 6,
      }),
      courseReviewServerService.getSummary(course.id),
    ]);

    relatedCourses = relatedCoursesResponse.data;
    testimonials = testimonialsResponse.data.data;
    reviewSummary = reviewSummaryResponse.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  return (
    <div className="relative bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />
      </div>

      <div className="relative z-10">
        {/* HERO */}
        <CourseHero course={course} reviewSummary={reviewSummary} />

        <Container>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-9">
            {/* LEFT */}
            <div className="order-2 min-w-0 lg:order-1 lg:mt-8">
              <CourseTabs course={course} testimonials={testimonials} />
            </div>

            {/* RIGHT */}
            <div className="order-1 mt-6 w-full min-w-0 lg:sticky lg:top-28 lg:z-40 lg:order-2 lg:-mt-96 lg:mt-0">
              <CourseSidebarCard course={course} />
            </div>
          </div>
        </Container>

        <Container>
          <RelatedCourses courses={relatedCourses} />
        </Container>
      </div>
    </div>
  );
}
