import { AdminDashboard } from "@/components/admin/dashboard/admin-dashboard";
import { buildDashboardData } from "@/components/admin/dashboard/build-dashboard-data";
import { VerifiedToast } from "@/components/admin/verified-toast";
import {
  getDateRangeFromSearchParams,
  getServerDateRangeQuery,
} from "@/lib/date-range";
import { courseExamsServerService } from "@/services/course-exams/course-exams.server";
import { couponServerService } from "@/services/coupons/coupon.server";
import { courseServerService } from "@/services/courses/course.server";
import { orderServerService } from "@/services/orders/order.server";
import { userServerService } from "@/services/users/user.server";
import { getErrorMessage } from "@/lib/error-handler";
import { AdminExamOverview } from "@/types/exam";
import { Coupon } from "@/types/coupon";
import { Course } from "@/types/course";
import { Order } from "@/types/order";
import { User } from "@/types/user";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const dateRange = getDateRangeFromSearchParams(resolvedSearchParams);
  const rangeParams = new URLSearchParams(getServerDateRangeQuery(dateRange));
  const rangeQuery = {
    startDate: rangeParams.get("startDate") || undefined,
    endDate: rangeParams.get("endDate") || undefined,
  };
  let orders: Order[] = [];
  let users: User[] = [];
  let courses: Course[] = [];
  let coupons: Coupon[] = [];
  let examOverview: AdminExamOverview = {
    totalAttempts: 0,
    uniqueLearners: 0,
    passedAttempts: 0,
    certificatesIssued: 0,
    averageScore: 0,
    passRate: 0,
    recentAttempts: [],
    topCourses: [],
  };

  try {
    const [
      ordersResponse,
      usersResponse,
      coursesResponse,
      couponsResponse,
      examsResponse,
    ] = await Promise.all([
      orderServerService.getAll(rangeQuery),
      userServerService.getAll({ ...rangeQuery, limit: 10000 }),
      courseServerService.getAllCourses({ ...rangeQuery, limit: 10000 }),
      couponServerService.getAll({ ...rangeQuery, limit: 10000 }),
      courseExamsServerService.getAdminOverview(),
    ]);

    orders = ordersResponse.data || [];
    users = usersResponse.data.data || [];
    courses = coursesResponse.data.data || [];
    coupons = couponsResponse.data.data || [];
    examOverview = examsResponse.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  const dashboardData = buildDashboardData(
    orders,
    users,
    courses,
    coupons,
    examOverview,
  );

  return (
    <div className="space-y-6">
      <AdminDashboard data={dashboardData} dateRange={dateRange} />
      <VerifiedToast />
    </div>
  );
}
