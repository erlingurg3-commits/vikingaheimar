import DeckCard from "@/components/control-room/DeckCard";
import Sparkline from "@/components/control-room/Sparkline";
import { formatCompactCurrency, formatPercent } from "@/components/control-room/format";
import type { RevenueStatus } from "@/components/control-room/calculations";

type RevenueVsTargetCardProps = {
  targetRevenue: number;
  confirmedRevenue: number;
  projectedRevenue: number;
  varianceRatio: number;
  status: RevenueStatus;
  trend: number[];
  onExplain: () => void;
};

export default function RevenueVsTargetCard({
  targetRevenue,
  confirmedRevenue,
  projectedRevenue,
  varianceRatio,
  status,
  trend,
  onExplain,
}: RevenueVsTargetCardProps) {
  const underlineClass = status === "pressure" ? "border-b border-[#A37C40]" : "";
  const projectedClass = status === "performance" ? "text-[#7fe8c5] shadow-[0_0_10px_rgba(92,239,186,0.22)]" : "text-cyan-50/90";

  return (
    <DeckCard title="Revenue vs Target" className={underlineClass}>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-cyan-200/60">Target</p>
          <p className="text-cyan-50/90">{formatCompactCurrency(targetRevenue)}</p>
        </div>
        <div>
          <p className="text-cyan-200/60">Confirmed</p>
          <p className="text-cyan-50/90">{formatCompactCurrency(confirmedRevenue)}</p>
        </div>
        <div>
          <p className="text-cyan-200/60">Projected</p>
          <p className={`inline-block rounded px-1.5 py-0.5 ${projectedClass}`}>{formatCompactCurrency(projectedRevenue)}</p>
        </div>
        <div>
          <p className="text-cyan-200/60">Variance</p>
          <p className="text-cyan-50/90">{formatPercent(varianceRatio)}</p>
        </div>
      </div>

      <Sparkline values={trend} stroke="#7fd4ff" />

      {status === "pressure" ? (
        <button
          type="button"
          onClick={onExplain}
          className="rounded-lg border border-[#A37C40] px-2.5 py-1 text-[11px] text-cyan-50/90"
        >
          Explain deviation
        </button>
      ) : null}
    </DeckCard>
  );
}
