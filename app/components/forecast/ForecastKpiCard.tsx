"use client";

import type { ReactNode } from "react";

type ForecastKpiCardProps = {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  accent?: "emerald" | "amber" | "cyan" | "neutral";
};

const accentBorder: Record<string, string> = {
  emerald: "border-emerald-500/25 hover:border-emerald-400/40",
  amber:   "border-amber-500/25 hover:border-amber-400/40",
  cyan:    "border-cyan-500/25 hover:border-cyan-400/40",
  neutral: "border-zinc-700/40 hover:border-zinc-600/50",
};

const accentGlow: Record<string, string> = {
  emerald: "group-hover:opacity-100 bg-emerald-500/10",
  amber:   "group-hover:opacity-100 bg-amber-500/10",
  cyan:    "group-hover:opacity-100 bg-cyan-500/10",
  neutral: "bg-transparent",
};

export default function ForecastKpiCard({
  label,
  value,
  sub,
  accent = "neutral",
}: ForecastKpiCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-[#0b1623]/80 px-4 py-3.5 transition-all duration-300 ${accentBorder[accent]}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ${accentGlow[accent]}`}
      />
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
      <div className="text-lg font-semibold leading-tight tracking-tight text-zinc-100">
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-[11px] text-zinc-500">{sub}</div>
      )}
    </div>
  );
}
