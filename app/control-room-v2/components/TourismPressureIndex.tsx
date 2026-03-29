"use client";

import { useState } from "react";
import type {
  TourismPressureIndex as TourismPressureIndexData,
  TourismPressureSupport,
} from "@/app/control-room-v2/types/intelligence";

type TourismPressureIndexProps = {
  data?: TourismPressureIndexData;
  pressureSupport?: TourismPressureSupport;
  loading?: boolean;
  error?: string | null;
  disconnected?: boolean;
  dataSource?: string;
};

type PressureDimensionKey = "all" | "flight" | "cruise" | "weather" | "events";

function formatDate(value: string): string {
  if (!value) return "Unknown";
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function sourceLabel(value: TourismPressureSupport["dimensions"]["scoreFrom"]): string {
  if (value === "flight_pressure") return "Flights";
  if (value === "cruise_pressure") return "Cruise";
  if (value === "event_pressure") return "Events";
  return "None";
}

function dimensionSignalType(value: PressureDimensionKey): TourismPressureSupport["signals"][number]["signalType"] | null {
  if (value === "flight") return "flights";
  if (value === "cruise") return "cruise";
  if (value === "weather") return "weather";
  if (value === "events") return "events";
  return null;
}

function dimensionLabel(value: PressureDimensionKey): string {
  if (value === "flight") return "Flight";
  if (value === "cruise") return "Cruise";
  if (value === "weather") return "Weather";
  if (value === "events") return "Events";
  return "All";
}

function PressureSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="h-12 animate-pulse rounded-md bg-[#10233a]/55" />
        <div className="h-12 animate-pulse rounded-md bg-[#10233a]/55" />
        <div className="h-12 animate-pulse rounded-md bg-[#10233a]/55" />
      </div>
      <div className="h-7 animate-pulse rounded-md bg-[#10233a]/55" />
      <div className="h-7 animate-pulse rounded-md bg-[#10233a]/55" />
      <div className="h-7 animate-pulse rounded-md bg-[#10233a]/55" />
    </div>
  );
}

