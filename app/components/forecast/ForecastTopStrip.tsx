"use client";

import type { ForecastTopStrip as TopStripData } from "@/lib/forecast/types";
import {
  formatISK,
  formatPct,
  driftSignalLabel,
  driftSignalColor,
  driftSignalDot,
  MONTH_LABELS_FULL,
} from "@/lib/forecast/types";
import ForecastKpiCard from "./ForecastKpiCard";

type Props = {
  data: TopStripData;
};

export default function ForecastTopStrip({ data }: Props) {
  const varPct = data.revenue_variance_pct_month;
  const varAccent =
    varPct === null
      ? "neutral"
      : varPct >= 0.05
      ? "emerald"
      : varPct >= -0.08
      ? "cyan"
      : "amber";

  return (
    <div className="space-y-3">
      {/* Signal banner */}
      <div className="flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${driftSignalDot(data.signal)}`} />
        <span className={`text-[11px] font-medium tracking-wide ${driftSignalColor(data.signal)}`}>
          {driftSignalLabel(data.signal)}
        </span>
        <span className="text-[11px] text-zinc-600">
          · {MONTH_LABELS_FULL[data.current_month]} {data.current_year} operating forecast
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <ForecastKpiCard
          label="Revenue Plan"
          value={formatISK(data.revenue_forecast_month, true)}
          sub="month baseline"
          accent="neutral"
        />
        <ForecastKpiCard
          label="Revenue Booked"
          value={formatISK(data.revenue_booked_month, true)}
          sub="confirmed value"
          accent="cyan"
        />
        <ForecastKpiCard
          label="Gap to Plan"
          value={
            varPct !== null ? (
              <span className={driftSignalColor(data.signal)}>
                {formatPct(varPct)}
              </span>
            ) : (
              "—"
            )
          }
          sub={
            data.revenue_variance_month !== null
              ? formatISK(data.revenue_variance_month, true)
              : undefined
          }
          accent={varAccent}
        />
        <ForecastKpiCard
          label="Guests Plan"
          value={data.visitors_forecast_month?.toLocaleString() ?? "—"}
          sub="month baseline"
          accent="neutral"
        />
        <ForecastKpiCard
          label="Guests Booked"
          value={data.visitors_booked_month?.toLocaleString() ?? "—"}
          sub="confirmed volume"
          accent="cyan"
        />
        <ForecastKpiCard
          label="Operating Result"
          value={
            <span
              className={
                data.profit_loss_month !== null && data.profit_loss_month < 0
                  ? "text-amber-400"
                  : "text-emerald-300"
              }
            >
              {formatISK(data.profit_loss_month, true)}
            </span>
          }
          sub="forecast month"
          accent={
            data.profit_loss_month !== null && data.profit_loss_month < 0
              ? "amber"
              : "emerald"
          }
        />
      </div>
    </div>
  );
}
