"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

// ── Projected 2026 group pax ──────────────────────────────────────────────────
const PROJECTED_PAX: Record<string, { bf: number; ent: number }> = {
  "2026-01": { bf: 81,  ent: 33    },
  "2026-02": { bf: 178, ent: 103   },
  "2026-03": { bf: 396, ent: 97    },
  "2026-04": { bf: 260, ent: 374   },
  "2026-05": { bf: 451, ent: 1725  },
  "2026-06": { bf: 736, ent: 3297  },
  "2026-07": { bf: 558, ent: 3579  },
  "2026-08": { bf: 371, ent: 2747  },
  "2026-09": { bf: 183, ent: 12173 },
  "2026-10": { bf: 266, ent: 366   },
  "2026-11": { bf: 35,  ent: 0     },
  "2026-12": { bf: 0,   ent: 0     },
};

const MONTH_KEYS = [
  "2026-01","2026-02","2026-03","2026-04","2026-05","2026-06",
  "2026-07","2026-08","2026-09","2026-10","2026-11","2026-12",
];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface MonthlyPaxResponse {
  cal: Record<string, { bf: number; ent: number }>;
  bokun: Record<string, number>;
  bokunLastSync: string | null;
  calEventCount: number;
}
import type { ForecastPayload, ForecastComparison } from "@/lib/forecast/types";
import { formatISK } from "@/lib/forecast/types";
import {
  applyOverrides,
  clearOverrides,
  hasOverrides,
  loadOverrides,
  recomputeAnnualTotals,
  recomputeTopStrip,
  saveOverrides,
  type OverrideMap,
} from "@/lib/forecast/client-overrides";
import ForecastTopStrip from "@/app/components/forecast/ForecastTopStrip";
import ForecastMonthlyTable from "@/app/components/forecast/ForecastMonthlyTable";
import RevenueCompositionBar from "@/app/components/forecast/RevenueCompositionBar";
import ProfitabilityLayer from "@/app/components/forecast/ProfitabilityLayer";
import ForecastDisconnected from "@/app/components/forecast/ForecastDisconnected";

// ── Section wrapper ────────────────────────────────────────────
function Section({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2 border-b border-zinc-800/60 pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          {title}
        </h2>
        {sub && <span className="text-[10px] text-zinc-600">{sub}</span>}
      </div>
      {children}
    </section>
  );
}

// ── Skeleton shimmer ───────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-zinc-800/40 ${className ?? ""}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
    </div>
  );
}

