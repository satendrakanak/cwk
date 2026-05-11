import Container from "@/components/container";
import { CouponBulkClient } from "@/components/coupon/coupon-bulk-client";
import { CoursesBanner } from "@/components/layout/courses-banner";
import { getErrorMessage } from "@/lib/error-handler";
import { buildMetadata } from "@/lib/seo";
import { courseServerService } from "@/services/courses/course.server";
import { Course } from "@/types/course";

export const metadata = buildMetadata({
  title: "Courses",
  description:
    "Browse CodeWithKasa courses across programming, projects, live classes, and professional learning.",
  path: "/courses",
});

export default async function CoursesPage() {
  let courses: Course[] = [];

  try {
    const response = await courseServerService.getPopularCourses();
    courses = response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }
  return (
    <div>
      <CoursesBanner totalCourses={courses.length} />

      <section className="academy-section relative bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-(--surface-shell)" />
        </div>

        <Container className="relative z-10">
          <CouponBulkClient courses={courses} />
        </Container>
      </section>
    </div>
  );
}
