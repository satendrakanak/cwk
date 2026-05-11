import { FacultyRecordingsPage } from "@/components/faculty/dashboard/faculty-recordings-page";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";

export default async function FacultyRecordingsRoutePage() {
  const [recordings, sessions] = await Promise.all([
    facultyWorkspaceServer.getRecordings(),
    facultyWorkspaceServer.getSessions(),
  ]);

  return <FacultyRecordingsPage recordings={recordings} sessions={sessions} />;
}
