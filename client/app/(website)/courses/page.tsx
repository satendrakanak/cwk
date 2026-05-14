import Container from "@/components/container";
import { CoursesFilterBar } from "@/components/courses/courses-filter-bar";
import { InfiniteCoursesGrid } from "@/components/courses/infinite-courses-grid";
import { CoursesBanner } from "@/components/layout/courses-banner";
import { COURSE_DELIVERY_MODES } from "@/lib/course-delivery";
import { getErrorMessage } from "@/lib/error-handler";
import { buildMetadata } from "@/lib/seo";
import { getAllowedCourseModes } from "@/lib/license/feature-access";
import { courseServerService } from "@/services/courses/course.server";
import { licenseServerService } from "@/services/licenses/license.server";
import { Course } from "@/types/course";
import type { CourseDeliveryMode } from "@/types/license";

const PAGE_SIZE = 9;

export const metadata = buildMetadata({
  title: "Courses",
  description:
    "Browse CodeWithKasa courses across programming, projects, live classes, and professional learning.",
  path: "/courses",
});

type CourseFilterItem = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

function getCourseCategories(courses: Course[]): CourseFilterItem[] {
  return Array.from(
    courses
      .flatMap((course) => course.categories || [])
      .reduce(
        (map, category) =>
          map.set(category.id, {
            id: category.id,
            name: category.name,
            slug: category.slug,
            count: (map.get(category.id)?.count || 0) + 1,
          }),
        new Map<number, CourseFilterItem>(),
      )
      .values(),
  ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function getCourseTags(courses: Course[]): CourseFilterItem[] {
  return Array.from(
    courses
      .flatMap((course) => course.tags || [])
      .reduce(
        (map, tag) =>
          map.set(tag.id, {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            count: (map.get(tag.id)?.count || 0) + 1,
          }),
        new Map<number, CourseFilterItem>(),
      )
      .values(),
  ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string;
    category?: string;
    tag?: string;
  }>;
}) {
  const { mode, category, tag } = await searchParams;

  const [allCoursesResponse, licenseResponse] = await Promise.all([
    courseServerService.getPublicCourses({ page: 1, limit: 1000 }),
    licenseServerService.getCurrent().catch(() => null),
  ]).catch((error: unknown) => {
    const message = getErrorMessage(error);
    throw new Error(message);
  });

  const allowedModes = getAllowedCourseModes(licenseResponse?.data);
  const allCourses = allCoursesResponse.data.data.filter((course) =>
    allowedModes.includes((course.mode || "self_learning") as CourseDeliveryMode),
  );
  const categories = getCourseCategories(allCourses);
  const tags = getCourseTags(allCourses);
  const selectedMode = COURSE_DELIVERY_MODES.some(
    (item) => item.value === mode && allowedModes.includes(item.value),
  )
    ? mode
    : undefined;
  const selectedCategory = categories.some((item) => item.slug === category)
    ? category
    : undefined;
  const selectedTag = tags.some((item) => item.slug === tag) ? tag : undefined;

  const response = await courseServerService
    .getPublicCourses({
      page: 1,
      limit: PAGE_SIZE,
      mode: selectedMode,
      category: selectedCategory,
      tag: selectedTag,
    })
    .catch((error: unknown) => {
      const message = getErrorMessage(error);
      throw new Error(message);
    });

  const coursesPage = response.data;

  return (
    <div>
      <CoursesBanner
        totalCourses={coursesPage.meta.totalItems}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Courses" },
        ]}
      />

      <section className="academy-section relative bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-(--surface-shell)" />
        </div>

        <Container className="relative z-10">
          <div className="space-y-8">
            <CoursesFilterBar
              categories={categories}
              tags={tags}
              selectedMode={selectedMode}
              selectedCategory={selectedCategory}
              selectedTag={selectedTag}
              totalCourses={allCourses.length}
              allowedModes={allowedModes}
            />

            <InfiniteCoursesGrid
              key={`${selectedMode || "all"}-${selectedCategory || "all"}-${selectedTag || "all"}`}
              initialPage={coursesPage}
              pageSize={PAGE_SIZE}
              mode={selectedMode}
              category={selectedCategory}
              tag={selectedTag}
              allowedModes={allowedModes}
            />
          </div>
        </Container>
      </section>
    </div>
  );
}
