import type { NextCriticalDay as NextCriticalDayData } from "@/app/control-room-v2/types/intelligence";

type NextCriticalDayProps = {
  data?: NextCriticalDayData;
  loading?: boolean;
  error?: string | null;
  disconnected?: boolean;
};

function formatDate(value: string): string {
  if (!value) return "-";
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function alertTone(alertLevel: NextCriticalDayData["alertLevel"]) {
  if (alertLevel === "high-alert") return "text-amber-200 border-amber-300/30 bg-amber-300/10";
  if (alertLevel === "watch") return "text-cyan-100 border-cyan-300/35 bg-cyan-300/10";
  if (alertLevel === "normal") return "text-emerald-200 border-emerald-300/30 bg-emerald-300/10";
  return "text-cyan-100/75 border-cyan-300/20 bg-cyan-300/5";
}

function NextCriticalDaySkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-8 animate-pulse rounded-md bg-[#10233a]/55" />
      <div className="h-14 animate-pulse rounded-md bg-[#10233a]/55" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <div className="h-12 animate-pulse rounded-md bg-[#10233a]/55" />
        <div className="h-12 animate-pulse rounded-md bg-[#10233a]/55" />
        <div className="h-12 animate-pulse rounded-md bg-[#10233a]/55" />
        <div className="h-12 animate-pulse rounded-md bg-[#10233a]/55" />
        <div className="h-12 animate-pulse rounded-md bg-[#10233a]/55" />
      </div>
    </div>
  );
}

export default function NextCriticalDay({
  data,
  loading = false,
  error = null,
  disconnected = false,
}: NextCriticalDayProps) {
  return (
    <section className="rounded-xl border border-cyan-300/25 bg-gradient-to-r from-slate-900/90 via-[#122338]/82 to-[#102038]/85 p-4 shadow-[inset_0_1px_0_rgba(125,211,252,0.12)]">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-cyan-50/95">Next Critical Day</h2>
          <p className="mt-1 text-xs text-cyan-200/65">Anchor operational insight for the upcoming demand window.</p>
        </div>
        {data ? (
          <span className={`rounded-md border px-2 py-1 text-[11px] uppercase tracking-wide ${alertTone(data.alertLevel)}`}>
            {data.dayKind === "pressure-risk" ? "Pressure Risk" : "Opportunity"}
          </span>
        ) : null}
      </header>

      {loading ? <NextCriticalDaySkeleton /> : null}

      {!loading && error ? <p className="text-xs text-amber-200/90">{error}</p> : null}

      {!loading && !error && disconnected ? (
        <p className="text-xs text-cyan-100/75">Connect demand intelligence data to surface the next critical day.</p>
      ) : null}

      {!loading && !error && !disconnected && data ? (
        <div className="space-y-3">
          {data.fallbackNotice ? (
            <p className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100/85">{data.fallbackNotice}</p>
          ) : null}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2 text-xs">
              <p className="text-cyan-200/60">Date</p>
              <p className="text-cyan-50/95">{formatDate(data.dateISO)}</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2 text-xs">
              <p className="text-cyan-200/60">Alert level</p>
              <p className="text-cyan-50/95">{data.alertLevel}</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2 text-xs">
              <p className="text-cyan-200/60">Confidence</p>
              <p className="text-cyan-50/95">{data.confidence}%</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2 text-xs">
              <p className="text-cyan-200/60">Day type</p>
              <p className="text-cyan-50/95">{data.dayKind === "pressure-risk" ? "Pressure risk" : "Opportunity"}</p>
            </div>
          </div>

          <p className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2 text-sm leading-relaxed text-cyan-100/90">{data.summary}</p>

          <div className="space-y-1.5 text-xs text-cyan-100/85">
            {data.reasons.slice(0, 4).map((reason) => (
              <p key={reason} className="rounded-md border border-cyan-400/15 bg-[#10233a]/45 px-2.5 py-1.5">
                {reason}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/45 px-2.5 py-1.5">
              <p className="text-cyan-200/60">Flights</p>
              <p className="text-cyan-50/95">{data.categoryMix.flights}</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/45 px-2.5 py-1.5">
              <p className="text-cyan-200/60">Cruise</p>
              <p className="text-cyan-50/95">{data.categoryMix.cruise}</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/45 px-2.5 py-1.5">
              <p className="text-cyan-200/60">Weather</p>
              <p className="text-cyan-50/95">{data.categoryMix.weather}</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/45 px-2.5 py-1.5">
              <p className="text-cyan-200/60">Events</p>
              <p className="text-cyan-50/95">{data.categoryMix.events}</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/45 px-2.5 py-1.5">
              <p className="text-cyan-200/60">Tourism</p>
              <p className="text-cyan-50/95">{data.categoryMix.tourism}</p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}