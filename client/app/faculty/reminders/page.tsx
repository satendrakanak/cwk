import { FacultyRemindersPage } from "@/components/faculty/dashboard/faculty-reminders-page";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";

export default async function FacultyRemindersRoutePage() {
  const sessions = await facultyWorkspaceServer.getSessions();

  return <FacultyRemindersPage sessions={sessions} />;
}
