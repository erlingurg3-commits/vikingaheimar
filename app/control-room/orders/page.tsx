"use client";

import OrdersFeed from "@/app/components/dashboard/OrdersFeed";
import { useControlRoomOrders } from "@/app/components/dashboard/useControlRoomOrders";

export default function ControlRoomOrdersPage() {
  const { orders, loading } = useControlRoomOrders();

  return (
    <div className="max-w-3xl">
      <OrdersFeed orders={orders} loading={loading} />
    </div>
  );
}
