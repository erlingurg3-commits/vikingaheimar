"use client";

import { useMemo } from "react";
import type { CruiseCRMListRow } from "./cruise-intelligence-types";

function toInt(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function formatISK(value: number) {
  return new Intl.NumberFormat("is-IS", {
    style: "currency",
    currency: "ISK",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CruiseIntelligenceKpiStrip({ rows }: { rows: CruiseCRMListRow[] }) {
  const kpis = useMemo(() => {
    let totalPax = 0;
    let estimatedValue = 0;

    for (const row of rows) {
      totalPax += toInt(row.pax_estimate);

      if (toInt(row.probability) > 0) {
        estimatedValue += toInt(row.value_estimate_isk);
      }
    }

    return {
      totalCruises: rows.length,
      totalPax,
      estimatedValue,
    };
  }, [rows]);

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.08em] text-gray-400">Total Cruises</p>
        <p className="mt-2 text-2xl font-semibold text-white">{kpis.totalCruises}</p>
      </article>

      <article className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs uppercase tracking-[0.08em] text-gray-400">Total Pax</p>
        <p className="mt-2 text-2xl font-semibold text-white">{kpis.totalPax.toLocaleString("en-US")}</p>
      </article>

      <article className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
        <p className="text-xs uppercase tracking-[0.08em] text-emerald-200">Estimated Value</p>
        <p className="mt-2 text-lg font-semibold text-emerald-100">{formatISK(kpis.estimatedValue)}</p>
      </article>
    </section>
  );
}
