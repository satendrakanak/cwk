import { CoursesListLoader } from "@/components/admin/courses/courses-list-loader";
import { getErrorMessage } from "@/lib/error-handler";
import {
  getDateRangeFromSearchParams,
  getServerDateRangeQuery,
} from "@/lib/date-range";
import { courseServerService } from "@/services/courses/course.server";
import { Course } from "@/types/course";

type CoursesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const CoursesPage = async ({ searchParams }: CoursesPageProps) => {
  const resolvedSearchParams = await searchParams;
  const dateRange = getDateRangeFromSearchParams(resolvedSearchParams);
  const rangeParams = new URLSearchParams(getServerDateRangeQuery(dateRange));
  let courses: Course[] = [];
  try {
    const response = await courseServerService.getAllCourses({
      startDate: rangeParams.get("startDate") || undefined,
      endDate: rangeParams.get("endDate") || undefined,
      limit: 10000,
    });
    courses = response.data.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  return (
    <div>
      <CoursesListLoader courses={courses} dateRange={dateRange} />
    </div>
  );
};

export default CoursesPage;
