import { AssignmentAdminWorkspace } from "@/components/assignments/assignment-admin-workspace";
import { getErrorMessage } from "@/lib/error-handler";
import { assignmentServerService } from "@/services/assignments/assignment.server";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";
import { userServerService } from "@/services/users/user.server";

export default async function FacultyAssignmentsPage() {
  let assignments: Awaited<
    ReturnType<typeof assignmentServerService.getAssignments>
  >["data"] = [];
  let submissions: Awaited<
    ReturnType<typeof assignmentServerService.getSubmissions>
  >["data"] = [];
  let courses: Awaited<ReturnType<typeof facultyWorkspaceServer.getCourses>> =
    [];
  let faculties: Awaited<ReturnType<typeof userServerService.getMe>>["data"][] =
    [];

  try {
    const [assignmentsResponse, submissionsResponse, facultyCourses, me] =
      await Promise.all([
        assignmentServerService.getAssignments(),
        assignmentServerService.getSubmissions(),
        facultyWorkspaceServer.getCourses(),
        userServerService.getMe(),
      ]);

    assignments = assignmentsResponse.data;
    submissions = submissionsResponse.data;
    courses = facultyCourses;
    faculties = [me.data];
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  return (
    <AssignmentAdminWorkspace
      mode="faculty"
      assignments={assignments}
      submissions={submissions}
      courses={courses}
      faculties={faculties}
      currentTime={new Date().getTime()}
    />
  );
}
