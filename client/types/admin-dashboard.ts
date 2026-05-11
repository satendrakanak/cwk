export type AdminDashboardSummary = {
  totalRevenue: number;
  paidOrders: number;
  totalUsers: number;
  enrolledUsers: number;
  totalCourses: number;
  publishedCourses: number;
  totalCoupons: number;
  couponRedemptions: number;
  totalDiscountGiven: number;
  averageOrderValue: number;
  totalExamAttempts: number;
  passedExamAttempts: number;
  certificatesIssued: number;
  averageExamScore: number;
};

export type AdminRevenuePoint = {
  month: string;
  revenue: number;
  discounts: number;
  orders: number;
};

export type AdminStatusPoint = {
  name: string;
  value: number;
  fill: string;
};

export type AdminTopCoursePoint = {
  id: number;
  title: string;
  slug: string;
  sales: number;
  revenue: number;
};

export type AdminCouponUsagePoint = {
  id: number;
  code: string;
  usedCount: number;
  usageLimit: number | null;
  usageRate: number;
  status: string;
  isAutoApply: boolean;
};

export type AdminRecentOrderPoint = {
  id: number;
  customerName: string;
  courseNames: string[];
  totalAmount: number;
  status: string;
  createdAt: string;
};

export type AdminDashboardData = {
  summary: AdminDashboardSummary;
  learningOps: {
    selfLearningCourses: number;
    facultyLedCourses: number;
    hybridCourses: number;
    publishedCourses: number;
    draftCourses: number;
  };
  revenueTrend: AdminRevenuePoint[];
  orderStatusDistribution: AdminStatusPoint[];
  topCourses: AdminTopCoursePoint[];
  couponUsage: AdminCouponUsagePoint[];
  recentOrders: AdminRecentOrderPoint[];
  examOverview: {
    uniqueLearners: number;
    passRate: number;
    recentAttempts: {
      id: number;
      source?: "legacy" | "advanced";
      learnerName: string;
      courseTitle: string;
      score: number;
      maxScore: number;
      percentage: number;
      passed: boolean;
      submittedAt: string | null;
    }[];
    topCourses: {
      courseId: number;
      courseTitle: string;
      attempts: number;
      passCount: number;
      averageScore: number;
    }[];
  };
};
