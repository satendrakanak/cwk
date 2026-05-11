"use client";

export const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export const compactNumberFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const chartConfig = {
  revenue: { label: "Revenue", color: "var(--brand-500)" },
  discounts: { label: "Discounts", color: "#f97316" },
  orders: { label: "Orders", color: "#14b8a6" },
  sales: { label: "Enrollments", color: "var(--brand-600)" },
  usageRate: { label: "Usage %", color: "#8b5cf6" },
};

export function getStatusVariant(status: string) {
  switch (status) {
    case "PAID":
    case "ACTIVE":
      return "default";
    case "PENDING":
      return "secondary";
    case "FAILED":
    case "CANCELLED":
    case "INACTIVE":
      return "destructive";
    default:
      return "outline";
  }
}
