import { Coupon } from "@/types/coupon";
import { formatDate } from "@/utils/formate-date";

interface CouponQuickInfoProps {
  coupon: Coupon;
}

export function CouponQuickInfo({ coupon }: CouponQuickInfoProps) {
  return (
    <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-muted-foreground shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(17,27,46,0.98))] dark:text-slate-300">
      <p>Coupon ID: #{coupon.id}</p>

      <p>Created At: {formatDate(coupon.createdAt)}</p>

      <p>Last updated: {formatDate(coupon.updatedAt)}</p>
    </div>
  );
}
