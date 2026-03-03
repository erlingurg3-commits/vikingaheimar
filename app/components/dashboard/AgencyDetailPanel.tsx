"use client";

import { useMemo } from "react";
import { Badge } from "@/app/components/primitives/Badge";
import type { AgentKpiRow } from "@/lib/agent-kpis";
import type { OrderRow } from "@/lib/orders";

type AgencyDetailPanelProps = {
  open: boolean;
  agencyName: string | null;
  agencyKpi: AgentKpiRow | null;
  orders: OrderRow[];
  onClose: () => void;
};

function formatCurrencyISK(value: number) {
  return new Intl.NumberFormat("is-IS", {
    style: "currency",
    currency: "ISK",
    maximumFractionDigits: 0,
  }).format(value);
}

function truncateEmail(value: string) {
  if (!value) return "—";
  if (value.length <= 22) return value;
  return `${value.slice(0, 19)}...`;
}

function shortId(value: string) {
  if (!value) return "—";
  return value.slice(0, 8);
}

function getOrderPax(order: OrderRow): number {
  if (
    order.request_type === "group" ||
    order.source === "travel_agent" ||
    order.source_type === "group_request"
  ) {
    return Number(order.group_size ?? 0);
  }

  return Number(order.total_tickets ?? 0);
}

export default function AgencyDetailPanel({
  open,
  agencyName,
  agencyKpi,
  orders,
  onClose,
}: AgencyDetailPanelProps) {
  const topHours = useMemo(() => {
    const byHour = new Map<string, number>();

    for (const order of orders) {
      const key = order.visit_time || "Unknown";
      byHour.set(key, (byHour.get(key) ?? 0) + getOrderPax(order));
    }

    return [...byHour.entries()]
      .map(([visitTime, pax]) => ({ visitTime, pax }))
      .sort((left, right) => right.pax - left.pax)
      .slice(0, 5);
  }, [orders]);

  const recentOrders = useMemo(
    () => [...orders].sort((left, right) => right.created_at.localeCompare(left.created_at)).slice(0, 10),
    [orders]
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xl transform border-l border-emerald-500/20 bg-gradient-to-b from-gray-900 to-black p-5 backdrop-blur-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-gray-400">Agency Detail</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{agencyName ?? "—"}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-emerald-500/20 bg-black/30 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:border-emerald-400/60"
          >
            Close
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Revenue</p>
            <p className="mt-1 font-semibold text-emerald-200">{formatCurrencyISK(agencyKpi?.total_revenue ?? 0)}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Pax</p>
            <p className="mt-1 font-semibold text-white">{agencyKpi?.total_pax ?? 0}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Bookings</p>
            <p className="mt-1 font-semibold text-white">{agencyKpi?.total_bookings ?? 0}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-3">
            <p className="text-xs text-gray-400">Status Mix</p>
            <p className="mt-1 flex items-center gap-2">
              <Badge variant="success" size="sm">Confirmed {agencyKpi?.confirmed_count ?? 0}</Badge>
              <Badge variant="warning" size="sm">Pending {agencyKpi?.pending_count ?? 0}</Badge>
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-black/30 p-4">
          <h4 className="text-sm font-semibold text-white">Top 5 hours by pax</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-200">
            {topHours.length === 0 ? <li className="text-gray-400">No hour data</li> : null}
            {topHours.map((item) => (
              <li key={item.visitTime} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2">
                <span>{item.visitTime}</span>
                <span className="text-emerald-200">{item.pax} pax</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-black/30 p-4">
          <h4 className="text-sm font-semibold text-white">Recent 10 orders</h4>
          <div className="mt-3 max-h-[36vh] overflow-auto space-y-2 pr-1">
            {recentOrders.length === 0 ? <p className="text-sm text-gray-400">No orders for this agency.</p> : null}
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-lg border border-white/5 px-3 py-2 text-xs text-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-300">{order.visit_date} · {order.visit_time}</span>
                  <span className="text-gray-500">#{shortId(order.id)}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span>{truncateEmail(order.customer_email)}</span>
                  <span className="text-emerald-200">{formatCurrencyISK(Number(order.total_amount ?? 0))}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span>{getOrderPax(order)} pax</span>
                  {order.status?.toLowerCase() === "confirmed" ? (
                    <Badge variant="success" size="sm">Confirmed</Badge>
                  ) : order.status?.toLowerCase() === "pending" ? (
                    <Badge variant="warning" size="sm">Pending</Badge>
                  ) : order.status?.toLowerCase() === "expired" ? (
                    <Badge variant="default" size="sm">Expired</Badge>
                  ) : (
                    <Badge variant="error" size="sm">Cancelled</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
