import type { FacultyClassSession } from "@/types/faculty-workspace";

const CLOSED_SESSION_STATUSES = new Set(["completed", "cancelled"]);

export function getLearnerUpcomingSessions(
  sessions: FacultyClassSession[],
  nowIso: string,
) {
  const now = new Date(nowIso).getTime();

  return sessions
    .filter((session) => {
      const status = session.status?.toLowerCase();
      const endsAt = new Date(session.endsAt).getTime();

      return (
        Number.isFinite(endsAt) &&
        endsAt >= now &&
        !CLOSED_SESSION_STATUSES.has(status)
      );
    })
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() -
        new Date(right.startsAt).getTime(),
    );
}

export function canLearnerJoinSession(
  session: FacultyClassSession,
  nowIso: string,
) {
  const status = session.status?.toLowerCase();
  const endsAt = new Date(session.endsAt).getTime();

  return (
    Number.isFinite(endsAt) &&
    endsAt >= new Date(nowIso).getTime() &&
    !CLOSED_SESSION_STATUSES.has(status)
  );
}
