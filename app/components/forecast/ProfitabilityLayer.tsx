"use client";

import { useState } from "react";
import type { ForecastComparison } from "@/lib/forecast/types";
import { formatISK } from "@/lib/forecast/types";
import { ChevronDown, ChevronRight } from "lucide-react";

type Props = {
  data: ForecastComparison[];
};

export default function ProfitabilityLayer({ data }: Props) {
  const [open, setOpen] = useState(false);

  const fullYear = data.reduce(
    (acc, m) => ({
      contribution: acc.contribution + (m.contribution_margin_forecast ?? 0),
      profit: acc.profit + (m.profit_loss_forecast ?? 0),
    }),
    { contribution: 0, profit: 0 }
  );

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-[#0a1520]/60 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
          )}
          <span className="text-xs font-medium text-zinc-300">Profitability Layer</span>
          <span className="text-[10px] text-zinc-600 ml-2">
            Contribution Margin · Profit / Loss
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs tabular-nums">
          <span className="text-zinc-500">
            Contribution:{" "}
            <span className="text-zinc-300">{formatISK(fullYear.contribution, true)}</span>
          </span>
          <span className="text-zinc-500">
            P&L:{" "}
            <span
              className={fullYear.profit < 0 ? "text-amber-400" : "text-emerald-400"}
            >
              {formatISK(fullYear.profit, true)}
            </span>
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-zinc-800/60 px-4 py-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-xs">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="pb-2 text-left text-[10px] uppercase tracking-widest text-zinc-600 w-16">
                  Month
                </th>
                <th className="pb-2 text-right text-[10px] uppercase tracking-widest text-zinc-600">
                  Contribution Margin
                </th>
                <th className="pb-2 text-right text-[10px] uppercase tracking-widest text-zinc-600">
                  Profit / Loss
                </th>
                <th className="pb-2 text-right text-[10px] uppercase tracking-widest text-zinc-600">
                  Cumulative
                </th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let cumulative = 0;
                return data.map((row) => {
                  cumulative += row.profit_loss_forecast ?? 0;
                  return (
                    <tr
                      key={row.month}
                      className="border-b border-zinc-800/30 hover:bg-zinc-900/20 transition-colors"
                    >
                      <td className="py-2 text-zinc-300">{row.label}</td>
                      <td className="py-2 text-right text-zinc-300 tabular-nums">
                        {formatISK(row.contribution_margin_forecast, true)}
                      </td>
                      <td
                        className={`py-2 text-right tabular-nums font-medium ${
                          row.profit_loss_forecast !== null && row.profit_loss_forecast < 0
                            ? "text-amber-400"
                            : "text-zinc-200"
                        }`}
                      >
                        {formatISK(row.profit_loss_forecast, true)}
                      </td>
                      <td
                        className={`py-2 text-right tabular-nums ${
                          cumulative < 0 ? "text-amber-400/70" : "text-emerald-400/70"
                        }`}
                      >
                        {formatISK(cumulative, true)}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>

          {/* Phase 2 note */}
          <p className="mt-4 text-[10px] text-zinc-700 border-t border-zinc-800/40 pt-3">
            Payroll and OpEx detail available after Phase 2 integration. Values shown are
            forecast plan baseline.
          </p>
        </div>
      )}
    </div>
  );
}
