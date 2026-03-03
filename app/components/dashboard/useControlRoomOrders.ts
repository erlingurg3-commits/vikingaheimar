"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { OrderRow } from "@/lib/orders";

export function useControlRoomOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data as OrderRow[]);
      } else {
        setOrders([]);
      }
      setLoading(false);
    };

    load();

    const channel = supabaseBrowser
      .channel("control-room-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new as OrderRow, ...prev]);
          }

          if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((order) =>
                order.id === payload.new.id ? (payload.new as OrderRow) : order
              )
            );
          }

          if (payload.eventType === "DELETE") {
            const oldRow = payload.old as OrderRow;
            setOrders((prev) => prev.filter((order) => order.id !== oldRow.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalOrders = orders.length;
    const pending = orders.filter((order) => order.status === "pending").length;
    const confirmed = orders.filter((order) => order.status === "confirmed").length;
    const cancelled = orders.filter((order) => order.status === "cancelled").length;

    return {
      totalRevenue,
      totalOrders,
      pending,
      confirmed,
      cancelled,
    };
  }, [orders]);

  return {
    orders,
    loading,
    stats,
  };
}
