import { FacultyStudentsPage } from "@/components/faculty/dashboard/faculty-students-page";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";

export default async function FacultyStudentsRoutePage() {
  const batches = await facultyWorkspaceServer.getBatches();

  return <FacultyStudentsPage batches={batches} />;
}
