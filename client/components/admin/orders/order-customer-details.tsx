"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/types/order";

interface Props {
  order: Order;
}

export const OrderCustomerDetails = ({ order }: Props) => {
  const address = order.billingAddress;

  if (!address) {
    return (
      <Card className="rounded-2xl border">
        <CardContent className="p-6 text-sm text-gray-500">
          No customer details available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="space-y-5">
        {/* 🔥 TITLE */}
        <h2 className="text-lg font-semibold">Customer Details</h2>

        {/* 🔹 BASIC INFO */}
        <div className="space-y-1">
          <p className="font-medium">
            {address.firstName} {address.lastName}
          </p>
          <p className="text-sm text-gray-500">{address.email}</p>
          <p className="text-sm text-gray-500">{address.phoneNumber}</p>
        </div>

        {/* 🔹 ADDRESS */}
        <div className="text-sm text-gray-700 space-y-1">
          <p>{address.address}</p>

          <p>
            {address.city}, {address.state}
          </p>

          <p>
            {address.country} - {address.pincode}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
