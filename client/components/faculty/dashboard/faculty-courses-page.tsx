import { BookOpen, CalendarDays, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCourseDeliveryLabel, hasLiveClasses } from "@/lib/course-delivery";
import type { FacultyWorkspaceCourse } from "@/types/faculty-workspace";

type FacultyCoursesPageProps = {
  courses: FacultyWorkspaceCourse[];
  canEditAssignedCourses?: boolean;
};

export function FacultyCoursesPage({
  courses,
  canEditAssignedCourses = false,
}: FacultyCoursesPageProps) {
  const published = courses.filter((course) => course.isPublished).length;
  const students = courses.reduce((total, course) => total + course.studentsCount, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Assigned courses
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Courses you manage
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          These courses are connected to your faculty profile and classroom batches.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat icon={BookOpen} label="Assigned courses" value={courses.length} />
        <Stat icon={CalendarDays} label="Published" value={published} />
        <Stat icon={Users} label="Active students" value={students} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {courses.length ? (
          courses.map((course) => (
            <div key={course.id} className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{course.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {course.studentsCount} active students
                  </p>
                </div>
                <Badge variant={course.isPublished ? "default" : "secondary"}>
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">
                  {getCourseDeliveryLabel(course.mode).shortLabel}
                </Badge>
                {course.duration ? <Badge variant="outline">{course.duration}</Badge> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/course/${course.slug}`}>View course</Link>
                </Button>
                {hasLiveClasses(course) ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href="/faculty/batches">Manage batches</Link>
                  </Button>
                ) : null}
                {canEditAssignedCourses ? (
                  <Button asChild size="sm">
                    <Link href={`/admin/courses/${course.id}`}>Edit course</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <Empty text="No courses are assigned to you yet." />
        )}
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground lg:col-span-2">
      {text}
    </div>
  );
}
