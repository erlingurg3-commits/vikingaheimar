"use client";

import { useState } from "react";

/* ═══ Hardcoded Season Data (Calendar Audit: 23 Mar – 30 Sep 2026) ═══ */

type Operator = {
  rank: number;
  name: string;
  type: string;
  bookings: number;
  pax: number;
  revenueISK: number;
  sharePercent: number;
  notes: string;
  color: string;
};

const TOP_OPERATORS: Operator[] = [
  { rank: 1, name: "Atlantik", type: "cruise_broker", bookings: 57, pax: 18877, revenueISK: 32090900, sharePercent: 67.1, notes: "Shore excursion broker. MSC Preziosa, Norwegian Star, AIDA fleet, Ambition, Ambience. Single most critical relationship.", color: "#9b7db5" },
  { rank: 2, name: "Iceland Travel", type: "cruise_fit", bookings: 33, pax: 2840, revenueISK: 5357000, sharePercent: 10.1, notes: "Cruise groups + FIT. Princess fleet, HAL, Fred Olsen, Queen series, Ponant via IT.", color: "#5b7fa6" },
  { rank: 3, name: "EF Cultural Tours", type: "educational", bookings: 39, pax: 1717, revenueISK: 6755300, sharePercent: 6.1, notes: "US student groups. Always breakfast + entrance. High booking volume, smaller groups. ICE/ICEA South + ICN/ICNJ North routes.", color: "#c8874a" },
  { rank: 4, name: "Viking River Cruises", type: "river_cruise", bookings: 30, pax: 945, revenueISK: 4063500, sharePercent: 3.4, notes: "Viking Mars, Mira, Saturn. Always 45 pax. Always Thor refreshments (dried fish + Viking beer). Twice daily.", color: "#7a9e8a" },
  { rank: 5, name: "TTT School Groups", type: "school", bookings: 28, pax: 872, revenueISK: 1482400, sharePercent: 3.1, notes: "Weekly recurring. TTT 1–23. Always 56 pax, always 15:30, always entrance only.", color: "#a89880" },
  { rank: 6, name: "Ponant", type: "luxury_cruise", bookings: 12, pax: 700, revenueISK: 1190000, sharePercent: 2.5, notes: "French luxury cruise. Always 70 pax split 2×35. L'Austral, Le Bellot, Le Lapérouse. Weekly June–July.", color: "#6b9ab8" },
  { rank: 7, name: "Fred Olsen", type: "cruise", bookings: 6, pax: 260, revenueISK: 442000, sharePercent: 0.9, notes: "Via Iceland Travel. Block bookings confirmed for full 2026 season.", color: "#8b7355" },
  { rank: 8, name: "GJ Travel", type: "travel_agent", bookings: 9, pax: 253, revenueISK: 1012000, sharePercent: 0.9, notes: "Icelandic travel agent. Guðmundur Jónasson ehf. School + leisure groups. Canadian and US markets.", color: "#7a8a6a" },
  { rank: 9, name: "Star Pride (Windstar)", type: "luxury_cruise", bookings: 9, pax: 225, revenueISK: 954000, sharePercent: 0.8, notes: "Windstar luxury. Always 45 pax, always soup service. Regular throughout summer.", color: "#9a8a7a" },
  { rank: 10, name: "Morgan Groups", type: "travel_agent", bookings: 6, pax: 134, revenueISK: 536000, sharePercent: 0.5, notes: "Regular breakfast groups. SEF, IHS, PAC, FRS, COA, ATN group codes. Consistent early morning slots.", color: "#7a8a9a" },
];

const SEASON_TOTALS = {
  totalBookings: 282,
  totalPax: 28141,
  estimatedRevenueISK: 57100000,
  seasonStart: "2026-03-23",
  seasonEnd: "2026-09-30",
  lastUpdated: "2026-03-23",
  pricingBasis: "Estimated at standard group rates: Breakfast 4,000 ISK/pax, Entrance 1,700 ISK/pax, Special 4,300 ISK/pax",
};

/* ═══ Helpers ═══ */

function formatISK(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M ISK";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K ISK";
  return n.toLocaleString() + " ISK";
}

function formatPax(n: number) {
  return n.toLocaleString("en-GB");
}

const TYPE_LABELS: Record<string, string> = {
  cruise_broker: "Cruise Broker",
  cruise_fit: "Cruise / FIT",
  educational: "Educational",
  river_cruise: "River Cruise",
  school: "School",
  luxury_cruise: "Luxury Cruise",
  cruise: "Cruise",
  travel_agent: "Travel Agent",
};

/* ═══ Sub-components ═══ */

function SummaryCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-emerald-200">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-gray-400">{subtitle}</p> : null}
    </div>
  );
}

function TypePill({ type, color }: { type: string; color: string }) {
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: color + "22", color }}
    >
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}

