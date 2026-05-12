import { AssignmentAdminWorkspace } from "@/components/assignments/assignment-admin-workspace";
import { getErrorMessage } from "@/lib/error-handler";
import { assignmentServerService } from "@/services/assignments/assignment.server";
import { courseServerService } from "@/services/courses/course.server";
import { userServerService } from "@/services/users/user.server";

export default async function AdminAssignmentsPage() {
  let data: Awaited<
    ReturnType<typeof assignmentServerService.getAssignments>
  >["data"] = [];
  let submissions: Awaited<
    ReturnType<typeof assignmentServerService.getSubmissions>
  >["data"] = [];
  let courses: Awaited<
    ReturnType<typeof courseServerService.getAllCourses>
  >["data"]["data"] = [];
  let faculties: Awaited<
    ReturnType<typeof userServerService.getFaculties>
  >["data"] = [];

  try {
    const [assignmentsResponse, submissionsResponse, coursesResponse, facultiesResponse] =
      await Promise.all([
        assignmentServerService.getAssignments(),
        assignmentServerService.getSubmissions(),
        courseServerService.getAllCourses({ limit: 10000 }),
        userServerService.getFaculties(),
      ]);

    data = assignmentsResponse.data;
    submissions = submissionsResponse.data;
    courses = coursesResponse.data.data;
    faculties = facultiesResponse.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  return (
    <AssignmentAdminWorkspace
      mode="admin"
      assignments={data}
      submissions={submissions}
      courses={courses}
      faculties={faculties}
      currentTime={new Date().getTime()}
    />
  );
}
