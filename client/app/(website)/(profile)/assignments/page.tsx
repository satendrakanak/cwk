import { AssignmentsView } from "@/components/profile/assignments-view";
import { getErrorMessage } from "@/lib/error-handler";
import { assignmentServerService } from "@/services/assignments/assignment.server";

export default async function AssignmentsPage() {
  let assignments: Awaited<
    ReturnType<typeof assignmentServerService.getMyAssignments>
  >["data"] = [];

  try {
    const response = await assignmentServerService.getMyAssignments();
    assignments = response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }

  return (
    <AssignmentsView assignments={assignments} currentTime={new Date().getTime()} />
  );
}
