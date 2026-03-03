import DeckCard from "@/components/control-room/DeckCard";
import { formatPercent, formatShortDate } from "@/components/control-room/format";

type GuestFlowCardProps = {
  totalGuests: number;
  averageCapacityRatio: number;
  peakDayIso: string;
  peakGuests: number;
  lowestDayIso: string;
  lowestGuests: number;
  hasCapacityPressure: boolean;
};

export default function GuestFlowCard({
  totalGuests,
  averageCapacityRatio,
  peakDayIso,
  peakGuests,
  lowestDayIso,
  lowestGuests,
  hasCapacityPressure,
}: GuestFlowCardProps) {
  return (
    <DeckCard title="7-Day Guest Flow" className={hasCapacityPressure ? "border-b border-[#A37C40]" : undefined}>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-cyan-200/60">Total next 7 days</p>
          <p className="text-cyan-50/90">{totalGuests.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-cyan-200/60">Capacity %</p>
          <p className="text-cyan-50/90">{formatPercent(averageCapacityRatio)}</p>
        </div>
        <div>
          <p className="text-cyan-200/60">Peak day</p>
          <p className="text-cyan-50/90">
            {formatShortDate(peakDayIso)} · {peakGuests}
          </p>
        </div>
        <div>
          <p className="text-cyan-200/60">Lowest day</p>
          <p className="text-cyan-50/90">
            {formatShortDate(lowestDayIso)} · {lowestGuests}
          </p>
        </div>
      </div>
    </DeckCard>
  );
}
