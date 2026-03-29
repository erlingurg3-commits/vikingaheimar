"use client";

import { useEffect, useState } from "react";
import {
  Ticket,
  TrendingUp,
  Users,
  Globe,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";

interface DashboardData {
  today: { revenue: number; pax: number; bookings: number };
  ytd: { revenue: number; pax: number };
  monthlyTrend: Array<{
    year: number;
    month: number;
    revenue_total: number;
    pax_total: number;
    channel: string | null;
    product_type: string | null;
  }>;
  channelBreakdown: Record<
    string,
    { revenue: number; pax: number; count: number }
  >;
  recentBookings: Array<{
    booking_date: string;
    visit_date: string;
    revenue_amount: number;
    pax: number;
    channel: string;
    product_type: string;
    booking_reference: string;
  }>;
  lastSync: string | null;
}

function fmtISK(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

const MONTH_NAMES = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CHANNEL_COLORS: Record<string, string> = {
  web: "bg-cyan-500",
  ota: "bg-purple-500",
  direct: "bg-emerald-500",
  agent: "bg-amber-500",
  cruise: "bg-blue-500",
  school: "bg-pink-500",
};

export default function BokunPanel() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/bokun/dashboard");
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/bokun/sync", { method: "POST" });
      const result = await res.json();
      if (result.status === "ok") {
        await fetchDashboard(); // Refresh after sync
      } else {
        setError(result.message);
      }
    } catch {
      setError("Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-gray-900/40 border border-emerald-500/10 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl bg-red-900/20 border border-red-500/30 p-6 text-red-300">
        {error}
      </div>
    );
  }

  if (!data) return null;

  // Monthly trend for current year — combined rows only
  const monthlyData = data.monthlyTrend
    .filter((r) => !r.channel && !r.product_type)
    .sort((a, b) => a.month - b.month);
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue_total), 1);

  // Channel breakdown
  const channels = Object.entries(data.channelBreakdown).sort(
    (a, b) => b[1].revenue - a[1].revenue
  );
  const totalChannelRevenue = channels.reduce(
    (s, [, v]) => s + v.revenue,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header with sync button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Ticket className="text-emerald-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Bokun Live</h2>
          {data.lastSync && (
            <span className="text-xs text-gray-500">
              Last sync:{" "}
              {new Date(data.lastSync).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <button
          onClick={triggerSync}
          disabled={syncing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Today Revenue"
          value={`${fmtISK(data.today.revenue)} ISK`}
          icon={<TrendingUp size={16} />}
          sub={`${data.today.bookings} bookings`}
        />
        <KpiCard
          label="Today Pax"
          value={data.today.pax.toString()}
          icon={<Users size={16} />}
          sub="Visitors today"
        />
        <KpiCard
          label="YTD Revenue"
          value={`${fmtISK(data.ytd.revenue)} ISK`}
          icon={<TrendingUp size={16} />}
          sub="Year to date"
        />
        <KpiCard
          label="YTD Pax"
          value={data.ytd.pax.toLocaleString()}
          icon={<Users size={16} />}
          sub="Year to date"
        />
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-gradient-to-br from-gray-900/40 to-black/60 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">
          Monthly Revenue (ISK)
        </h3>
        <div className="flex items-end gap-2 h-40">
          {Array.from({ length: 12 }, (_, i) => {
            const m = monthlyData.find((r) => r.month === i + 1);
            const rev = m?.revenue_total ?? 0;
            const pct = (rev / maxRevenue) * 100;
            const now = new Date();
            const isCurrent =
              i + 1 === now.getMonth() + 1 &&
              monthlyData[0]?.year === now.getFullYear();
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500">
                  {rev > 0 ? fmtISK(rev) : ""}
                </span>
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    isCurrent
                      ? "bg-gradient-to-t from-emerald-500 to-cyan-400"
                      : rev > 0
                        ? "bg-gradient-to-t from-emerald-500/40 to-cyan-500/20"
                        : "bg-gray-800/30"
                  }`}
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
                <span
                  className={`text-[10px] ${isCurrent ? "text-emerald-300 font-bold" : "text-gray-500"}`}
                >
                  {MONTH_NAMES[i + 1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Channel Breakdown + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Breakdown */}
        <div className="bg-gradient-to-br from-gray-900/40 to-black/60 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">
            <Globe size={14} className="inline mr-2" />
            Channel Breakdown (This Month)
          </h3>
          {channels.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {channels.map(([channel, stats]) => {
                const pct =
                  totalChannelRevenue > 0
                    ? (stats.revenue / totalChannelRevenue) * 100
                    : 0;
                return (
                  <div key={channel}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 capitalize">
                        {channel}
                      </span>
                      <span className="text-gray-400">
                        {fmtISK(stats.revenue)} ISK · {stats.pax} pax ·{" "}
                        {stats.count} bookings
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${CHANNEL_COLORS[channel] ?? "bg-gray-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-gradient-to-br from-gray-900/40 to-black/60 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-xl">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">
            <ArrowUpRight size={14} className="inline mr-2" />
            Recent Bookings
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.recentBookings.slice(0, 10).map((b) => (
              <div
                key={b.booking_reference}
                className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
              >
                <div>
                  <p className="text-sm text-white font-mono">
                    {b.booking_reference}
                  </p>
                  <p className="text-xs text-gray-500">
                    Visit: {b.visit_date} · {b.channel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-300">
                    {Number(b.revenue_amount).toLocaleString()} ISK
                  </p>
                  <p className="text-xs text-gray-500">{b.pax} pax</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="bg-gradient-to-br from-gray-900/40 to-black/60 border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <span className="text-emerald-400/50">{icon}</span>
      </div>
      <p className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}
