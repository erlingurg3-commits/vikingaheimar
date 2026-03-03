"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-browser";

export const HOURLY_CAPACITY = 50;
export const DEFAULT_TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;

type CapacityStatus = "Full" | "Almost Full" | "Available";

type CapacityOrder = {
  id: string;
  visit_date: string;
  visit_time: string;
  status: string;
  total_tickets: number | null;
};

export type CapacityRow = {
  time: string;
  booked: number;
  cap: number;
  remaining: number;
  status: CapacityStatus;
};

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function toHourSlot(visitTime: string): string | null {
  const match = visitTime.match(/^(\d{1,2}):\d{2}$/);
  if (!match) return null;
  const hour = Number(match[1]);
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) return null;
  return `${String(hour).padStart(2, "0")}:00`;
}

function getStatus(remaining: number): CapacityStatus {
  if (remaining <= 0) return "Full";
  if (remaining <= 10) return "Almost Full";
  return "Available";
}

export function groupOrdersByHour(
  orders: CapacityOrder[],
  timeSlots: readonly string[] = DEFAULT_TIME_SLOTS,
  cap = HOURLY_CAPACITY
): CapacityRow[] {
  const bookedByHour = Object.fromEntries(timeSlots.map((slot) => [slot, 0])) as Record<string, number>;

  for (const order of orders) {
    const slot = toHourSlot(order.visit_time);
    if (!slot || !(slot in bookedByHour)) continue;
    bookedByHour[slot] += Math.max(0, Number(order.total_tickets ?? 0));
  }

  return timeSlots.map((time) => {
    const booked = bookedByHour[time] ?? 0;
    const remaining = Math.max(0, cap - booked);

    return {
      time,
      booked,
      cap,
      remaining,
      status: getStatus(remaining),
    };
  });
}

export function useOrdersRealtimeSubscription(
  selectedDate: string,
  onOrderChange: (payload: RealtimePostgresChangesPayload<CapacityOrder>) => void
) {
  useEffect(() => {
    const channel = supabaseBrowser
      .channel("capacity-dashboard-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const oldDate = (payload.old as Partial<CapacityOrder> | null)?.visit_date;
          const newDate = (payload.new as Partial<CapacityOrder> | null)?.visit_date;

          if (oldDate !== selectedDate && newDate !== selectedDate) {
            return;
          }

          onOrderChange(payload as RealtimePostgresChangesPayload<CapacityOrder>);
        }
      )
      .subscribe();

    return () => {
      supabaseBrowser.removeChannel(channel);
    };
  }, [onOrderChange, selectedDate]);
}

function statusClassName(status: CapacityStatus): string {
  if (status === "Full") {
    return "bg-red-900/30 text-red-300 border border-red-500/40";
  }

  if (status === "Almost Full") {
    return "bg-yellow-900/30 text-yellow-300 border border-yellow-500/40";
  }

  return "bg-emerald-900/30 text-emerald-300 border border-emerald-500/40";
}

export default function CapacityDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>(() => toDateKey(new Date()));
  const [orders, setOrders] = useState<CapacityOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrdersForDate = useCallback(async (dateKey: string) => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabaseBrowser
      .from("orders")
      .select("id, visit_date, visit_time, status, total_tickets")
      .eq("visit_date", dateKey)
      .in("status", ["pending", "confirmed"]);

    if (fetchError) {
      setOrders([]);
      setError("Unable to load capacity data for this date.");
      setLoading(false);
      return;
    }

    setOrders((data ?? []) as CapacityOrder[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrdersForDate(selectedDate);
  }, [fetchOrdersForDate, selectedDate]);

  const handleOrderChange = useCallback(
    (payload: RealtimePostgresChangesPayload<CapacityOrder>) => {
      const statusAllowed = (status?: string) => status === "pending" || status === "confirmed";

      if (payload.eventType === "DELETE") {
        const oldRow = payload.old as CapacityOrder;
        setOrders((prev) => prev.filter((order) => order.id !== oldRow.id));
        return;
      }

      const newRow = payload.new as CapacityOrder;
      const include =
        newRow.visit_date === selectedDate &&
        statusAllowed(newRow.status);

      setOrders((prev) => {
        const withoutExisting = prev.filter((order) => order.id !== newRow.id);
        return include ? [newRow, ...withoutExisting] : withoutExisting;
      });
    },
    [selectedDate]
  );

  useOrdersRealtimeSubscription(selectedDate, handleOrderChange);

  const rows = useMemo(() => groupOrdersByHour(orders), [orders]);

  return (
    <section className="bg-gradient-to-br from-gray-900/30 to-black/50 border border-emerald-500/20 rounded-2xl backdrop-blur-xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-white">Capacity Dashboard</h2>
          <p className="text-xs sm:text-sm text-gray-400">Hourly capacity for pending + confirmed orders</p>
        </div>

        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label htmlFor="capacity-date" className="text-xs uppercase tracking-[0.08em] text-gray-400">
            Date
          </label>
          <input
            id="capacity-date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="h-10 rounded-md border border-white/15 bg-black/35 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Time</th>
              <th className="px-4 py-3 text-left font-medium">Booked</th>
              <th className="px-4 py-3 text-left font-medium">Cap (50)</th>
              <th className="px-4 py-3 text-left font-medium">Remaining</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.time} className="border-t border-white/10">
                <td className="px-4 py-3 text-white">{row.time}</td>
                <td className="px-4 py-3 text-gray-200">{row.booked}</td>
                <td className="px-4 py-3 text-gray-200">{row.cap}</td>
                <td className="px-4 py-3 text-gray-200">{row.remaining}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName(row.status)}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <p className="text-xs text-gray-400">Loading latest capacity…</p>}
    </section>
  );
}
