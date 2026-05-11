import { RefundsDashboard } from "@/components/admin/refunds/refunds-dashboard";
import { getErrorMessage } from "@/lib/error-handler";
import {
  getDateRangeFromSearchParams,
  getServerDateRangeQuery,
} from "@/lib/date-range";
import { refundServerService } from "@/services/refunds/refund.server";
import { RefundRequest } from "@/types/order";

type AdminRefundsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminRefundsPage({
  searchParams,
}: AdminRefundsPageProps) {
  const resolvedSearchParams = await searchParams;
  const dateRange = getDateRangeFromSearchParams(resolvedSearchParams);
  const rangeParams = new URLSearchParams(getServerDateRangeQuery(dateRange));
  let refundRequests: RefundRequest[] = [];

  try {
    const response = await refundServerService.getAdminList({
      startDate: rangeParams.get("startDate") || undefined,
      endDate: rangeParams.get("endDate") || undefined,
    });
    refundRequests = response.data || [];
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error));
  }

  return (
    <RefundsDashboard refundRequests={refundRequests} dateRange={dateRange} />
  );
}
