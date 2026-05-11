import { FacultyCoursesPage } from "@/components/faculty/dashboard/faculty-courses-page";
import { hasPermission } from "@/lib/access-control";
import { getSession } from "@/lib/auth";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";

export default async function FacultyCoursesRoutePage() {
  const [courses, session] = await Promise.all([
    facultyWorkspaceServer.getCourses(),
    getSession(),
  ]);

  return (
    <FacultyCoursesPage
      courses={courses}
      canEditAssignedCourses={hasPermission(session, "edit_assigned_course")}
    />
  );
}