// ── Annual summary strip ───────────────────────────────────────
function AnnualSummary({
  payload,
  annualOverride,
}: {
  payload: ForecastPayload;
  annualOverride: { revenue_booked: number | null; revenue_forecast: number | null; visitors_forecast: number | null; profit_loss_forecast: number | null };
}) {
  const at = annualOverride;
  const bookedSharePct =
    at.revenue_booked && at.revenue_forecast
      ? ((at.revenue_booked / at.revenue_forecast) * 100).toFixed(0)
      : null;

  const items: { label: string; value: React.ReactNode }[] = [
    { label: "Annual Revenue Plan", value: formatISK(at.revenue_forecast, true) },
    { label: "Annual Revenue Booked", value: formatISK(at.revenue_booked, true) },
    { label: "Booked Share", value: bookedSharePct ? `${bookedSharePct}%` : "—" },
    {
      label: "Annual Guests Plan",
      value: at.visitors_forecast?.toLocaleString() ?? "—",
    },
    {
      label: "Annual Operating Result",
      value: (
        <span
          className={
            at.profit_loss_forecast !== null && at.profit_loss_forecast < 0
              ? "text-amber-400"
              : "text-emerald-300"
          }
        >
          {formatISK(at.profit_loss_forecast, true)}
        </span>
      ),
    },
    {
      label: "Version",
      value: <span className="text-[11px] text-zinc-400">{payload.version.name}</span>,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-zinc-800/50 bg-[#0b1623]/60 px-3 py-2.5"
        >
          <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-0.5">
            {item.label}
          </p>
          <div className="text-sm font-semibold text-zinc-100 tabular-nums">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Live data status note ─────────────────────────────────────
function ActualDataStatus({ payload }: { payload: ForecastPayload }) {
  const la = payload.liveActuals;
  const isLive = la.connected === true;

  if (isLive) {
    return (
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-4 py-3 flex items-start gap-3">
        <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
        <div>
          <p className="text-[11px] text-emerald-300 font-medium">Live bookings feed connected</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Data source: {la.dataSource ?? "Booking engine"} · Last synced:{" "}
            {la.lastUpdated ?? "—"}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            {la.totalBookings?.toLocaleString() ?? "—"} confirmed bookings ·{" "}
            {la.totalPax?.toLocaleString() ?? "—"} guests ·{" "}
            {la.totalRevenueISK
              ? `${(la.totalRevenueISK / 1_000_000).toFixed(1)}M kr booked revenue`
              : "—"}
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">
            Revenue Booked values are editable inline. Changes saved to your browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-800/40 bg-[#0a1520]/40 px-4 py-3 flex items-start gap-3">
      <div className="mt-0.5 h-2 w-2 rounded-full bg-zinc-700 flex-shrink-0" />
      <div>
        <p className="text-[11px] text-zinc-500 font-medium">Live bookings feed not connected</p>
        <p className="text-[10px] text-zinc-700 mt-0.5">
          Current booked values come from the 2026 planning model. Once live ingestion is
          enabled, this layer switches to actual sales by source/channel without UI changes.
        </p>
      </div>
    </div>
  );
}

// ── Data source badge ────────────────────────────────────────
function DataSourceBadge({ payload }: { payload: ForecastPayload }) {
  const la = payload.liveActuals;
  if (!la.connected) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/15 bg-emerald-950/20 px-2.5 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span className="text-[10px] text-zinc-400">
        Live · booking engine · Updated{" "}
        {la.lastUpdated ?? "—"}
      </span>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function ForecastsPage() {
  const [payload, setPayload] = useState<ForecastPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [overridesLoaded, setOverridesLoaded] = useState(false);
  const [monthlyPax, setMonthlyPax] = useState<MonthlyPaxResponse | null>(null);
  const [paxLoading, setPaxLoading] = useState(true);

  // Load overrides from localStorage on mount
  useEffect(() => {
    setOverrides(loadOverrides());
    setOverridesLoaded(true);
  }, []);

  // Fetch live pax breakdown
  useEffect(() => {
    fetch("/api/control-room/monthly-pax")
      .then((r) => r.json())
      .then(setMonthlyPax)
      .catch(() => {})
      .finally(() => setPaxLoading(false));
  }, []);

  // Fetch API data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch("/api/forecast", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ForecastPayload;
        if (!cancelled) setPayload(data);
      } catch (err) {
        if (!cancelled)
          setFetchError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Apply overrides to monthly data and recompute derived values
  const effectiveMonthly = useMemo<ForecastComparison[]>(() => {
    if (!payload?.monthly) return [];
    const hasLocalOverrides = Object.keys(overrides).length > 0;
    if (!hasLocalOverrides) return payload.monthly;
    return applyOverrides(payload.monthly, overrides);
  }, [payload, overrides]);

  const effectiveTopStrip = useMemo(() => {
    if (!payload) return null;
    if (Object.keys(overrides).length === 0) return payload.topStrip;
    return recomputeTopStrip(effectiveMonthly, currentMonth, currentYear);
  }, [payload, overrides, effectiveMonthly, currentMonth, currentYear]);

  const effectiveAnnualTotals = useMemo(() => {
    if (!payload) return null;
    if (Object.keys(overrides).length === 0) return payload.annualTotals;
    return recomputeAnnualTotals(effectiveMonthly);
  }, [payload, overrides, effectiveMonthly]);

  // Edit handlers
  const handleEditRevenue = useCallback(
    (month: number, value: number) => {
      const next = { ...overrides };
      if (!next[month]) next[month] = {};
      next[month].revenue = value;
      setOverrides(next);
      saveOverrides(next);
    },
    [overrides]
  );

  const handleEditPax = useCallback(
    (month: number, value: number) => {
      const next = { ...overrides };
      if (!next[month]) next[month] = {};
      next[month].pax = value;
      setOverrides(next);
      saveOverrides(next);
    },
    [overrides]
  );

  const handleReset = useCallback(() => {
    if (!window.confirm("Reset all booked revenue figures to the booking engine baseline?")) {
      return;
    }
    clearOverrides();
    setOverrides({});
  }, []);

  const showReset = overridesLoaded && hasOverrides();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-sm font-semibold tracking-wide text-zinc-200">
            Operating Forecast
          </h1>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            2026 baseline · plan vs booked · drift intelligence
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {showReset && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-zinc-700/50 bg-zinc-900/50 px-2.5 py-1 text-[10px] text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors"
            >
              Reset to baseline
            </button>
          )}
          {payload && !loading && <DataSourceBadge payload={payload} />}
          {payload && !loading && (
            <div className="text-[10px] text-zinc-700 text-right">
              <span className="text-zinc-600">{payload.version.name}</span>
              <br />
              <span>
                Generated{" "}
                {new Date(payload.generatedAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </header>

      {loading && <LoadingSkeleton />}

      {!loading && fetchError && <ForecastDisconnected reason={fetchError} />}

      {!loading && !fetchError && payload?.error === "NO_ACTIVE_VERSION" && (
        <ForecastDisconnected reason="NO_ACTIVE_VERSION" />
      )}

      {!loading && !fetchError && payload && !payload.error && effectiveTopStrip && effectiveAnnualTotals && (
        <div className="space-y-8">
          <Section
            title="This Month"
            sub={`${new Date().toLocaleString("en-GB", { month: "long" })} ${currentYear} · plan vs booked`}
          >
            <ForecastTopStrip data={effectiveTopStrip} />
          </Section>

          <Section title="Annual View" sub="2026 operating baseline">
            <AnnualSummary payload={payload} annualOverride={effectiveAnnualTotals} />
          </Section>

          <Section
            title="Monthly Operating Pattern"
            sub="revenue and guests · Jan–Dec 2026"
          >
            <ForecastMonthlyTable
              data={effectiveMonthly}
              currentMonth={currentMonth}
              onEditRevenue={handleEditRevenue}
              onEditPax={handleEditPax}
            />
          </Section>

          <Section
            title="Pax by Month"
            sub="calendar groups (BF / ENT) + Bokun individual · actual vs projected"
          >
            <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
              <table className="w-full min-w-[700px] text-xs">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-[#0a1520]/90">
                    <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-600 w-16">Month</th>
                    <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-amber-600">BF Actual</th>
                    <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-zinc-600">BF Target</th>
                    <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-sky-600">ENT Actual</th>
                    <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-zinc-600">ENT Target</th>
                    <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-blue-600">Bokun</th>
                    <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-zinc-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {paxLoading ? (
                    Array.from({ length: 12 }).map((_, i) => (
                      <tr key={i} className="border-b border-zinc-800/40">
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-3 py-2.5">
                            <div className="h-3 rounded bg-zinc-800/40 animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <>
                      {MONTH_KEYS.map((mk, i) => {
                        const cal = monthlyPax?.cal[mk] ?? { bf: 0, ent: 0 };
                        const bokPax = monthlyPax?.bokun[mk] ?? 0;
                        const proj = PROJECTED_PAX[mk];
                        const total = cal.bf + cal.ent + bokPax;
                        const isCurr = (i + 1) === currentMonth;

                        const bfDiff = proj.bf > 0 ? cal.bf - proj.bf : null;
                        const entDiff = proj.ent > 0 ? cal.ent - proj.ent : null;

                        return (
                          <tr
                            key={mk}
                            className={`group/row border-b border-zinc-800/40 transition-colors duration-150 ${
                              isCurr ? "bg-cyan-900/10 border-l-2 border-l-cyan-500/50" : "hover:bg-zinc-900/30"
                            }`}
                          >
                            <td className="px-3 py-2.5 font-medium text-zinc-200">
                              {MONTH_SHORT[i]}
                              {isCurr && <span className="ml-1.5 text-[9px] text-cyan-400 uppercase tracking-wide">now</span>}
                            </td>

                            {/* BF actual */}
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              <span className={cal.bf > 0 ? "text-amber-300" : "text-zinc-700"}>
                                {cal.bf > 0 ? cal.bf.toLocaleString() : "—"}
                              </span>
                              {bfDiff !== null && cal.bf > 0 && (
                                <span className={`ml-1.5 text-[9px] ${bfDiff >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                  {bfDiff >= 0 ? "▲" : "▼"}{Math.abs(bfDiff).toLocaleString()}
                                </span>
                              )}
                            </td>

                            {/* BF target */}
                            <td className="px-3 py-2.5 text-right tabular-nums text-zinc-600">
                              {proj.bf > 0 ? proj.bf.toLocaleString() : "—"}
                            </td>

                            {/* ENT actual */}
                            <td className="px-3 py-2.5 text-right tabular-nums">
                              <span className={cal.ent > 0 ? "text-sky-300" : "text-zinc-700"}>
                                {cal.ent > 0 ? cal.ent.toLocaleString() : "—"}
                              </span>
                              {entDiff !== null && cal.ent > 0 && (
                                <span className={`ml-1.5 text-[9px] ${entDiff >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                  {entDiff >= 0 ? "▲" : "▼"}{Math.abs(entDiff).toLocaleString()}
                                </span>
                              )}
                            </td>

                            {/* ENT target */}
                            <td className="px-3 py-2.5 text-right tabular-nums text-zinc-600">
                              {proj.ent > 0 ? proj.ent.toLocaleString() : "—"}
                            </td>

                            {/* Bokun */}
                            <td className="px-3 py-2.5 text-right tabular-nums text-blue-300">
                              {bokPax > 0 ? bokPax.toLocaleString() : <span className="text-zinc-700">—</span>}
                            </td>

                            {/* Total */}
                            <td className="px-3 py-2.5 text-right tabular-nums font-medium text-zinc-200">
                              {total > 0 ? total.toLocaleString() : <span className="text-zinc-700">—</span>}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Totals */}
                      {(() => {
                        const t = { bf: 0, ent: 0, bok: 0, pbf: 0, pent: 0 };
                        for (const mk of MONTH_KEYS) {
                          const c = monthlyPax?.cal[mk] ?? { bf: 0, ent: 0 };
                          const p = PROJECTED_PAX[mk];
                          t.bf += c.bf; t.ent += c.ent;
                          t.bok += monthlyPax?.bokun[mk] ?? 0;
                          t.pbf += p.bf; t.pent += p.ent;
                        }
                        return (
                          <tr className="border-t border-zinc-700/60 bg-zinc-900/30 font-medium">
                            <td className="px-3 py-2.5 text-zinc-300">Total</td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-amber-300">{t.bf.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-zinc-500">{t.pbf.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-sky-300">{t.ent.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-zinc-500">{t.pent.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-blue-300">{t.bok.toLocaleString()}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-zinc-100">{(t.bf + t.ent + t.bok).toLocaleString()}</td>
                          </tr>
                        );
                      })()}

                      {/* Bokun sync note */}
                      {monthlyPax?.bokunLastSync && (
                        <tr>
                          <td colSpan={7} className="px-3 py-2 text-[10px] text-zinc-700">
                            Bokun data last synced: {monthlyPax.bokunLastSync} · Calendar: {monthlyPax.calEventCount} events live
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            title="Revenue Mix"
            sub="ticket and ancillary plan vs booked"
          >
            <div className="rounded-xl border border-zinc-800/60 bg-[#0a1520]/60 px-4 py-4">
              <RevenueCompositionBar data={effectiveMonthly} />
              <p className="mt-4 text-[10px] text-zinc-700 border-t border-zinc-800/40 pt-2">
                Future channels: walk-ins · agencies · OTA/web · cruise · schools/groups.
              </p>
            </div>
          </Section>

          <Section
            title="Plan vs Booked Logic"
            sub={payload.liveActuals.connected ? "booking engine feed active" : "baseline now · live ingestion later"}
          >
            <ActualDataStatus payload={payload} />
          </Section>

          <Section
            title="Profitability"
            sub="contribution margin · profit/loss · cumulative · expandable"
          >
            <ProfitabilityLayer data={effectiveMonthly} />
          </Section>
        </div>
      )}
    </div>
  );
}
