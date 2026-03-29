/**
 * Forecast layer – shared TypeScript types
 * Used by: API routes, page components, seed scripts
 */

export type KpiGroup =
  | "demand_inputs"
  | "booked_actuals"
  | "revenue"
  | "cogs"
  | "payroll"
  | "opex"
  | "profitability";

/** A single KPI value for one month (or annual total when month = null) */
export type ForecastKpi = {
  kpi_key: string;
  kpi_label: string;
  kpi_group: KpiGroup;
  value: number | null;
  source_row: number | null;
};

/** Flat row from forecast_monthly_kpis */
export type ForecastMonthlyRow = ForecastKpi & {
  id: string;
  forecast_version_id: string;
  year: number;
  month: number | null;
};

/** One month's worth of all KPIs, keyed by kpi_key */
export type ForecastMonthSlice = {
  year: number;
  month: number; // 1-12
  kpis: Record<string, number | null>;
};

/** Pre-computed comparison between forecast and booked/actual */
export type ForecastComparison = {
  year: number;
  month: number;
  label: string; // "Jan", "Feb" …
  // Revenue
  revenue_forecast: number | null;
  revenue_booked: number | null;
  revenue_variance: number | null;
  revenue_variance_pct: number | null;
  booked_share_of_forecast: number | null;
  pace_projection: number | null;
  // Visitors
  visitors_forecast: number | null;
  visitors_booked: number | null;
  visitors_variance: number | null;
  visitors_variance_pct: number | null;
  // Ticket breakdown
  ticket_revenue_forecast: number | null;
  shop_revenue_forecast: number | null;
  // Profitability
  profit_loss_forecast: number | null;
  contribution_margin_forecast: number | null;
  // Drift signal
  signal: DriftSignal;
};

export type DriftSignal =
  | "ahead_of_plan"
  | "on_pattern"
  | "soft_drift"
  | "needs_attention"
  | "no_data";

/** KPI strip shown at the top of the forecast page */
export type ForecastTopStrip = {
  current_month: number;
  current_year: number;
  revenue_forecast_month: number | null;
  revenue_booked_month: number | null;
  revenue_variance_month: number | null;
  revenue_variance_pct_month: number | null;
  visitors_forecast_month: number | null;
  visitors_booked_month: number | null;
  profit_loss_month: number | null;
  signal: DriftSignal;
};

/** Full payload returned by the forecast API */
export type ForecastPayload = {
  version: {
    id: string;
    name: string;
    scenario_key: string;
    is_active: boolean;
    notes: string | null;
  };
  topStrip: ForecastTopStrip;
  monthly: ForecastComparison[];
  annualTotals: {
    revenue_forecast: number | null;
    revenue_booked: number | null;
    visitors_forecast: number | null;
    profit_loss_forecast: number | null;
  };
  /** Phase-2 ready ingestion layer metadata */
  liveActuals: {
    mode: "baseline_booked_rows" | "live_actual_sales_monthly" | "live_calendar_feed" | "bokun_live";
    channel_breakdown_ready: boolean;
    source_breakdown_ready: boolean;
    channels_supported: string[];
    connected?: boolean;
    dataSource?: string;
    lastUpdated?: string;
    totalBookings?: number;
    totalPax?: number;
    totalRevenueISK?: number;
    channelBreakdown?: Array<{
      month: number;
      channel: string;
      revenue_total: number;
      pax_total: number;
    }>;
  };
  generatedAt: string;
  error?: "DATA_NOT_CONNECTED" | "NO_ACTIVE_VERSION";
};

// ── Formatting helpers ────────────────────────────────────────

export const MONTH_LABELS: Record<number, string> = {
  1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
  5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
  9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
};

export const MONTH_LABELS_FULL: Record<number, string> = {
  1: "January", 2: "February", 3: "March", 4: "April",
  5: "May", 6: "June", 7: "July", 8: "August",
  9: "September", 10: "October", 11: "November", 12: "December",
};

export function formatISK(value: number | null, compact = false): string {
  if (value === null || value === undefined) return "—";
  if (compact) {
    if (Math.abs(value) >= 1_000_000)
      return `${(value / 1_000_000).toFixed(1)}M kr`;
    if (Math.abs(value) >= 1_000)
      return `${(value / 1_000).toFixed(0)}K kr`;
    return `${value.toLocaleString("is-IS")} kr`;
  }
  return `${value.toLocaleString("is-IS")} kr`;
}

export function formatPct(value: number | null): string {
  if (value === null || value === undefined) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(1)}%`;
}

export function driftSignalLabel(signal: DriftSignal): string {
  switch (signal) {
    case "ahead_of_plan":   return "Ahead of Plan";
    case "on_pattern":      return "On Pattern";
    case "soft_drift":      return "Soft Drift";
    case "needs_attention": return "Soft Drift";
    default:                return "No Data";
  }
}

export function driftSignalColor(signal: DriftSignal): string {
  switch (signal) {
    case "ahead_of_plan":   return "text-emerald-400";
    case "on_pattern":      return "text-cyan-300";
    case "soft_drift":      return "text-amber-400";
    case "needs_attention": return "text-amber-400";
    default:                return "text-zinc-500";
  }
}

export function driftSignalDot(signal: DriftSignal): string {
  switch (signal) {
    case "ahead_of_plan":   return "bg-emerald-400";
    case "on_pattern":      return "bg-cyan-400";
    case "soft_drift":      return "bg-amber-400";
    case "needs_attention": return "bg-amber-400";
    default:                return "bg-zinc-600";
  }
}
