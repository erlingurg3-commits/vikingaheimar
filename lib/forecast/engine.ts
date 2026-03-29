/**
 * Forecast Computation Engine
 * ===========================
 * Converts raw forecast_monthly_kpis rows into structured comparison
 * objects. Designed to:
 *  1. Work with Supabase data today (plan baseline).
 *  2. Accept live actual_sales_monthly data in Phase 2 with zero
 *     changes to the comparison logic – just swap the `booked_*`
 *     source from forecast rows → actual_sales_monthly rows.
 *
 * Key functions:
 *  - buildForecastComparisons()  → 12-month comparison array
 *  - computeTopStrip()           → header KPI strip
 *  - computeDriftSignal()        → calm signal enum
 */

import type {
  ForecastComparison,
  ForecastMonthlyRow,
  ForecastTopStrip,
  DriftSignal,
} from "./types";
import { MONTH_LABELS } from "./types";

// ── Signal thresholds ─────────────────────────────────────────
// Variance is booked / forecast (ratio).  1.0 = on plan.
const AHEAD_THRESHOLD        = 1.05;  // >5% over forecast
const ON_PATTERN_LOW         = 0.92;  // within -8%
const SOFT_DRIFT_LOW         = 0.75;  // within -25%
// below SOFT_DRIFT_LOW → needs_attention

export function computeDriftSignal(
  booked: number | null,
  forecast: number | null
): DriftSignal {
  if (booked === null || forecast === null || forecast === 0) return "no_data";
  const ratio = booked / forecast;
  if (ratio >= AHEAD_THRESHOLD)   return "ahead_of_plan";
  if (ratio >= ON_PATTERN_LOW)    return "on_pattern";
  if (ratio >= SOFT_DRIFT_LOW)    return "soft_drift";
  return "soft_drift";
}

function safeVariance(actual: number | null, forecast: number | null) {
  if (actual === null || forecast === null) return null;
  return actual - forecast;
}

function safeVariancePct(actual: number | null, forecast: number | null) {
  if (actual === null || forecast === null || forecast === 0) return null;
  return (actual - forecast) / forecast;
}

function safeShare(actual: number | null, forecast: number | null) {
  if (actual === null || forecast === null || forecast === 0) return null;
  return actual / forecast;
}

// ── Core builder ──────────────────────────────────────────────

/**
 * Builds the 12-month comparison array from raw DB rows.
 *
 * Phase 1: booked = workbook "booked_actuals" rows.
 * Phase 2: pass actual_sales_monthly data as `liveActuals` param
 *          and this function will prefer live over booked.
 */
export function buildForecastComparisons(
  rows: ForecastMonthlyRow[],
  liveActuals?: Array<{
    month: number;
    revenue_total: number;
    pax_total: number;
  }>
): ForecastComparison[] {
  // Index by (month, kpi_key) → value
  const byMonth: Record<number, Record<string, number | null>> = {};

  for (const row of rows) {
    if (row.month === null) continue; // skip annual totals here
    if (!byMonth[row.month]) byMonth[row.month] = {};
    byMonth[row.month][row.kpi_key] = row.value;
  }

  // Index live actuals if present (Phase 2)
  const liveByMonth: Record<number, { revenue: number; pax: number }> = {};
  if (liveActuals) {
    for (const la of liveActuals) {
      liveByMonth[la.month] = {
        revenue: la.revenue_total,
        pax: la.pax_total,
      };
    }
  }

  const comparisons: ForecastComparison[] = [];
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const daysInMonth = new Date(now.getFullYear(), currentMonth, 0).getDate();
  const daysElapsed = now.getDate();

  for (let m = 1; m <= 12; m++) {
    const kpis = byMonth[m] ?? {};
    const live = liveByMonth[m];

    // Revenue: prefer live actual, fall back to booked baseline
    const rev_forecast = kpis["total_operating_revenue"] ?? null;
    const rev_booked = live
      ? live.revenue
      : (kpis["booked_revenue_total"] ?? null);

    // Visitors
    const vis_forecast = kpis["visitors_per_month_forecast"] ?? null;
    const vis_booked = live
      ? live.pax
      : (kpis["guests_booked_total"] ?? null);

    comparisons.push({
      year: 2026,
      month: m,
      label: MONTH_LABELS[m],
      revenue_forecast: rev_forecast,
      revenue_booked: rev_booked,
      revenue_variance: safeVariance(rev_booked, rev_forecast),
      revenue_variance_pct: safeVariancePct(rev_booked, rev_forecast),
      booked_share_of_forecast: safeShare(rev_booked, rev_forecast),
      pace_projection:
        live && m === currentMonth && daysElapsed > 0
          ? (live.revenue / daysElapsed) * daysInMonth
          : null,
      visitors_forecast: vis_forecast,
      visitors_booked: vis_booked,
      visitors_variance: safeVariance(vis_booked, vis_forecast),
      visitors_variance_pct: safeVariancePct(vis_booked, vis_forecast),
      ticket_revenue_forecast: kpis["ticket_revenue_forecast"] ?? null,
      shop_revenue_forecast: kpis["shop_revenue_forecast"] ?? null,
      profit_loss_forecast: kpis["profit_loss"] ?? null,
      contribution_margin_forecast: kpis["contribution_margin"] ?? null,
      signal: computeDriftSignal(rev_booked, rev_forecast),
    });
  }

  return comparisons;
}

// ── Top strip ─────────────────────────────────────────────────

export function computeTopStrip(
  comparisons: ForecastComparison[],
  currentMonth: number,
  currentYear: number
): ForecastTopStrip {
  const current = comparisons.find(
    (c) => c.month === currentMonth && c.year === currentYear
  );

  return {
    current_month: currentMonth,
    current_year: currentYear,
    revenue_forecast_month: current?.revenue_forecast ?? null,
    revenue_booked_month: current?.revenue_booked ?? null,
    revenue_variance_month: current?.revenue_variance ?? null,
    revenue_variance_pct_month: current?.revenue_variance_pct ?? null,
    visitors_forecast_month: current?.visitors_forecast ?? null,
    visitors_booked_month: current?.visitors_booked ?? null,
    profit_loss_month: current?.profit_loss_forecast ?? null,
    signal: current?.signal ?? "no_data",
  };
}

// ── Annual totals ─────────────────────────────────────────────

export function computeAnnualTotals(rows: ForecastMonthlyRow[]) {
  // Use the explicit annual-total rows (month = null) if present
  const annualRows = rows.filter((r) => r.month === null);
  const annualKpis: Record<string, number | null> = {};
  for (const r of annualRows) {
    annualKpis[r.kpi_key] = r.value;
  }

  return {
    revenue_forecast:   annualKpis["total_operating_revenue"] ?? null,
    revenue_booked:     annualKpis["booked_revenue_total"] ?? null,
    visitors_forecast:  annualKpis["visitors_per_month_forecast"] ?? null,
    profit_loss_forecast: annualKpis["profit_loss"] ?? null,
  };
}
