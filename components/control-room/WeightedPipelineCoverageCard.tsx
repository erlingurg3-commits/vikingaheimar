import DeckCard from "@/components/control-room/DeckCard";
import { formatCompactCurrency, formatPercent } from "@/components/control-room/format";

type WeightedPipelineCoverageCardProps = {
  weightedPipeline: number;
  remainingTarget: number;
  coverageRatio: number;
  onExplainRisk: () => void;
};

export default function WeightedPipelineCoverageCard({
  weightedPipeline,
  remainingTarget,
  coverageRatio,
  onExplainRisk,
}: WeightedPipelineCoverageCardProps) {
  const barWidth = `${Math.min(coverageRatio, 1.2) / 1.2 * 100}%`;
  const isRisk = coverageRatio < 0.8;

  return (
    <DeckCard title="Weighted Pipeline Coverage">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-cyan-200/60">Weighted pipeline</p>
          <p className="text-cyan-50/90">{formatCompactCurrency(weightedPipeline)}</p>
        </div>
        <div>
          <p className="text-cyan-200/60">Remaining target</p>
          <p className="text-cyan-50/90">{formatCompactCurrency(remainingTarget)}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-[#122338]">
          <div className="h-2 rounded-full bg-[#3A7D5D]" style={{ width: barWidth }} />
        </div>
        <p className="text-xs text-cyan-50/90">Coverage {formatPercent(coverageRatio)}</p>
      </div>

      {isRisk ? (
        <button
          type="button"
          onClick={onExplainRisk}
          className="rounded-lg border border-[#A37C40] px-2.5 py-1 text-[11px] text-cyan-50/90"
        >
          Explain risk
        </button>
      ) : null}
    </DeckCard>
  );
}
