/**
 * Client-side forecast override utilities.
 * Allows manual editing of Revenue Booked / Guests Booked
 * with localStorage persistence.
 */

import { computeDriftSignal } from "./engine";
import type { ForecastComparison, ForecastTopStrip, DriftSignal } from "./types";
import { MONTH_LABELS } from "./types";

const STORAGE_KEY = "vikingaheimar_booked_revenue";

export type MonthOverride = {
  revenue?: number;
  pax?: number;
};

export type OverrideMap = Record<number, MonthOverride>;

// ── Booking engine baseline (5 Feb 2026) ─────────────────────
export const BOOKED_REVENUE_INITIAL: Record<number, { revenueISK: number; pax: number }> = {
  1:  { revenueISK: 0,          pax: 0    },
  2:  { revenueISK: 1275400,    pax: 417  },
  3:  { revenueISK: 2803700,    pax: 709  },
  4:  { revenueISK: 2061876,    pax: 807  },
  5:  { revenueISK: 3383000,    pax: 2280 },
  6:  { revenueISK: 11815388,   pax: 5239 },
  7:  { revenueISK: 11577456,   pax: 4806 },
  8:  { revenueISK: 13328072,   pax: 5806 },
  9:  { revenueISK: 2701300,    pax: 1836 },
  10: { revenueISK: 680000,     pax: 435  },
  11: { revenueISK: 0,          pax: 0    },
  12: { revenueISK: 0,          pax: 0    },
};

// ── localStorage helpers ─────────────────────────────────────

export function loadOverrides(): OverrideMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as OverrideMap;
  } catch {
    return {};
  }
}

export function saveOverrides(overrides: OverrideMap): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function clearOverrides(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasOverrides(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// ── Apply overrides to monthly comparisons ───────────────────

function safeDrift(booked: number | null, forecast: number | null): DriftSignal {
  return computeDriftSignal(booked, forecast);
}

export function applyOverrides(
  monthly: ForecastComparison[],
  overrides: OverrideMap
): ForecastComparison[] {
  return monthly.map((row) => {
    const ov = overrides[row.month];
    if (!ov) return row;

    const rev = ov.revenue ?? row.revenue_booked;
    const pax = ov.pax ?? row.visitors_booked;
    const revF = row.revenue_forecast;
    const visF = row.visitors_forecast;

    return {
      ...row,
      revenue_booked: rev,
      visitors_booked: pax,
      revenue_variance:
        rev !== null && revF !== null ? rev - revF : null,
      revenue_variance_pct:
        rev !== null && revF !== null && revF !== 0
          ? (rev - revF) / revF
          : null,
      booked_share_of_forecast:
        rev !== null && revF !== null && revF !== 0
          ? rev / revF
          : null,
      visitors_variance:
        pax !== null && visF !== null ? pax - visF : null,
      visitors_variance_pct:
        pax !== null && visF !== null && visF !== 0
          ? (pax - visF) / visF
          : null,
      signal: safeDrift(rev, revF),
    };
  });
}

// ── Recompute top strip from monthly ─────────────────────────

export function recomputeTopStrip(
  monthly: ForecastComparison[],
  currentMonth: number,
  currentYear: number
): ForecastTopStrip {
  const current = monthly.find(
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

// ── Recompute annual totals from monthly ─────────────────────

export function recomputeAnnualTotals(monthly: ForecastComparison[]) {
  const revenue_booked = monthly.reduce(
    (s, m) => s + (m.revenue_booked ?? 0),
    0
  );
  const revenue_forecast = monthly.reduce(
    (s, m) => s + (m.revenue_forecast ?? 0),
    0
  );
  const visitors_forecast = monthly.reduce(
    (s, m) => s + (m.visitors_forecast ?? 0),
    0
  );
  const profit_loss_forecast = monthly.reduce(
    (s, m) => s + (m.profit_loss_forecast ?? 0),
    0
  );

  return {
    revenue_forecast: revenue_forecast || null,
    revenue_booked: revenue_booked || null,
    visitors_forecast: visitors_forecast || null,
    profit_loss_forecast: profit_loss_forecast || null,
  };
}
