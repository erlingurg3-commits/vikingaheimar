"use client";

import { useEffect, useState } from "react";

type DemandDay = {
  date: string;
  score: number | null;
  score_level: string | null;
  confidence: number | null;
  cruise_pax: number | null;
  air_arrivals: number | null;
  flights: number | null;
  widebodies: number | null;
};

type ArrivalRow = {
  date: string;
  flight_number: string | null;
  origin: string | null;
  aircraft_type: string | null;
  is_widebody: boolean | null;
  provider: string | null;
  source_confidence: number | null;
  status_text?: string | null;
};

type TopOrigin = {
  origin: string;
  flights: number;
};

type AirArrivalsPayload = {
  ok: boolean;
  message?: string;
  totals: {
    flights7d: number;
    airArrivals7d: number;
    widebodies7d: number;
    avgConfidence: number;
  };
  isavia?: {
    flightsLeftToday: number | null;
    bagsOnBelt: number | null;
    source: "isavia-live" | "unavailable";
  };
  demandDays: DemandDay[];
  arrivals: ArrivalRow[];
  topOrigins: TopOrigin[];
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function toInt(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function formatNullableNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }

  return toInt(value).toLocaleString();
}

export default function AirArrivalsPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AirArrivalsPayload | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/control-room/air-arrivals", { method: "GET", cache: "no-store" });
        const payload = (await response.json()) as AirArrivalsPayload;

        if (!response.ok || !payload.ok) {
          setError(payload.message ?? "Unable to load air arrivals right now.");
          setData(null);
          return;
        }

        setData(payload);
      } catch {
        setError("Unable to load air arrivals right now.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <section className="space-y-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 p-5 sm:p-6 backdrop-blur-xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Air Arrivals</h2>
        <p className="mt-1 text-sm text-gray-400">Live snapshot from demand and flight-arrival ingestion.</p>
      </div>

      {loading ? <p className="text-sm text-gray-300">Loading air arrivals…</p> : null}
      {error ? <p className="text-sm text-amber-300">{error}</p> : null}

      {!loading && !error && data ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Metric title="Flights left today" value={formatNullableNumber(data.isavia?.flightsLeftToday)} />
            <Metric title="Air arrivals (7d)" value={data.totals.airArrivals7d.toLocaleString()} />
            <Metric title="Avg confidence" value={`${data.totals.avgConfidence}%`} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-emerald-500/15">
              <div className="border-b border-white/10 bg-black/30 px-3 py-2 text-xs uppercase tracking-[0.12em] text-gray-400">
                Next 14 demand days
              </div>
              <table className="w-full text-sm">
                <thead className="bg-black/20 text-xs text-gray-400">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-right">Flights</th>
                    <th className="px-3 py-2 text-right">Air Arrivals</th>
                    <th className="px-3 py-2 text-right">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {data.demandDays.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-gray-400">
                        No demand-day records available.
                      </td>
                    </tr>
                  ) : null}

                  {data.demandDays.map((row) => (
                    <tr key={row.date} className="border-t border-white/10 text-gray-100">
                      <td className="px-3 py-2">{formatDate(row.date)}</td>
                      <td className="px-3 py-2 text-right">{toInt(row.flights).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">{toInt(row.air_arrivals).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">{(row.score_level ?? "NORMAL").toUpperCase()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-emerald-500/15">
                <div className="border-b border-white/10 bg-black/30 px-3 py-2 text-xs uppercase tracking-[0.12em] text-gray-400">
                  Top origins (upcoming)
                </div>
                <div className="space-y-2 p-3">
                  {data.topOrigins.length === 0 ? (
                    <p className="text-sm text-gray-400">No origin data available.</p>
                  ) : (
                    data.topOrigins.map((origin) => (
                      <div key={origin.origin} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-100">
                        <span>{origin.origin}</span>
                        <span>{origin.flights}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-emerald-500/15">
                <div className="border-b border-white/10 bg-black/30 px-3 py-2 text-xs uppercase tracking-[0.12em] text-gray-400">
                  Next arrivals (sample)
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-black/20 text-xs text-gray-400">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Flight</th>
                      <th className="px-3 py-2 text-left">Origin</th>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-right">Aircraft</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.arrivals.slice(0, 8).map((row, index) => (
                      <tr key={`${row.date}-${row.flight_number ?? "na"}-${index}`} className="border-t border-white/10 text-gray-100">
                        <td className="px-3 py-2">{formatDate(row.date)}</td>
                        <td className="px-3 py-2">{row.flight_number ?? "—"}</td>
                        <td className="px-3 py-2">{row.origin ?? "—"}</td>
                        <td className="px-3 py-2">{row.status_text ?? "Unknown"}</td>
                        <td className="px-3 py-2 text-right">
                          {row.aircraft_type ?? "Unknown"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

type MetricProps = {
  title: string;
  value: string;
};

function Metric({ title, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-emerald-500/15 bg-black/20 px-3 py-2.5">
      <p className="text-xs uppercase tracking-[0.12em] text-gray-400">{title}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
