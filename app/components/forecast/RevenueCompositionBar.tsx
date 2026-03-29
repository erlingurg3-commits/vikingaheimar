"use client";

import type { ForecastComparison } from "@/lib/forecast/types";
import { formatISK } from "@/lib/forecast/types";

type Props = {
  data: ForecastComparison[];
};

export default function RevenueCompositionBar({ data }: Props) {
  const maxRevenue = Math.max(
    ...data.map((d) => d.revenue_forecast ?? 0),
    1
  );

  return (
    <div className="space-y-2">
      {data.map((row) => {
        const ticketPct = row.ticket_revenue_forecast && row.revenue_forecast
          ? (row.ticket_revenue_forecast / row.revenue_forecast) * 100
          : 0;
        const shopPct = row.shop_revenue_forecast && row.revenue_forecast
          ? (row.shop_revenue_forecast / row.revenue_forecast) * 100
          : 0;
        const barWidth = row.revenue_forecast
          ? (row.revenue_forecast / maxRevenue) * 100
          : 0;
        const bookedPct = row.revenue_forecast && row.revenue_booked
          ? Math.min((row.revenue_booked / row.revenue_forecast) * 100, 100)
          : 0;

        return (
          <div key={row.month} className="group">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-zinc-500 w-8">{row.label}</span>
              <span className="text-[10px] text-zinc-600 tabular-nums">
                {formatISK(row.revenue_forecast, true)}
              </span>
            </div>

            {/* Forecast bar */}
            <div className="relative h-3 rounded-sm overflow-hidden bg-zinc-900/60 w-full">
              <div
                className="absolute inset-y-0 left-0 flex overflow-hidden rounded-sm"
                style={{ width: `${barWidth}%` }}
              >
                {/* Ticket slice */}
                <div
                  className="h-full bg-cyan-600/50"
                  style={{ width: `${ticketPct}%` }}
                  title={`Ticket: ${formatISK(row.ticket_revenue_forecast, true)}`}
                />
                {/* Shop slice */}
                <div
                  className="h-full bg-emerald-600/40"
                  style={{ width: `${shopPct}%` }}
                  title={`Shop: ${formatISK(row.shop_revenue_forecast, true)}`}
                />
              </div>

              {/* Booked overlay */}
              <div
                className="absolute inset-y-0 left-0 border-r-2 border-emerald-400/80 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ width: `${(bookedPct / 100) * barWidth}%` }}
              />
            </div>

            {/* Booked indicator below */}
            {row.revenue_booked !== null && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div
                  className="h-0.5 bg-emerald-500/60 rounded"
                  style={{ width: `${(bookedPct / 100) * barWidth}%`, maxWidth: "100%" }}
                />
                <span className="text-[9px] text-emerald-500/70 tabular-nums">
                  booked: {formatISK(row.revenue_booked, true)}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-2 border-t border-zinc-800/40">
        <span className="flex items-center gap-1.5 text-[9px] text-zinc-600">
          <span className="h-2 w-3 rounded-sm bg-cyan-600/50" /> Admission
        </span>
        <span className="flex items-center gap-1.5 text-[9px] text-zinc-600">
          <span className="h-2 w-3 rounded-sm bg-emerald-600/40" /> Ancillary
        </span>
        <span className="flex items-center gap-1.5 text-[9px] text-zinc-600">
          <span className="h-0.5 w-3 bg-emerald-500/60" /> Booked
        </span>
      </div>
    </div>
  );
}