export default function TourismPressureIndex({
  data,
  pressureSupport,
  loading = false,
  error = null,
  disconnected = false,
  dataSource,
}: TourismPressureIndexProps) {
  const [open, setOpen] = useState(false);
  const [activeDimension, setActiveDimension] = useState<PressureDimensionKey>("all");
  const canInspect = Boolean(pressureSupport && !loading && !error && !disconnected);

  const filteredSignals = pressureSupport
    ? activeDimension === "all"
      ? pressureSupport.signals
      : pressureSupport.signals.filter(
          (signal) => signal.signalType === dimensionSignalType(activeDimension)
        )
    : [];

  return (
    <>
      <section
        className={`rounded-xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/85 via-[#14263b]/65 to-[#0f2238]/80 p-4 shadow-[inset_0_1px_0_rgba(125,211,252,0.06)] ${
          canInspect ? "cursor-pointer transition-colors hover:border-cyan-300/35" : ""
        }`}
        onClick={
          canInspect
            ? () => {
                setActiveDimension("all");
                setOpen(true);
              }
            : undefined
        }
        onKeyDown={
          canInspect
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveDimension("all");
                  setOpen(true);
                }
              }
            : undefined
        }
        role={canInspect ? "button" : undefined}
        tabIndex={canInspect ? 0 : undefined}
        aria-label={canInspect ? "Open Tourism Pressure Index support details" : undefined}
      >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-medium tracking-wide text-cyan-100/90">Tourism Pressure Index</h2>
          {canInspect ? <p className="mt-1 text-[10px] text-cyan-200/45">Press to inspect support data</p> : null}
        </div>
        {dataSource === "demand_file" && (
          <span className="rounded border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-cyan-300/70">
            Demand file
          </span>
        )}
      </header>

      {loading ? <PressureSkeleton /> : null}

      {!loading && error ? <p className="text-xs text-amber-200/90">{error}</p> : null}

      {!loading && !error && disconnected ? (
        <p className="text-xs text-cyan-100/75">Live data is not connected yet. Showing neutral placeholders.</p>
      ) : null}

      {!loading && !error && data ? (
        <>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-cyan-200/60">Score</p>
              <p className="text-lg text-cyan-50/95">{data.score}</p>
            </div>
            <div>
              <p className="text-cyan-200/60">Level</p>
              <p className="text-[#d4b070]">{data.level}</p>
            </div>
            <div>
              <p className="text-cyan-200/60">Confidence</p>
              <p className="text-cyan-50/95">{data.confidence}%</p>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs">
            {data.drivers.map((driver) => (
              <p key={driver} className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-2.5 py-1.5 text-cyan-100/85">
                {driver}
              </p>
            ))}
          </div>
        </>
      ) : null}

      </section>

      {open && pressureSupport ? (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#020812]/75 px-4 py-6 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-cyan-400/20 bg-[#091523] p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Tourism Pressure Index support details"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-medium text-cyan-50/95">Tourism Pressure Index Support</h3>
                <p className="mt-1 text-xs text-cyan-200/55">
                  {formatDate(pressureSupport.selectedDate)} · {pressureSupport.sourceFileName}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md border border-cyan-400/20 px-3 py-1.5 text-xs text-cyan-100/80 hover:bg-cyan-400/10"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
              <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2">
                <p className="text-cyan-200/60">Alert</p>
                <p className="text-cyan-50/95">{pressureSupport.alertLevel}</p>
              </div>
              <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2">
                <p className="text-cyan-200/60">Signal</p>
                <p className="text-cyan-50/95">{pressureSupport.netDemandSignal}</p>
              </div>
              <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2">
                <p className="text-cyan-200/60">Confidence</p>
                <p className="text-cyan-50/95">{pressureSupport.confidence}%</p>
              </div>
              <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2">
                <p className="text-cyan-200/60">Score source</p>
                <p className="text-cyan-50/95">{sourceLabel(pressureSupport.dimensions.scoreFrom)}</p>
              </div>
              <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2">
                <p className="text-cyan-200/60">High-alert day</p>
                <p className="text-cyan-50/95">{pressureSupport.highAlertDay ? "Yes" : "No"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-3 text-xs text-cyan-100/80">
              <p className="font-medium text-cyan-50/95">Score construction</p>
              <p className="mt-1 text-cyan-200/55">
                The visible Tourism Pressure score uses the highest of flight, cruise, or event pressure for the selected day. Weather risk is shown separately as disruption context and does not drive the score directly.
              </p>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h4 className="text-xs font-medium tracking-wide text-cyan-100/90">Pressure dimensions</h4>
                <button
                  type="button"
                  className={`rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                    activeDimension === "all"
                      ? "border-cyan-300/60 bg-transparent text-cyan-50/95"
                      : "border-cyan-400/30 bg-transparent text-cyan-200/75 hover:border-cyan-300/45 hover:bg-cyan-400/5"
                  }`}
                  onClick={() => setActiveDimension("all")}
                  aria-pressed={activeDimension === "all"}
                >
                  Show all
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <button
                  type="button"
                  className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
                    activeDimension === "flight"
                      ? "border-cyan-300/60 bg-transparent"
                      : "border-cyan-400/30 bg-transparent hover:border-cyan-300/45 hover:bg-cyan-400/5"
                  }`}
                  onClick={() => setActiveDimension("flight")}
                  aria-pressed={activeDimension === "flight"}
                >
                  <p className="text-cyan-200/70">Flight</p>
                  <p className="text-cyan-50/95">{pressureSupport.dimensions.flightPressure}</p>
                </button>
                <button
                  type="button"
                  className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
                    activeDimension === "cruise"
                      ? "border-cyan-300/60 bg-transparent"
                      : "border-cyan-400/30 bg-transparent hover:border-cyan-300/45 hover:bg-cyan-400/5"
                  }`}
                  onClick={() => setActiveDimension("cruise")}
                  aria-pressed={activeDimension === "cruise"}
                >
                  <p className="text-cyan-200/70">Cruise</p>
                  <p className="text-cyan-50/95">{pressureSupport.dimensions.cruisePressure}</p>
                </button>
                <button
                  type="button"
                  className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
                    activeDimension === "weather"
                      ? "border-cyan-300/60 bg-transparent"
                      : "border-cyan-400/30 bg-transparent hover:border-cyan-300/45 hover:bg-cyan-400/5"
                  }`}
                  onClick={() => setActiveDimension("weather")}
                  aria-pressed={activeDimension === "weather"}
                >
                  <p className="text-cyan-200/70">Weather</p>
                  <p className="text-cyan-50/95">{pressureSupport.dimensions.weatherRisk}</p>
                </button>
                <button
                  type="button"
                  className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
                    activeDimension === "events"
                      ? "border-cyan-300/60 bg-transparent"
                      : "border-cyan-400/30 bg-transparent hover:border-cyan-300/45 hover:bg-cyan-400/5"
                  }`}
                  onClick={() => setActiveDimension("events")}
                  aria-pressed={activeDimension === "events"}
                >
                  <p className="text-cyan-200/70">Events</p>
                  <p className="text-cyan-50/95">{pressureSupport.dimensions.eventPressure}</p>
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-medium tracking-wide text-cyan-100/90">Daily reasons</h4>
              <div className="mt-2 space-y-1.5 text-xs">
                {pressureSupport.reasons.map((reason) => (
                  <p key={reason} className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-2.5 py-1.5 text-cyan-100/85">
                    {reason}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-medium tracking-wide text-cyan-100/90">Matched source signals</h4>
              <p className="mt-1 text-[11px] text-cyan-200/50">
                Showing {dimensionLabel(activeDimension).toLowerCase()} support: {filteredSignals.length} signal{filteredSignals.length === 1 ? "" : "s"}
              </p>
              <div className="mt-2 space-y-2 text-xs">
                {filteredSignals.length === 0 ? (
                  <p className="text-cyan-100/70">No matching source signals were attached to the selected dimension for this day.</p>
                ) : null}
                {filteredSignals.map((signal) => (
                  <div key={`${signal.sourceUrl}-${signal.title}`} className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-cyan-50/95">{signal.title}</p>
                        <p className="mt-1 text-[11px] text-cyan-200/55">
                          {signal.signalType} · {signal.region} · {signal.sourceName}
                        </p>
                      </div>
                      <div className="text-right text-[11px] text-cyan-200/60">
                        <p>Impact {signal.estimatedImpactScore}</p>
                        <p>Confidence {signal.confidenceScore}%</p>
                      </div>
                    </div>
                    <p className="mt-2 text-cyan-100/80">{signal.summary}</p>
                    <a className="mt-2 inline-block text-cyan-300/80 underline underline-offset-2" href={signal.sourceUrl} target="_blank" rel="noreferrer">
                      Open source
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
