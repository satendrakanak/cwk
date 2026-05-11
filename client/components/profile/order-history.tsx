"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BadgeAlert,
  CircleCheckBig,
  CreditCard,
  FileClock,
  RotateCcw,
} from "lucide-react";

import {
  Order,
  OrderStatus,
  RefundRequest,
  RefundRequestStatus,
} from "@/types/order";
import { Course } from "@/types/course";
import { CourseProgressBar } from "@/components/courses/course-progress-bar";
import { RefundRequestDialog } from "./refunds/refund-request-dialog";
import { RefundTimeline } from "@/components/refunds/refund-timeline";
import { formatDate } from "@/utils/formate-date";

interface OrderHistoryProps {
  orders: Order[];
  enrolledCourses?: Course[];
  limit?: number;
  showViewAll?: boolean;
  canRequestRefund?: boolean;
}

const REFUND_WINDOW_DAYS = 7;
const MAX_REFUND_PROGRESS = 20;

export function OrderHistory({
  orders,
  enrolledCourses = [],
  limit,
  showViewAll = false,
  canRequestRefund: hasRefundAccess = false,
}: OrderHistoryProps) {
  const [refundDialogOrderId, setRefundDialogOrderId] = useState<number | null>(
    null,
  );

  const visibleOrders =
    typeof limit === "number" ? orders.slice(0, limit) : orders;

  const enrolledCourseMap = useMemo(
    () => new Map(enrolledCourses.map((course) => [course.id, course])),
    [enrolledCourses],
  );

  const latestRefundMap = useMemo(
    () =>
      new Map(
        visibleOrders.map((order) => [
          order.id,
          getLatestRefundRequest(order.refundRequests || []),
        ]),
      ),
    [visibleOrders],
  );

  return (
    <section>
      <div className="mb-5 flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Purchase History
          </p>

          <h3 className="mt-2 text-2xl font-semibold text-card-foreground">
            Recent Orders
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Track purchases, applied coupons, payment retries, and refund
            status.
          </p>
        </div>

        {showViewAll ? (
          <Link
            href="/orders"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            View all orders
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      {visibleOrders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="space-y-5">
          {visibleOrders.map((order) => {
            const primaryItem = order.items?.[0];
            const latestRefundRequest = latestRefundMap.get(order.id) || null;

            const enrolledCourse = primaryItem?.course
              ? enrolledCourseMap.get(primaryItem.course.id)
              : null;

            const courseProgress = enrolledCourse?.progress?.progress || 0;

            const refundEligibleTill = new Date(order.createdAt);
            refundEligibleTill.setDate(
              refundEligibleTill.getDate() + REFUND_WINDOW_DAYS,
            );

            const isWithinRefundWindow = new Date() <= refundEligibleTill;
            const isProgressAllowedForRefund =
              courseProgress <= MAX_REFUND_PROGRESS;

            const canRetry =
              order.status === OrderStatus.CANCELLED ||
              order.status === OrderStatus.FAILED;

            const canRequestRefund =
              [OrderStatus.PAID, OrderStatus.REFUND_FAILED].includes(
                order.status,
              ) &&
              hasRefundAccess &&
              isWithinRefundWindow &&
              isProgressAllowedForRefund &&
              (!latestRefundRequest ||
                [
                  RefundRequestStatus.REJECTED,
                  RefundRequestStatus.FAILED,
                ].includes(latestRefundRequest.status));

            const course = primaryItem?.course
              ? {
                  ...primaryItem.course,
                  isEnrolled: Boolean(enrolledCourse?.isEnrolled),
                  progress:
                    enrolledCourse?.progress || primaryItem.course.progress,
                }
              : null;

            const couponCode =
              order.manualCouponCode || order.autoCouponCode || null;

            return (
              <article key={order.id} className="academy-card overflow-hidden">
                <div className="space-y-5 p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-lg font-semibold text-card-foreground">
                          Order #{order.id}
                        </h4>

                        <OrderStatusPill status={order.status} />
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/50 px-4 py-3 text-left md:text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Total Paid
                      </p>

                      <p className="mt-1 text-xl font-bold text-card-foreground">
                        ₹{formatPrice(Number(order.totalAmount || 0))}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                    <div className="rounded-3xl border border-border bg-muted/50 p-4">
                      {course ? (
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <Link
                            href={`/course/${course.slug}`}
                            className="relative h-44 w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-card sm:h-28 sm:w-32"
                          >
                            <Image
                              src={course.image?.path || "/assets/default.png"}
                              alt={course.imageAlt || course.title}
                              fill
                              sizes="128px"
                              className="object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div className="min-w-0">
                                <Link
                                  href={`/course/${course.slug}`}
                                  className="line-clamp-2 text-lg font-semibold leading-7 text-card-foreground transition-colors hover:text-primary"
                                >
                                  {course.title}
                                </Link>

                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                  {course.shortDescription ||
                                    "Purchased course from your learning dashboard."}
                                </p>
                              </div>

                              <p className="shrink-0 text-sm font-bold text-card-foreground">
                                ₹{formatPrice(Number(primaryItem.price || 0))}
                              </p>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {course.experienceLevel ? (
                                <Tag>{course.experienceLevel}</Tag>
                              ) : null}

                              {course.language ? (
                                <Tag>{course.language}</Tag>
                              ) : null}

                              {course.isEnrolled ? (
                                <span className="inline-flex rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                  Enrolled
                                </span>
                              ) : null}
                            </div>

                            {course.isEnrolled ? (
                              <div className="mt-4 max-w-sm">
                                <CourseProgressBar
                                  percent={course.progress?.progress || 0}
                                  slug={course.slug}
                                  mode={course.mode}
                                />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
                          Course details are not available for this order.
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl border border-border bg-muted/50 p-4">
                      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                        Order Details
                      </p>

                      <div className="space-y-3">
                        <InfoLine
                          label="Items"
                          value={`${order.items?.length || 0} course${
                            (order.items?.length || 0) > 1 ? "s" : ""
                          }`}
                        />

                        {couponCode ? (
                          <InfoLine label="Coupon" value={couponCode} accent />
                        ) : (
                          <InfoLine label="Coupon" value="No coupon applied" />
                        )}

                        <InfoLine
                          label="Payment"
                          value={canRetry ? "Needs retry" : "Completed"}
                        />

                        {latestRefundRequest ? (
                          <InfoLine
                            label="Refund"
                            value={latestRefundRequest.status}
                            accent
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-border pt-5">
                    {course?.isEnrolled ? (
                      <Link
                        href={`/course/${course.slug}/learn`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_color-mix(in_oklab,var(--primary)_18%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90"
                      >
                        <CircleCheckBig className="h-4 w-4" />
                        Continue Learning
                      </Link>
                    ) : null}

                    {canRetry ? (
                      <Link
                        href={`/checkout?retryOrderId=${order.id}`}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_color-mix(in_oklab,var(--primary)_18%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90"
                      >
                        <CreditCard className="h-4 w-4" />
                        Retry Payment
                      </Link>
                    ) : null}

                    {canRequestRefund ? (
                      <button
                        type="button"
                        onClick={() => setRefundDialogOrderId(order.id)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Request Refund
                      </button>
                    ) : null}

                    {latestRefundRequest ? (
                      <span className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 text-sm font-semibold text-primary">
                        <FileClock className="h-4 w-4" />
                        Refund {latestRefundRequest.status}
                      </span>
                    ) : null}

                    {!canRequestRefund &&
                    !latestRefundRequest &&
                    order.status === OrderStatus.PAID &&
                    hasRefundAccess ? (
                      <RefundBlockedNote
                        isWithinRefundWindow={isWithinRefundWindow}
                        isProgressAllowedForRefund={isProgressAllowedForRefund}
                      />
                    ) : null}
                  </div>

                  {latestRefundRequest ? (
                    <RefundTimeline refundRequest={latestRefundRequest} />
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <RefundRequestDialog
        open={Boolean(refundDialogOrderId)}
        orderId={refundDialogOrderId || 0}
        onOpenChange={(open) => {
          if (!open) setRefundDialogOrderId(null);
        }}
      />
    </section>
  );
}

function EmptyOrders() {
  return (
    <div className="academy-card border-dashed p-10 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <BadgeAlert className="h-8 w-8" />
      </div>

      <h4 className="mt-5 text-xl font-semibold text-card-foreground">
        No orders yet
      </h4>

      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
        Once you purchase a course, the complete order trail will appear here.
      </p>
    </div>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function InfoLine({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>

      <span
        className={
          accent
            ? "text-right text-sm font-semibold text-primary"
            : "text-right text-sm font-semibold text-card-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

function OrderStatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${getOrderStatusClass(
        status,
      )}`}
    >
      {String(status).replaceAll("_", " ")}
    </span>
  );
}

function RefundBlockedNote({
  isWithinRefundWindow,
  isProgressAllowedForRefund,
}: {
  isWithinRefundWindow: boolean;
  isProgressAllowedForRefund: boolean;
}) {
  if (isWithinRefundWindow && isProgressAllowedForRefund) return null;

  return (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
      <AlertCircle className="h-4 w-4" />
      {!isWithinRefundWindow
        ? "Refund window closed"
        : "Progress exceeds refund limit"}
    </span>
  );
}

function getLatestRefundRequest(refundRequests: RefundRequest[]) {
  if (!refundRequests.length) return null;

  return [...refundRequests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function getOrderStatusClass(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PAID:
      return "border-primary/15 bg-primary/10 text-primary";

    case OrderStatus.FAILED:
    case OrderStatus.REFUND_REJECTED:
    case OrderStatus.REFUND_FAILED:
      return "border-destructive/20 bg-destructive/10 text-destructive";

    case OrderStatus.CANCELLED:
      return "border-border bg-muted text-muted-foreground";

    case OrderStatus.REFUNDED:
    case OrderStatus.REFUND_REQUESTED:
    case OrderStatus.REFUND_APPROVED:
    case OrderStatus.REFUND_PROCESSING:
      return "border-primary/15 bg-primary/10 text-primary";

    default:
      return "border-border bg-muted text-muted-foreground";
  }
}
