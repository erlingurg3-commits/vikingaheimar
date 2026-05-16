/**
 * GET /api/forecast
 * Returns the active forecast payload for the forecast page.
 *
 * Query params:
 *   year  (optional, default 2026)
 *
 * Phase 2: When actual_sales_monthly is populated by a booking
 * engine feed, add a JOIN here and pass liveActuals to
 * buildForecastComparisons(). No other changes required.
 */

import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  buildForecastComparisons,
  computeTopStrip,
  computeAnnualTotals,
} from "@/lib/forecast/engine";
import type { ForecastPayload, ForecastMonthlyRow } from "@/lib/forecast/types";

export const runtime = "nodejs";
export const revalidate = 300; // 5-minute cache

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year") ?? "2026");

  // ── 1. Load active forecast version ──────────────────────────
  const { data: version, error: vErr } = await supabaseAdmin
    .from("forecast_versions")
    .select("id, name, scenario_key, is_active, notes")
    .eq("is_active", true)
    .single();

  if (vErr || !version) {
    const payload: ForecastPayload = {
      version: { id: "", name: "", scenario_key: "", is_active: false, notes: null },
      topStrip: {
        current_month: new Date().getMonth() + 1,
        current_year: new Date().getFullYear(),
        revenue_forecast_month: null,
        revenue_booked_month: null,
        revenue_variance_month: null,
        revenue_variance_pct_month: null,
        visitors_forecast_month: null,
        visitors_booked_month: null,
        profit_loss_month: null,
        signal: "no_data",
      },
      monthly: [],
      annualTotals: {
        revenue_forecast: null,
        revenue_booked: null,
        visitors_forecast: null,
        profit_loss_forecast: null,
      },
      liveActuals: {
        mode: "baseline_booked_rows",
        channel_breakdown_ready: false,
        source_breakdown_ready: false,
        channels_supported: ["walkin", "web", "ota", "agency", "cruise", "school", "group"],
      },
      generatedAt: new Date().toISOString(),
      error: "NO_ACTIVE_VERSION",
    };
    return Response.json(payload, { status: 200 });
  }

  // ── 2. Load KPI rows for year ─────────────────────────────────
  const { data: kpiRows, error: kpiErr } = await supabaseAdmin
    .from("forecast_monthly_kpis")
    .select(
      "id, forecast_version_id, year, month, kpi_key, kpi_label, kpi_group, value, source_row"
    )
    .eq("forecast_version_id", version.id)
    .eq("year", year)
    .order("month", { ascending: true, nullsFirst: false });

  if (kpiErr || !kpiRows) {
    return Response.json(
      { error: "Failed to load forecast KPI rows", detail: kpiErr?.message },
      { status: 500 }
    );
  }

  const rows = kpiRows as ForecastMonthlyRow[];

  // ── 3. Live actuals — aggregate directly from actual_sales_daily ─────────
  // This is always current (no separate aggregation step needed).
  const { data: dailyRows } = await supabaseAdmin
    .from("actual_sales_daily")
    .select("visit_date, revenue_amount, pax")
    .gte("visit_date", `${year}-01-01`)
    .lte("visit_date", `${year}-12-31`);

  // Roll up by month
  const byMonth: Record<number, { revenue: number; pax: number; latestDate: string }> = {};
  for (const row of dailyRows ?? []) {
    const d = row.visit_date as string;
    const m = parseInt(d.slice(5, 7), 10);
    if (!byMonth[m]) byMonth[m] = { revenue: 0, pax: 0, latestDate: d };
    byMonth[m].revenue += Number(row.revenue_amount) || 0;
    byMonth[m].pax     += Number(row.pax) || 0;
    if (d > byMonth[m].latestDate) byMonth[m].latestDate = d;
  }

  const liveActuals = Object.entries(byMonth).map(([m, v]) => ({
    month:         parseInt(m, 10),
    revenue_total: v.revenue,
    pax_total:     v.pax,
  }));

  // Channel breakdown still from actual_sales_monthly (best-effort, may lag)
  const { data: channelRows } = await supabaseAdmin
    .from("actual_sales_monthly")
    .select("month, channel, revenue_total, pax_total")
    .eq("year", year)
    .not("channel", "is", null)
    .order("month");

  const totalRevISK    = liveActuals.reduce((s, r) => s + r.revenue_total, 0);
  const totalPax       = liveActuals.reduce((s, r) => s + r.pax_total, 0);
  const totalBookings  = (dailyRows ?? []).length;
  const latestDate     = Object.values(byMonth).map((v) => v.latestDate).sort().at(-1) ?? null;

  const LIVE_TOTALS = {
    totalBookings,
    totalPax,
    totalRevenueISK: totalRevISK,
    lastUpdated: latestDate,
    dataSource: "Bokun booking engine — live (daily roll-up)",
  };

  // ── 4. Compute ────────────────────────────────────────────────
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const monthly = buildForecastComparisons(rows, liveActuals);
  const topStrip = computeTopStrip(monthly, currentMonth, currentYear);
  const annualTotals = computeAnnualTotals(rows);

  // Override annual revenue_booked with live total (sum from calendar)
  annualTotals.revenue_booked = LIVE_TOTALS.totalRevenueISK;

  const payload: ForecastPayload = {
    version: {
      id: version.id,
      name: version.name,
      scenario_key: version.scenario_key,
      is_active: version.is_active,
      notes: version.notes,
    },
    topStrip,
    monthly,
    annualTotals,
    liveActuals: {
      mode: "bokun_live",
      channel_breakdown_ready: (channelRows ?? []).length > 0,
      source_breakdown_ready: true,
      channels_supported: ["web", "ota", "direct", "agent", "cruise", "school"],
      connected: true,
      dataSource: LIVE_TOTALS.dataSource,
      lastUpdated: LIVE_TOTALS.lastUpdated ?? undefined,
      totalBookings: LIVE_TOTALS.totalBookings,
      totalPax: LIVE_TOTALS.totalPax,
      totalRevenueISK: LIVE_TOTALS.totalRevenueISK,
      channelBreakdown: channelRows ?? [],
    },
    generatedAt: now.toISOString(),
  };

  return Response.json(payload, {
    status: 200,
    headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
  });
}
