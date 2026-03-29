import type { DemandRunDiff } from "@/app/control-room-v2/types/intelligence";

type RunDiffPanelProps = {
  diff?: DemandRunDiff | null;
  loading?: boolean;
  error?: string | null;
};

function formatDelta(value: number): string {
  if (value > 0) return `+${value}`;
  return String(value);
}

function deltaClass(value: number): string {
  if (value > 0) return "text-emerald-300";
  if (value < 0) return "text-amber-300";
  return "text-cyan-50/95";
}

export default function RunDiffPanel({ diff = null, loading = false, error = null }: RunDiffPanelProps) {
  return (
    <section className="rounded-xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/85 via-[#14263b]/65 to-[#0f2238]/80 p-4 shadow-[inset_0_1px_0_rgba(125,211,252,0.06)]">
      <header className="mb-3">
        <h2 className="text-xs font-medium tracking-wide text-cyan-100/90">Latest Run Diff</h2>
      </header>

      {loading ? <div className="h-24 animate-pulse rounded-md bg-[#10233a]/55" /> : null}
      {!loading && error ? <p className="text-xs text-amber-200/90">{error}</p> : null}

      {!loading && !error && !diff ? (
        <p className="text-xs text-cyan-100/70">Need at least two indexed runs to show a diff.</p>
      ) : null}

      {!loading && !error && diff ? (
        <div className="space-y-3 text-xs">
          <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2.5">
            <p className="text-cyan-200/60">Comparing</p>
            <p className="mt-1 text-cyan-50/95">{diff.newerFile}</p>
            <p className="text-cyan-200/45">vs {diff.olderFile}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-2.5 py-2">
              <p className="text-cyan-200/60">Signals</p>
              <p className={deltaClass(diff.signalCountDelta)}>{formatDelta(diff.signalCountDelta)}</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-2.5 py-2">
              <p className="text-cyan-200/60">High-alert</p>
              <p className={deltaClass(diff.highAlertDaysDelta)}>{formatDelta(diff.highAlertDaysDelta)}</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-2.5 py-2">
              <p className="text-cyan-200/60">Watch</p>
              <p className={deltaClass(diff.watchDaysDelta)}>{formatDelta(diff.watchDaysDelta)}</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-2.5 py-2">
              <p className="text-cyan-200/60">Normal</p>
              <p className={deltaClass(diff.normalDaysDelta)}>{formatDelta(diff.normalDaysDelta)}</p>
            </div>
          </div>

          <p className="text-cyan-200/55">
            Date range changed: <span className="text-cyan-50/95">{diff.dateRangeChanged ? "Yes" : "No"}</span>
          </p>
        </div>
      ) : null}
    </section>
  );
}