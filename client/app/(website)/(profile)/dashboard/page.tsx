import { userServerService } from "@/services/users/user.server";
import { getSession } from "@/lib/auth";
import { Course } from "@/types/course";
import DashboardClient from "@/components/profile/dashboard-client";
import { DashboardStats, WeeklyProgress } from "@/types/user";
import { getErrorMessage } from "@/lib/error-handler";
import { orderServerService } from "@/services/orders/order.server";
import { Order } from "@/types/order";
import { courseExamsServerService } from "@/services/course-exams/course-exams.server";
import { ExamHistoryRecord } from "@/types/exam";
import { facultyWorkspaceServer } from "@/services/faculty/faculty-workspace.server";
import type { FacultyClassSession } from "@/types/faculty-workspace";
import { getLearnerUpcomingSessions } from "@/lib/learner-class-sessions";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;
  let stats: DashboardStats = {
    courses: 0,
    completed: 0,
    progress: 0,
    examsTaken: 0,
    examsPassed: 0,
    certificatesEarned: 0,
    learningSummary: undefined,
  };
  let courses: Course[] = [];
  let weeklyProgress: WeeklyProgress[] = [];
  let orders: Order[] = [];
  let examHistory: ExamHistoryRecord[] = [];
  let upcomingClasses: FacultyClassSession[] = [];

  try {
    const [
      statsRes,
      coursesRes,
      weeklyProgressRes,
      ordersRes,
      examHistoryRes,
      upcomingClassesRes,
    ] =
      await Promise.all([
        userServerService.getDashboardStats(session.id),
        userServerService.getEnrolledCourses(session.id),
        userServerService.getWeeklyProgress(session.id),
        orderServerService.getMine(),
        courseExamsServerService.getMyHistory(),
        facultyWorkspaceServer.getMySessions(),
      ]);

    stats = statsRes.data;
    courses = coursesRes.data;
    weeklyProgress = weeklyProgressRes.data;
    orders = ordersRes.data;
    examHistory = examHistoryRes.data;
    upcomingClasses = getLearnerUpcomingSessions(
      upcomingClassesRes,
      new Date().toISOString(),
    );
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Welcome back 👋
        </h2>

        <p className="text-sm text-muted-foreground">
          Keep learning and track your progress
        </p>
      </div>

      <DashboardClient
        stats={stats}
        courses={courses}
        weeklyProgress={weeklyProgress}
        orders={orders}
        examHistory={examHistory}
        user={session}
        upcomingClasses={upcomingClasses}
      />
    </div>
  );
}
