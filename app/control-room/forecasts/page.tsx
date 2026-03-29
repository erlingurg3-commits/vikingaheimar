"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

  // Load overrides from localStorage on mount
  useEffect(() => {
    setOverrides(loadOverrides());
    setOverridesLoaded(true);
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
