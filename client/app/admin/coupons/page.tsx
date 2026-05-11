import { CouponsListLoader } from "@/components/admin/coupons/coupons-list-loader";
import { getErrorMessage } from "@/lib/error-handler";
import {
  getDateRangeFromSearchParams,
  getServerDateRangeQuery,
} from "@/lib/date-range";
import { couponServerService } from "@/services/coupons/coupon.server";
import { Coupon } from "@/types/coupon";

type CouponsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const CouponsPage = async ({ searchParams }: CouponsPageProps) => {
  const resolvedSearchParams = await searchParams;
  const dateRange = getDateRangeFromSearchParams(resolvedSearchParams);
  const rangeParams = new URLSearchParams(getServerDateRangeQuery(dateRange));
  let coupons: Coupon[] = [];
  try {
    const response = await couponServerService.getAll({
      startDate: rangeParams.get("startDate") || undefined,
      endDate: rangeParams.get("endDate") || undefined,
      limit: 10000,
    });
    coupons = response.data.data;
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    throw new Error(message);
  }

  return (
    <div>
      <CouponsListLoader coupons={coupons} dateRange={dateRange} />
    </div>
  );
};

export default CouponsPage;
