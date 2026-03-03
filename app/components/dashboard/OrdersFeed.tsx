"use client";

import { useRef, useEffect, useState } from "react";
import OrderCard from "./OrderCard";
import type { OrderRow } from "@/lib/orders";

type OrdersFeedProps = {
  orders: OrderRow[];
  loading: boolean;
};

export default function OrdersFeed({ orders, loading }: OrdersFeedProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;

    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [orders, autoScroll]);

  if (loading && orders.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/30 to-black/50 border border-emerald-500/20 rounded-2xl backdrop-blur-xl p-8 flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="relative bg-gradient-to-br from-gray-900/30 to-black/50 border border-emerald-500/20 rounded-2xl backdrop-blur-xl p-8 flex items-center justify-center h-96">
        <p className="text-gray-400">No orders yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">Recent Orders</h2>
          <p className="text-sm text-gray-400">{orders.length} total bookings</p>
        </div>
      </div>

      {/* Scrollable Feed */}
      <div
        ref={scrollRef}
        className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            id={order.id}
            email={order.customer_email}
            totalAmount={order.total_amount}
            status={order.status}
            created_at={order.created_at}
            visitDate={order.visit_date}
            visitTime={order.visit_time}
            ticketGeneral={order.ticket_general}
            ticketYouth={order.ticket_youth}
            ticketFamily={order.ticket_family}
          />
        ))}
      </div>

      {/* Scroll indicators */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
        <span>Live updates enabled</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sync active</span>
        </div>
      </div>
    </div>
  );
}
