import { FacultyClassesPage } from "@/components/faculty/dashboard/faculty-classes-page";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";
import { getTodayDateKey } from "@/utils/formate-date";

export default async function FacultyClassesRoutePage() {
  const [sessions, batches] = await Promise.all([
    facultyWorkspaceServer.getSessions(),
    facultyWorkspaceServer.getBatches(),
  ]);

  return (
    <FacultyClassesPage
      batches={batches}
      sessions={sessions}
      todayKey={getTodayDateKey()}
      nowIso={new Date().toISOString()}
    />
  );
}
