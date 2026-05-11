import { FacultyDashboard } from "@/components/faculty/dashboard/faculty-dashboard";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";

export default async function FacultyDashboardPage() {
  const data = await facultyWorkspaceServer.getWorkspace();

  return <FacultyDashboard data={data} />;
}
