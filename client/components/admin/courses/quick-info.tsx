import { Course } from "@/types/course";
import { formatDate } from "@/utils/formate-date";

interface QuickInfoProps {
  course: Course;
}

export default function QuickInfo({ course }: QuickInfoProps) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-muted-foreground shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))] dark:text-slate-300">
      <p>Course ID: #{course.id}</p>

      <p>Created At: {formatDate(course.createdAt)}</p>

      <p>Created By: {course.createdBy?.firstName || "—"}</p>

      <p>Last updated: {formatDate(course.updatedAt)}</p>

      <p>Updated By: {course.updatedBy?.firstName || "—"}</p>
    </div>
  );
}