function ShareBar({ percent, maxPercent }: { percent: number; maxPercent: number }) {
  const width = maxPercent > 0 ? (percent / maxPercent) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-20 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${width}%` }} />
      </div>
      <span className="text-xs tabular-nums text-gray-400">{percent.toFixed(1)}%</span>
    </div>
  );
}

function DonutChart({ operators }: { operators: Operator[] }) {
  const top5 = operators.slice(0, 5);
  const otherPct = 100 - top5.reduce((s, o) => s + o.sharePercent, 0);
  const R = 50;
  const CX = 60;
  const CY = 60;
  const SW = 16;
  const C = 2 * Math.PI * R;
  let offset = 0;

  const arcs = top5.map((op) => {
    const dash = (op.sharePercent / 100) * C;
    const arc = (
      <circle
        key={op.rank}
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke={op.color}
        strokeWidth={SW}
        strokeDasharray={`${dash} ${C - dash}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${CX} ${CY})`}
      />
    );
    offset += dash;
    return arc;
  });

  if (otherPct > 0) {
    const dash = (otherPct / 100) * C;
    arcs.push(
      <circle
        key="other"
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke="#555"
        strokeWidth={SW}
        strokeOpacity={0.3}
        strokeDasharray={`${dash} ${C - dash}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${CX} ${CY})`}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5">
      <p className="mb-4 text-xs uppercase tracking-[0.16em] text-gray-400">Revenue Share</p>
      <svg className="mx-auto block" width={120} height={120} viewBox="0 0 120 120">
        {arcs}
      </svg>
      <div className="mt-4 space-y-1.5">
        {top5.map((op) => (
          <div key={op.rank} className="flex items-center gap-2 text-xs text-gray-300">
            <span className="inline-block h-2 w-2 rounded-sm flex-shrink-0" style={{ background: op.color }} />
            <span className="flex-1 truncate">{op.name}</span>
            <span className="tabular-nums text-gray-500">{op.sharePercent.toFixed(1)}%</span>
          </div>
        ))}
        {otherPct > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <span className="inline-block h-2 w-2 rounded-sm flex-shrink-0 bg-gray-600" />
            <span className="flex-1">Other</span>
            <span className="tabular-nums text-gray-500">{otherPct.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function OperatorDetailOverlay({ operator, onClose }: { operator: Operator | null; onClose: () => void }) {
  if (!operator) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl">
          <div className="absolute left-0 right-0 top-0 h-1 rounded-t-2xl" style={{ background: operator.color }} />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white text-lg leading-none"
          >
            &times;
          </button>

          <TypePill type={operator.type} color={operator.color} />
          <h3 className="mt-3 text-xl font-semibold text-white">{operator.name}</h3>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-3 text-center">
              <p className="text-xl font-bold text-emerald-200">{operator.bookings}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Bookings</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-3 text-center">
              <p className="text-xl font-bold text-emerald-200">{formatPax(operator.pax)}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Total Pax</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-black/30 p-3 text-center">
              <p className="text-xl font-bold text-emerald-200">{formatISK(operator.revenueISK)}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Est. Revenue</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-wider text-gray-400">Season Share</span>
              <span className="text-lg font-bold text-white">{operator.sharePercent.toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${operator.sharePercent}%`, background: operator.color }}
              />
            </div>
          </div>

          <p className="mt-5 border-t border-white/10 pt-4 text-sm leading-relaxed text-gray-300">
            {operator.notes}
          </p>
        </div>
      </div>
    </>
  );
}

/* ═══ Main Panel ═══ */

export default function SeasonCalendarPanel() {
  const [selectedOp, setSelectedOp] = useState<Operator | null>(null);
  const maxShare = TOP_OPERATORS[0].sharePercent;

  return (
    <div className="space-y-5">
      {/* Season Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard title="Total Season Pax" value={formatPax(SEASON_TOTALS.totalPax)} subtitle="282 bookings" />
        <SummaryCard title="Total Bookings" value={String(SEASON_TOTALS.totalBookings)} subtitle="23 Mar – 30 Sep 2026" />
        <SummaryCard title="Est. Revenue" value={"~" + formatISK(SEASON_TOTALS.estimatedRevenueISK)} subtitle="Standard group rates" />
        <SummaryCard title="Top Operator" value="Atlantik" subtitle="67.1% of total pax" />
        <SummaryCard title="Operators Tracked" value="10" subtitle="+ other (36 bookings, 887 pax)" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_260px]">
        {/* Table */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">Top 10 Operators</h3>
            <span className="text-xs text-gray-500 italic">
              Last updated: {SEASON_TOTALS.lastUpdated} &middot; Revenue figures are estimates
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-500/20 text-xs uppercase tracking-[0.15em] text-gray-400">
                  <th className="px-3 py-3 font-medium">#</th>
                  <th className="px-3 py-3 font-medium">Operator</th>
                  <th className="px-3 py-3 font-medium text-right">Bookings</th>
                  <th className="px-3 py-3 font-medium text-right">Total Pax</th>
                  <th className="px-3 py-3 font-medium text-right">Est. Revenue</th>
                  <th className="px-3 py-3 font-medium text-right">Season Share</th>
                  <th className="px-3 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {TOP_OPERATORS.map((op) => (
                  <tr
                    key={op.rank}
                    className={`cursor-pointer border-b border-white/5 text-gray-100 transition-colors hover:bg-emerald-500/10 ${
                      op.rank === 1 ? "border-l-2 border-l-emerald-400" : ""
                    }`}
                    onClick={() => setSelectedOp(op)}
                  >
                    <td className="px-3 py-3 text-gray-500 font-semibold">{op.rank}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{op.name}</span>
                        <TypePill type={op.type} color={op.color} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{op.bookings}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{formatPax(op.pax)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-emerald-200">{formatISK(op.revenueISK)}</td>
                    <td className="px-3 py-3 text-right">
                      <ShareBar percent={op.sharePercent} maxPercent={maxShare} />
                    </td>
                    <td className="px-3 py-3 max-w-[260px] truncate text-gray-500 text-xs">{op.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <DonutChart operators={TOP_OPERATORS} />
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5 text-center">
            <p className="text-2xl font-bold text-emerald-200">{SEASON_TOTALS.totalBookings}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Total Bookings</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5 text-center">
            <p className="text-2xl font-bold text-emerald-200">{formatPax(SEASON_TOTALS.totalPax)}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Total Season Pax</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 italic">{SEASON_TOTALS.pricingBasis}</p>

      <OperatorDetailOverlay operator={selectedOp} onClose={() => setSelectedOp(null)} />
    </div>
  );
}
