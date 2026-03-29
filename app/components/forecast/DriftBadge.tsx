"use client";

import type { DriftSignal } from "@/lib/forecast/types";
import { driftSignalLabel, driftSignalDot } from "@/lib/forecast/types";

type DriftBadgeProps = {
  signal: DriftSignal;
  compact?: boolean;
};

export default function DriftBadge({ signal, compact = false }: DriftBadgeProps) {
  const dot = driftSignalDot(signal);
  const label = driftSignalLabel(signal);

  if (signal === "no_data") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-600">
        <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
        {!compact && label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] text-zinc-400">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {!compact && (
        <span
          className={
            signal === "ahead_of_plan"
              ? "text-emerald-400"
              : signal === "on_pattern"
              ? "text-cyan-300"
              : signal === "soft_drift"
              ? "text-amber-400"
              : "text-amber-500"
          }
        >
          {label}
        </span>
      )}
    </span>
  );
}
