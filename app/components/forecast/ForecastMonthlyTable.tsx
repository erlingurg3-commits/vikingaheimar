"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ForecastComparison } from "@/lib/forecast/types";
import { formatISK, formatPct } from "@/lib/forecast/types";

type Props = {
  data: ForecastComparison[];
  currentMonth: number;
  onEditRevenue?: (month: number, value: number) => void;
  onEditPax?: (month: number, value: number) => void;
};

// ── Inline editable cell ──────────────────────────────────────

function EditableCell({
  value,
  displayValue,
  onSave,
  className,
}: {
  value: number | null;
  displayValue: string;
  onSave: (v: number) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = useCallback(() => {
    setDraft(String(value ?? 0));
    setEditing(true);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const parsed = parseInt(draft.replace(/\D/g, ""), 10);
    if (!isNaN(parsed)) {
      onSave(parsed);
    }
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") cancel();
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={commit}
        onKeyDown={handleKey}
        className="w-full bg-transparent border border-amber-500/50 rounded px-1.5 py-0.5 text-right text-xs text-zinc-100 tabular-nums outline-none focus:border-amber-400"
      />
    );
  }

  return (
    <span
      onClick={startEdit}
      className={`group/cell cursor-pointer inline-flex items-center gap-1 ${className ?? ""}`}
      title="Click to edit"
    >
      <span>{displayValue}</span>
      <span className="text-[9px] text-zinc-700 opacity-0 group-hover/row:opacity-100 transition-opacity">
        ✎
      </span>
    </span>
  );
}

// ── Main table ────────────────────────────────────────────────

export default function ForecastMonthlyTable({
  data,
  currentMonth,
  onEditRevenue,
  onEditPax,
}: Props) {
  const editable = Boolean(onEditRevenue || onEditPax);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
      <table className="w-full min-w-[860px] text-xs">
        <thead>
          <tr className="border-b border-zinc-800/80 bg-[#0a1520]/90">
            <th className="px-3 py-3 text-left text-[10px] uppercase tracking-widest text-zinc-600 w-16">
              Month
            </th>
            <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-zinc-600">
              Revenue Plan
            </th>
            <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-zinc-600">
              <span className="inline-flex items-center gap-1">
                Revenue Booked
                {editable && (
                  <span className="text-[8px] text-zinc-700 font-normal normal-case tracking-normal">
                    ✎ editable · saved locally
                  </span>
                )}
              </span>
            </th>
            <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-zinc-600">
              Gap to Plan
            </th>
            <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-zinc-600">
              Booked Share
            </th>
            <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-zinc-600">
              Guests Plan
            </th>
            <th className="px-3 py-3 text-right text-[10px] uppercase tracking-widest text-zinc-600">
              <span className="inline-flex items-center gap-1">
                Guests Booked
                {editable && (
                  <span className="text-[8px] text-zinc-700 font-normal normal-case tracking-normal">
                    ✎
                  </span>
                )}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const isCurrent = row.month === currentMonth;
            const varPct = row.revenue_variance_pct;
            const varColor =
              varPct === null
                ? "text-zinc-600"
                : varPct >= 0.05
                ? "text-emerald-400"
                : varPct >= -0.08
                ? "text-cyan-300"
                : varPct >= -0.25
                ? "text-amber-400"
                : "text-amber-500";

            return (
              <tr
                key={row.month}
                className={`group/row border-b border-zinc-800/40 transition-colors duration-150 ${
                  isCurrent
                    ? "bg-cyan-900/10 border-l-2 border-l-cyan-500/50"
                    : "hover:bg-zinc-900/30"
                }`}
              >
                <td className="px-3 py-2.5 font-medium text-zinc-200">
                  {row.label}
                  {isCurrent && (
                    <span className="ml-1.5 text-[9px] text-cyan-400 uppercase tracking-wide">
                      now
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right text-zinc-400 tabular-nums">
                  {formatISK(row.revenue_forecast, true)}
                </td>
                <td className="px-3 py-2.5 text-right text-zinc-200 tabular-nums">
                  {onEditRevenue ? (
                    <EditableCell
                      value={row.revenue_booked}
                      displayValue={formatISK(row.revenue_booked, true)}
                      onSave={(v) => onEditRevenue(row.month, v)}
                    />
                  ) : (
                    formatISK(row.revenue_booked, true)
                  )}
                </td>
                <td className={`px-3 py-2.5 text-right tabular-nums font-medium ${varColor}`}>
                  {varPct !== null ? formatPct(varPct) : "—"}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-zinc-300">
                  {row.booked_share_of_forecast !== null
                    ? `${(row.booked_share_of_forecast * 100).toFixed(0)}%`
                    : "—"}
                  {row.booked_share_of_forecast !== null && (
                    <div className="mt-1 ml-auto h-1 w-12 overflow-hidden rounded-full bg-zinc-800/70">
                      <div
                        className="h-full rounded-full bg-cyan-400/60"
                        style={{
                          width: `${Math.min(
                            row.booked_share_of_forecast * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right text-zinc-400 tabular-nums">
                  {row.visitors_forecast?.toLocaleString() ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-right text-zinc-200 tabular-nums">
                  {onEditPax ? (
                    <EditableCell
                      value={row.visitors_booked}
                      displayValue={row.visitors_booked?.toLocaleString() ?? "—"}
                      onSave={(v) => onEditPax(row.month, v)}
                    />
                  ) : (
                    row.visitors_booked?.toLocaleString() ?? "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
