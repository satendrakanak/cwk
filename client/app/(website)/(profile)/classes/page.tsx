import { ClassesView } from "@/components/profile/classes-view";
import { getSession } from "@/lib/auth";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";
import type {
  FacultyClassRecording,
  FacultyClassSession,
} from "@/types/faculty-workspace";

export default async function ClassesPage() {
  const session = await getSession();
  if (!session) return null;

  let sessions: FacultyClassSession[] = [];
  let recordings: FacultyClassRecording[] = [];

  try {
    [sessions, recordings] = await Promise.all([
      facultyWorkspaceServer.getMySessions(),
      facultyWorkspaceServer.getMyRecordings(),
    ]);
  } catch {
    sessions = [];
    recordings = [];
  }

  return (
    <ClassesView
      nowIso={new Date().toISOString()}
      recordings={recordings}
      sessions={sessions}
    />
  );
}
