import type { DemandRunSummary } from "@/app/control-room-v2/types/intelligence";

type RunHistoryPanelProps = {
  runs?: DemandRunSummary[];
  loading?: boolean;
  error?: string | null;
};

function formatDate(value: string | null): string {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function RunHistoryPanel({ runs = [], loading = false, error = null }: RunHistoryPanelProps) {
  return (
    <section className="rounded-xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/85 via-[#14263b]/65 to-[#0f2238]/80 p-4 shadow-[inset_0_1px_0_rgba(125,211,252,0.06)]">
      <header className="mb-3">
        <h2 className="text-xs font-medium tracking-wide text-cyan-100/90">Demand Run History</h2>
      </header>

      {loading ? <div className="h-24 animate-pulse rounded-md bg-[#10233a]/55" /> : null}
      {!loading && error ? <p className="text-xs text-amber-200/90">{error}</p> : null}

      {!loading && !error ? (
        <div className="space-y-2 text-xs">
          {runs.length === 0 ? <p className="text-cyan-100/70">No indexed runs found.</p> : null}
          {runs.slice(0, 5).map((run) => (
            <div key={run.filename} className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-cyan-50/95">{run.filename}</p>
                  <p className="mt-0.5 text-[11px] text-cyan-200/55">{formatDate(run.generatedAt)}</p>
                </div>
                {run.isLatest ? (
                  <span className="rounded border border-cyan-400/20 bg-cyan-400/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-cyan-300/70">
                    Latest
                  </span>
                ) : null}
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2 text-[11px] text-cyan-200/65">
                <div>
                  <p>Signals</p>
                  <p className="text-cyan-50/95">{run.signalCount}</p>
                </div>
                <div>
                  <p>High</p>
                  <p className="text-cyan-50/95">{run.highAlertDays}</p>
                </div>
                <div>
                  <p>Watch</p>
                  <p className="text-cyan-50/95">{run.watchDays}</p>
                </div>
                <div>
                  <p>Normal</p>
                  <p className="text-cyan-50/95">{run.normalDays}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}