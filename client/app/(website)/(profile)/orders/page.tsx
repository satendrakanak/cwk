import { OrderHistory } from "@/components/profile/order-history";
import { getSession } from "@/lib/auth";
import { getErrorMessage } from "@/lib/error-handler";
import { orderServerService } from "@/services/orders/order.server";
import { userServerService } from "@/services/users/user.server";
import { Course } from "@/types/course";
import { Order } from "@/types/order";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) return null;

  let orders: Order[] = [];
  let enrolledCourses: Course[] = [];

  try {
    const [ordersResponse, enrolledCoursesResponse] = await Promise.all([
      orderServerService.getMine(),
      userServerService.getEnrolledCourses(session.id),
    ]);

    orders = ordersResponse.data;
    enrolledCourses = enrolledCoursesResponse.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  return (
    <div className="space-y-6">
      <OrderHistory
        orders={orders}
        enrolledCourses={enrolledCourses}
        canRequestRefund={session.canRequestRefund}
      />
    </div>
  );
}
