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
import { assignmentServerService } from "@/services/assignments/assignment.server";
import type { Assignment } from "@/types/assignment";
import { getRoleHomePath } from "@/lib/role-redirect";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const roleHomePath = getRoleHomePath(session.roles);
  if (roleHomePath !== "/dashboard") {
    redirect(roleHomePath);
  }

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
  let assignments: Assignment[] = [];

  try {
    const [
      statsRes,
      coursesRes,
      weeklyProgressRes,
      ordersRes,
      examHistoryRes,
      upcomingClassesRes,
      assignmentsRes,
    ] = await Promise.all([
      userServerService.getDashboardStats(session.id),
      userServerService.getEnrolledCourses(session.id),
      userServerService.getWeeklyProgress(session.id),
      orderServerService.getMine(),
      courseExamsServerService.getMyHistory(),
      facultyWorkspaceServer.getMyUpcomingSessions(),
      assignmentServerService.getMyAssignments(),
    ]);

    stats = statsRes.data;
    courses = coursesRes.data;
    weeklyProgress = weeklyProgressRes.data;
    orders = ordersRes.data;
    examHistory = examHistoryRes.data;
    upcomingClasses = upcomingClassesRes;
    assignments = assignmentsRes.data;
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
        assignments={assignments}
      />
    </div>
  );
}
