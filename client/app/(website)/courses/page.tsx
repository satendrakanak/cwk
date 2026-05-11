import Container from "@/components/container";
import { InfiniteCoursesGrid } from "@/components/courses/infinite-courses-grid";
import { CoursesBanner } from "@/components/layout/courses-banner";
import { getErrorMessage } from "@/lib/error-handler";
import { buildMetadata } from "@/lib/seo";
import { courseServerService } from "@/services/courses/course.server";

const PAGE_SIZE = 9;

export const metadata = buildMetadata({
  title: "Courses",
  description:
    "Browse CodeWithKasa courses across programming, projects, live classes, and professional learning.",
  path: "/courses",
});

export default async function CoursesPage() {
  const response = await courseServerService
    .getPublicCourses({ page: 1, limit: PAGE_SIZE })
    .catch((error: unknown) => {
      const message = getErrorMessage(error);
      throw new Error(message);
    });

  const coursesPage = response.data;

  return (
    <div>
      <CoursesBanner totalCourses={coursesPage.meta.totalItems} />

      <section className="academy-section relative bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-(--surface-shell)" />
        </div>

        <Container className="relative z-10">
          <InfiniteCoursesGrid initialPage={coursesPage} pageSize={PAGE_SIZE} />
        </Container>
      </section>
    </div>
  );
}
