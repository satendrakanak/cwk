"use client";

import { Course } from "@/types/course";
import { DateRangeValue } from "@/lib/date-range";
import { CoursesList } from "./courses-list";

export function CoursesListLoader({
  courses,
  dateRange,
}: {
  courses: Course[];
  dateRange: DateRangeValue;
}) {
  return <CoursesList courses={courses} dateRange={dateRange} />;
}
