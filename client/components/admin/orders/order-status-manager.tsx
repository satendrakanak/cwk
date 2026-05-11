"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order, OrderStatus } from "@/types/order";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { orderClientService } from "@/services/orders/order.client";
import { Button } from "@/components/ui/button";

interface Props {
  order: Order;
}

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [
    OrderStatus.PAID,
    OrderStatus.FAILED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.PAID]: [],
  [OrderStatus.FAILED]: [
    OrderStatus.PENDING,
    OrderStatus.PAID,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.CANCELLED]: [
    OrderStatus.PENDING,
    OrderStatus.PAID,
    OrderStatus.FAILED,
  ],
  [OrderStatus.REFUND_REQUESTED]: [],
  [OrderStatus.REFUND_APPROVED]: [],
  [OrderStatus.REFUND_PROCESSING]: [],
  [OrderStatus.REFUND_REJECTED]: [],
  [OrderStatus.REFUND_FAILED]: [],
  [OrderStatus.REFUNDED]: [],
};

export const OrderStatusManager = ({ order }: Props) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order.status,
  );
  const [loading, setLoading] = useState(false);

  const allowedStatuses = STATUS_FLOW[status] || [];

  // 🔥 Only update local state
  const handleSelectChange = (value: OrderStatus) => {
    setSelectedStatus(value);
  };

  // 🔥 API call on button click
  const handleUpdate = async () => {
    if (selectedStatus === status) return;

    if (!allowedStatuses.includes(selectedStatus)) {
      toast.error("Invalid status transition");
      return;
    }

    try {
      setLoading(true);

      await orderClientService.updateStatus(order.id, {
        status: selectedStatus,
      });

      setStatus(selectedStatus);
      toast.success(`Order marked as ${selectedStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s: OrderStatus) => {
    switch (s) {
      case OrderStatus.PAID:
        return "text-green-600";
      case OrderStatus.FAILED:
        return "text-red-600";
      case OrderStatus.CANCELLED:
        return "text-gray-500";
      case OrderStatus.REFUND_REQUESTED:
      case OrderStatus.REFUND_APPROVED:
      case OrderStatus.REFUND_PROCESSING:
        return "text-violet-600";
      case OrderStatus.REFUND_REJECTED:
      case OrderStatus.REFUND_FAILED:
        return "text-orange-600";
      case OrderStatus.REFUNDED:
        return "text-sky-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="rounded-lg border bg-white">
      {/* HEADER */}
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h3 className="text-sm font-medium">Order Status</h3>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>

      <div className="p-4 space-y-4">
        {/* CURRENT */}
        <div className="text-sm">
          Current:{" "}
          <span className={`font-semibold ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>

        {/* SELECT */}
        <Select
          value={selectedStatus}
          onValueChange={handleSelectChange}
          disabled={loading || allowedStatuses.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {[status, ...allowedStatuses].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* BUTTON */}
        <Button
          onClick={handleUpdate}
          disabled={
            loading ||
            selectedStatus === status ||
            !allowedStatuses.includes(selectedStatus)
          }
          className="w-full"
        >
          Update Status
        </Button>

        {/* HELPER */}
        <p className="text-xs text-gray-400">
          {allowedStatuses.length === 0
            ? "This order status cannot be changed."
            : `Allowed: ${allowedStatuses.join(", ")}`}
        </p>
      </div>
    </div>
  );
};
