import DeckCard from "@/components/control-room/DeckCard";
import Sparkline from "@/components/control-room/Sparkline";
import { formatCompactCurrency, formatPercent } from "@/components/control-room/format";

type BookingVelocityTrendCardProps = {
  lastTotal: number;
  previousTotal: number;
  changeRatio: number;
  trend: number[];
  onExplain: () => void;
};

export default function BookingVelocityTrendCard({
  lastTotal,
  previousTotal,
  changeRatio,
  trend,
  onExplain,
}: BookingVelocityTrendCardProps) {
  const showExplain = changeRatio < -0.18;

  return (
    <DeckCard title="Booking Velocity Trend">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-cyan-200/60">Last 7 days</p>
          <p className="text-cyan-50/90">{formatCompactCurrency(lastTotal)}</p>
        </div>
        <div>
          <p className="text-cyan-200/60">Previous 7 days</p>
          <p className="text-cyan-50/90">{formatCompactCurrency(previousTotal)}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-cyan-50/90">Change {formatPercent(changeRatio)}</p>
        <Sparkline values={trend} stroke="#7fd4ff" />
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
