import { getErrorMessage } from "@/lib/error-handler";
import { orderServerService } from "@/services/orders/order.server";
import { Order } from "@/types/order";
import { OrderHeader } from "@/components/admin/orders/order-header";
import { OrderCard } from "@/components/admin/orders/order-card";
import { OrderCustomerDetails } from "@/components/admin/orders/order-customer-details";
import { OrderRightSidebar } from "@/components/admin/orders/order-right-sidebar";

export default async function OrderIdPage({
  params,
}: {
  params: Promise<{ orderId: number }>;
}) {
  const { orderId } = await params;

  let order: Order;

  try {
    const response = await orderServerService.getById(orderId);
    order = response.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  return (
    <div>
      <OrderHeader order={order} />

      <div className="grid grid-cols-5 gap-6 py-6">
        <div className="col-span-4 space-y-6">
          <OrderCard order={order} />
          <OrderCustomerDetails order={order} />
        </div>

        <div className="col-span-1">
          <OrderRightSidebar order={order} />
        </div>
      </div>
    </div>
  );
}
