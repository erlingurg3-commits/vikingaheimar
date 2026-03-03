import DeckCard from "@/components/control-room/DeckCard";
import { formatPercent } from "@/components/control-room/format";
import type { AgencyShare } from "@/lib/control-room/mockData";

type AgencyConcentrationCardProps = {
  agencies: AgencyShare[];
  topShare: number;
  onExplain: () => void;
};

function TrendArrow({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
        <path d="M2 8h12" stroke="#7fb0d0" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  const upward = delta > 0;
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3" aria-hidden="true">
      <path
        d={upward ? "M8 3l4 6H4l4-6z" : "M8 13l-4-6h8l-4 6z"}
        fill={upward ? "#A37C40" : "#66d9c1"}
      />
    </svg>
  );
}

export default function AgencyConcentrationCard({ agencies, topShare, onExplain }: AgencyConcentrationCardProps) {
  const showExplain = topShare > 0.38;

  return (
    <DeckCard title="Agency Concentration Snapshot">
      <div className="space-y-1.5 text-xs">
        {agencies.map((agency) => (
          <div key={agency.id} className="flex items-center justify-between rounded-lg border border-cyan-400/15 bg-[#10233a]/55 px-2.5 py-1.5">
            <p className="text-cyan-50/90">{agency.agency}</p>
            <div className="flex items-center gap-1.5 text-cyan-200/65">
              <span>{formatPercent(agency.share)}</span>
              <TrendArrow delta={agency.trendDelta30d} />
            </div>
          </div>
        ))}
      </div>

      {showExplain ? (
        <button
          type="button"
          onClick={onExplain}
          className="rounded-lg border border-[#A37C40] px-2.5 py-1 text-[11px] text-cyan-50/90"
        >
          Explain risk
        </button>
      ) : null}
    </DeckCard>
  );
}
