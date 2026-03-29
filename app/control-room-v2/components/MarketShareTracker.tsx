import type { MarketShareSnapshot } from "@/app/control-room-v2/types/intelligence";

type MarketShareTrackerProps = {
  data?: MarketShareSnapshot;
  loading?: boolean;
  error?: string | null;
  disconnected?: boolean;
  dataSource?: string;
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function MarketShareSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div className="h-14 animate-pulse rounded-md bg-[#10233a]/55" />
      <div className="h-14 animate-pulse rounded-md bg-[#10233a]/55" />
      <div className="h-14 animate-pulse rounded-md bg-[#10233a]/55" />
      <div className="h-14 animate-pulse rounded-md bg-[#10233a]/55" />
    </div>
  );
}

export default function MarketShareTracker({
  data,
  loading = false,
  error = null,
  disconnected = false,
  dataSource,
}: MarketShareTrackerProps) {
  const hasGap = data ? data.marketSharePct < data.targetPct - 0.75 : false;

  return (
    <section className="rounded-xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/85 via-[#14263b]/65 to-[#0f2238]/80 p-4 shadow-[inset_0_1px_0_rgba(125,211,252,0.06)]">
      <header className="mb-3">
        <h2 className="text-xs font-medium tracking-wide text-cyan-100/90">Market Share Tracker</h2>
      </header>

      {loading ? <MarketShareSkeleton /> : null}

      {!loading && error ? <p className="text-xs text-amber-200/90">{error}</p> : null}

      {!loading && !error && disconnected ? (
        <p className="text-xs text-cyan-100/75">Market share will populate once tourism pool and visitor feeds are connected.</p>
      ) : null}

      {!loading && !error && !disconnected && dataSource === "demand_file" ? (
        <div className="rounded-md border border-cyan-400/10 bg-[#0d1e30]/60 px-3 py-3 text-xs">
          <p className="font-medium text-cyan-100/70">Not sourced from demand files</p>
          <p className="mt-1 text-cyan-200/45 leading-relaxed">
            Market share tracking requires a booking pool feed. This panel will populate once visitor count and tourism pool data is connected.
          </p>
        </div>
      ) : null}

      {!loading && !error && data && dataSource !== "demand_file" ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-2.5 py-2">
              <p className="text-cyan-200/60">Tourism pool</p>
              <p className="text-cyan-50/95">{formatNumber(data.tourismPool)}</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-2.5 py-2">
              <p className="text-cyan-200/60">Visitors</p>
              <p className="text-cyan-50/95">{formatNumber(data.visitors)}</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-2.5 py-2">
              <p className="text-cyan-200/60">Market share</p>
              <p className="text-[#7fe8c5]">{data.marketSharePct}%</p>
            </div>
            <div className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 px-2.5 py-2">
              <p className="text-cyan-200/60">Target</p>
              <p className="text-cyan-50/95">{data.targetPct}%</p>
            </div>
          </div>

          {hasGap ? (
            <p className="rounded-md border border-amber-300/20 bg-amber-200/10 px-2.5 py-2 text-xs text-amber-100/85">
              Gap to target: {(data.targetPct - data.marketSharePct).toFixed(2)}pp
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

