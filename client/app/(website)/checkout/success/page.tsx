import Link from "next/link";
import {
  CheckCircle2,
  CalendarDays,
  MonitorPlay,
  ReceiptText,
} from "lucide-react";
import { notFound } from "next/navigation";

import Container from "@/components/container";
import { WebsiteBreadcrumbs } from "@/components/layout/website-breadcrumbs";
import { hasLiveClasses, hasRecordedLearning } from "@/lib/course-delivery";
import { orderServerService } from "@/services/orders/order.server";
import { OrderStatus } from "@/types/order";

type PageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;
  const parsedOrderId = Number(orderId);

  if (!Number.isFinite(parsedOrderId) || parsedOrderId <= 0) {
    notFound();
  }

  const order = await orderServerService
    .getById(parsedOrderId)
    .then((response) => response.data)
    .catch(() => null);

  if (!order) {
    notFound();
  }

  const courses = order.items.map((item) => item.course).filter(Boolean);
  const selfLearningCourses = courses.filter((course) =>
    hasRecordedLearning(course),
  );
  const liveCourses = courses.filter((course) => hasLiveClasses(course));
  const firstSelfLearningCourse = selfLearningCourses[0] || courses[0];
  const isPaid = order.status === OrderStatus.PAID;

  return (
    <div className="relative min-h-screen bg-background py-10 md:py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-(--surface-shell)" />
      </div>

      <Container className="relative z-10">
        <WebsiteBreadcrumbs
          contained={false}
          className="pt-0"
          items={[
            { label: "Home", href: "/" },
            { label: "Checkout", href: "/checkout" },
            { label: "Purchase complete" },
          ]}
        />

        <section className="academy-card mt-6 overflow-hidden p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                {isPaid ? "Payment successful" : "Payment received"}
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground md:text-4xl">
                Your course access is ready
              </h1>

              <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
                We have enrolled your purchased courses. Start self-paced
                lessons right away, or review your live class schedule for
                faculty-led programs.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm">
              <div className="flex items-center gap-2 font-semibold text-card-foreground">
                <ReceiptText className="h-4 w-4 text-primary" />
                Order #{order.id}
              </div>
              <p className="mt-2 text-muted-foreground">
                Total paid: ₹
                {new Intl.NumberFormat("en-IN").format(order.totalAmount)}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {firstSelfLearningCourse ? (
              <Link
                href={`/course/${firstSelfLearningCourse.slug}/learn`}
                className="group rounded-2xl border border-primary/20 bg-primary/10 p-5 transition hover:-translate-y-0.5 hover:bg-primary/15"
              >
                <MonitorPlay className="mb-4 h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold text-card-foreground">
                  Start learning now
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Open your recorded lessons and continue from the learning
                  page.
                </p>
              </Link>
            ) : null}

            <Link
              href={liveCourses.length ? "/classes" : "/my-courses"}
              className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/30"
            >
              <CalendarDays className="mb-4 h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">
                {liveCourses.length
                  ? "View live class schedule"
                  : "View my courses"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {liveCourses.length
                  ? "Check batch sessions, joining time, and faculty-led class details."
                  : "See all enrolled courses and track your progress."}
              </p>
            </Link>
          </div>

          <div className="mt-8 space-y-3">
            <h2 className="text-sm font-semibold text-card-foreground">
              Purchased courses
            </h2>
            <div className="divide-y divide-border rounded-2xl border border-border">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-card-foreground">
                      {course.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hasLiveClasses(course)
                        ? "Faculty-led or hybrid course"
                        : "Self-paced course"}
                    </p>
                  </div>
                  <Link
                    href={
                      hasRecordedLearning(course)
                        ? `/course/${course.slug}/learn`
                        : "/classes"
                    }
                    className="text-sm font-semibold text-primary"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
