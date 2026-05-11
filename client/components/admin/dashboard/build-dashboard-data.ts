import { AdminDashboardData } from "@/types/admin-dashboard";
import { Coupon } from "@/types/coupon";
import { Course } from "@/types/course";
import { AdminExamOverview } from "@/types/exam";
import { Order, OrderStatus } from "@/types/order";
import { User } from "@/types/user";

const MONTHS_TO_SHOW = 6;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function buildDashboardData(
  orders: Order[],
  users: User[],
  courses: Course[],
  coupons: Coupon[],
  examOverview: AdminExamOverview,
): AdminDashboardData {
  const paidOrders = orders.filter(
    (order) => order.status === OrderStatus.PAID,
  );
  const enrolledUsers = new Set(
    paidOrders.map((order) => order.user?.id).filter(Boolean),
  ).size;
  const totalRevenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0,
  );
  const totalDiscountGiven = paidOrders.reduce(
    (sum, order) =>
      sum +
      Number(order.discount || 0) +
      Number(order.autoDiscount || 0) +
      Number(order.manualDiscount || 0),
    0,
  );

  const monthMap = new Map<
    string,
    { month: string; revenue: number; discounts: number; orders: number }
  >();
  const now = new Date();

  for (let i = MONTHS_TO_SHOW - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    monthMap.set(key, {
      month: MONTH_LABELS[date.getMonth()],
      revenue: 0,
      discounts: 0,
      orders: 0,
    });
  }

  const courseStats = new Map<
    number,
    { id: number; title: string; slug: string; sales: number; revenue: number }
  >();

  for (const order of paidOrders) {
    const paidAt = new Date(order.paidAt || order.createdAt);
    const monthKey = `${paidAt.getFullYear()}-${paidAt.getMonth()}`;
    const currentMonth = monthMap.get(monthKey);

    if (currentMonth) {
      currentMonth.revenue += Number(order.totalAmount || 0);
      currentMonth.discounts +=
        Number(order.discount || 0) +
        Number(order.autoDiscount || 0) +
        Number(order.manualDiscount || 0);
      currentMonth.orders += 1;
    }

    for (const item of order.items || []) {
      const existing = courseStats.get(item.courseId) || {
        id: item.courseId,
        title: item.course?.title || `Course #${item.courseId}`,
        slug: item.course?.slug || "",
        sales: 0,
        revenue: 0,
      };

      existing.sales += Number(item.quantity || 0);
      existing.revenue += Number(item.price || 0) * Number(item.quantity || 0);
      courseStats.set(item.courseId, existing);
    }
  }

  const orderStatuses: Record<string, number> = {
    PAID: 0,
    PENDING: 0,
    FAILED: 0,
    CANCELLED: 0,
  };

  for (const order of orders) {
    orderStatuses[order.status] = (orderStatuses[order.status] || 0) + 1;
  }

  const statusColors: Record<string, string> = {
    PAID: "var(--brand-500)",
    PENDING: "#f59e0b",
    FAILED: "#ef4444",
    CANCELLED: "#94a3b8",
  };

  return {
    summary: {
      totalRevenue,
      paidOrders: paidOrders.length,
      totalUsers: users.length,
      enrolledUsers,
      totalCourses: courses.length,
      publishedCourses: courses.filter((course) => course.isPublished).length,
      totalCoupons: coupons.length,
      couponRedemptions: coupons.reduce(
        (sum, coupon) => sum + Number(coupon.usedCount || 0),
        0,
      ),
      totalDiscountGiven,
      averageOrderValue: paidOrders.length
        ? totalRevenue / paidOrders.length
        : 0,
      totalExamAttempts: examOverview.totalAttempts,
      passedExamAttempts: examOverview.passedAttempts,
      certificatesIssued: examOverview.certificatesIssued,
      averageExamScore: examOverview.averageScore,
    },
    learningOps: {
      selfLearningCourses: courses.filter(
        (course) => !course.mode || course.mode === "self_learning",
      ).length,
      facultyLedCourses: courses.filter((course) => course.mode === "faculty_led")
        .length,
      hybridCourses: courses.filter((course) => course.mode === "hybrid").length,
      publishedCourses: courses.filter((course) => course.isPublished).length,
      draftCourses: courses.filter((course) => !course.isPublished).length,
    },
    revenueTrend: Array.from(monthMap.values()),
    orderStatusDistribution: Object.entries(orderStatuses).map(
      ([name, value]) => ({
        name,
        value,
        fill: statusColors[name] || "#94a3b8",
      }),
    ),
    topCourses: Array.from(courseStats.values())
      .sort((a, b) => b.sales - a.sales || b.revenue - a.revenue)
      .slice(0, 8),
    couponUsage: coupons
      .map((coupon) => ({
        id: coupon.id,
        code: coupon.code,
        usedCount: Number(coupon.usedCount || 0),
        usageLimit: coupon.usageLimit ?? null,
        usageRate: coupon.usageLimit
          ? (Number(coupon.usedCount || 0) / Number(coupon.usageLimit)) * 100
          : Math.min(Number(coupon.usedCount || 0) * 10, 100),
        status: coupon.status,
        isAutoApply: coupon.isAutoApply,
      }))
      .sort((a, b) => b.usedCount - a.usedCount),
    recentOrders: orders
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 6)
      .map((order) => ({
        id: order.id,
        customerName:
          `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() ||
          order.billingAddress?.firstName ||
          "Customer",
        courseNames: (order.items || []).map(
          (item) => item.course?.title || "Course",
        ),
        totalAmount: Number(order.totalAmount || 0),
        status: order.status,
        createdAt: order.createdAt,
      })),
    examOverview: {
      uniqueLearners: examOverview.uniqueLearners,
      passRate: examOverview.passRate,
      recentAttempts: examOverview.recentAttempts,
      topCourses: examOverview.topCourses,
    },
  };
}
