import type { OpportunityItem } from "@/app/control-room-v2/types/intelligence";

type OpportunityRadarProps = {
  data?: OpportunityItem[];
  loading?: boolean;
  error?: string | null;
  disconnected?: boolean;
};

function formatDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function RadarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-20 animate-pulse rounded-md bg-[#10233a]/55" />
      <div className="h-20 animate-pulse rounded-md bg-[#10233a]/55" />
      <div className="h-20 animate-pulse rounded-md bg-[#10233a]/55" />
    </div>
  );
}

export default function OpportunityRadar({
  data = [],
  loading = false,
  error = null,
  disconnected = false,
}: OpportunityRadarProps) {
  return (
    <section className="rounded-xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/85 via-[#14263b]/65 to-[#0f2238]/80 p-4 shadow-[inset_0_1px_0_rgba(125,211,252,0.06)]">
      <header className="mb-3">
        <h2 className="text-xs font-medium tracking-wide text-cyan-100/90">Opportunity Radar</h2>
      </header>

      {loading ? <RadarSkeleton /> : null}

      {!loading && error ? <p className="text-xs text-amber-200/90">{error}</p> : null}

      {!loading && !error && disconnected ? (
        <p className="text-xs text-cyan-100/75">Opportunity radar becomes active when booking and signal feeds are connected.</p>
      ) : null}

      {!loading && !error ? (
        <div className="space-y-2 text-xs">
          {data.length === 0 ? <p className="text-cyan-100/70">No opportunities detected.</p> : null}
          {data.map((item) => (
            <details key={`${item.dateISO}-${item.title}`} className="rounded-md border border-cyan-400/15 bg-[#10233a]/55 p-2.5">
              <summary className="cursor-pointer list-none">
                <div className="mb-1.5 flex items-center justify-between text-cyan-200/70">
                  <span>{formatDate(item.dateISO)}</span>
                  <span className={item.type === "FILL" ? "text-[#7fe8c5]" : "text-[#d4b070]"}>{item.type}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-cyan-50/95">{item.title}</p>
                  <span className="text-[11px] text-cyan-100/65">{item.confidence}%</span>
                </div>
              </summary>

              <div className="mt-2 space-y-2 text-cyan-100/80">
                <ul className="space-y-1">
                  {item.why.map((reason) => (
                    <li key={reason}>- {reason}</li>
                  ))}
                </ul>
                <ul className="space-y-1">
                  {item.actions.map((action) => (
                    <li key={action}>{"->"} {action}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      ) : null}
    </section>
  );
}
