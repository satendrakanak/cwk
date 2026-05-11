import { FacultyBatchesPage } from "@/components/faculty/dashboard/faculty-batches-page";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";
import { getTodayDateKey } from "@/utils/formate-date";

export default async function FacultyBatchesRoutePage() {
  const [batches, workspace] = await Promise.all([
    facultyWorkspaceServer.getBatches(),
    facultyWorkspaceServer.getWorkspace(),
  ]);

  return (
    <FacultyBatchesPage
      batches={batches}
      courses={workspace.courses}
      todayKey={getTodayDateKey()}
    />
  );
}
