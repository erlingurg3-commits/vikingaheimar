"use client";

import { useEffect, useState } from "react";
import MarketShareTracker from "@/app/control-room-v2/components/MarketShareTracker";
import NextCriticalDay from "@/app/control-room-v2/components/NextCriticalDay";
import OpportunityRadar from "@/app/control-room-v2/components/OpportunityRadar";
import TourismPressureIndex from "@/app/control-room-v2/components/TourismPressureIndex";
import type { TourismIntelligencePayload } from "@/app/control-room-v2/types/intelligence";

function formatGeneratedAt(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function ControlRoomV2Page() {
  const [payload, setPayload] = useState<TourismIntelligencePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/control-room-v2/api", { method: "GET", cache: "no-store" });
        const nextPayload = (await response.json()) as TourismIntelligencePayload;

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        if (!cancelled) {
          setPayload(nextPayload);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load tourism intelligence.");
          setPayload(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#07101a] px-4 py-6 text-cyan-50/90 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-xl border border-cyan-400/20 bg-gradient-to-r from-slate-900/85 via-[#112338]/70 to-[#0f2238]/80 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-medium tracking-wide text-cyan-100/95">Tourism Intelligence</h1>
              <p className="text-xs text-cyan-200/65">Control Room V2 - Tourism Intelligence Layer</p>
            </div>
            {!loading && payload && (
              <div className="flex shrink-0 items-center gap-1.5 pt-1">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    payload.dataSource === "demand_file"
                      ? "bg-cyan-400"
                      : payload.dataSource === "live"
                      ? "bg-emerald-400"
                      : "bg-zinc-600"
                  }`}
                />
                <span className="text-[10px] text-cyan-200/50">
                  {payload.dataSource === "demand_file"
                    ? `Demand file - ${formatGeneratedAt(payload.generatedAt)}`
                    : payload.dataSource === "live"
                    ? "Live data"
                    : "No data connected"}
                </span>
              </div>
            )}
          </div>
        </header>

        <NextCriticalDay
          data={payload?.nextCriticalDay}
          loading={loading}
          error={error}
          disconnected={payload?.error === "DATA_NOT_CONNECTED"}
        />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <TourismPressureIndex
            data={payload?.pressureIndex}
            pressureSupport={payload?.pressureSupport}
            loading={loading}
            error={error}
            disconnected={payload?.error === "DATA_NOT_CONNECTED"}
            dataSource={payload?.dataSource}
          />
          <OpportunityRadar
            data={payload?.opportunities}
            loading={loading}
            error={error}
            disconnected={payload?.error === "DATA_NOT_CONNECTED"}
          />
          <MarketShareTracker
            data={payload?.marketShare}
            loading={loading}
            error={error}
            disconnected={payload?.error === "DATA_NOT_CONNECTED"}
            dataSource={payload?.dataSource}
          />
        </section>
      </div>
    </main>
  );
}
