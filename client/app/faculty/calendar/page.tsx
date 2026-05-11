import { FacultyCalendarPage } from "@/components/faculty/dashboard/faculty-calendar-page";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";
import { getTodayDateKey } from "@/utils/formate-date";

type FacultyCalendarRoutePageProps = {
  searchParams: Promise<{
    batchId?: string;
    date?: string;
    action?: string;
    sessionId?: string;
  }>;
};

export default async function FacultyCalendarRoutePage({
  searchParams,
}: FacultyCalendarRoutePageProps) {
  const params = await searchParams;
  const [sessions, batches] = await Promise.all([
    facultyWorkspaceServer.getSessions(),
    facultyWorkspaceServer.getBatches(),
  ]);

  return (
    <FacultyCalendarPage
      sessions={sessions}
      batches={batches}
      todayKey={getTodayDateKey()}
      nowIso={new Date().toISOString()}
      initialBatchId={params.batchId ? Number(params.batchId) : undefined}
      initialDate={params.date}
      initialSessionId={params.sessionId ? Number(params.sessionId) : undefined}
      openCreateOnLoad={params.action === "create"}
    />
  );
}
