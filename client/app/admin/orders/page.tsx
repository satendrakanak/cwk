import { OrdersListLoader } from "@/components/admin/orders/orders-list-loader";
import { getErrorMessage } from "@/lib/error-handler";
import {
  getDateRangeFromSearchParams,
  getServerDateRangeQuery,
} from "@/lib/date-range";
import { orderServerService } from "@/services/orders/order.server";
import { Order } from "@/types/order";
import { notFound } from "next/navigation";

type OrdersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const OrdersPage = async ({ searchParams }: OrdersPageProps) => {
  const resolvedSearchParams = await searchParams;
  const dateRange = getDateRangeFromSearchParams(resolvedSearchParams);
  const rangeParams = new URLSearchParams(getServerDateRangeQuery(dateRange));
  let orders: Order[] = [];

  try {
    const response = await orderServerService.getAll({
      startDate: rangeParams.get("startDate") || undefined,
      endDate: rangeParams.get("endDate") || undefined,
    });
    orders = response.data || [];
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    console.error("Orders fetch error:", message);
    notFound(); // only for real error
  }

  return (
    <div>
      <OrdersListLoader orders={orders} dateRange={dateRange} />
    </div>
  );
};

export default OrdersPage;
