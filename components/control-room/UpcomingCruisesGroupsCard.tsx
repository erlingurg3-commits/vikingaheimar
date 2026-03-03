import DeckCard from "@/components/control-room/DeckCard";
import { formatCompactCurrency, formatShortDate } from "@/components/control-room/format";
import type { UpcomingEntry } from "@/lib/control-room/mockData";

type UpcomingCruisesGroupsCardProps = {
  rows: UpcomingEntry[];
};

export default function UpcomingCruisesGroupsCard({ rows }: UpcomingCruisesGroupsCardProps) {
  return (
    <DeckCard title="Upcoming Cruises & Groups">
      <div className="overflow-hidden rounded-lg border border-cyan-400/20">
        <table className="w-full text-left text-[11px] text-cyan-50/90">
          <thead className="bg-[#0f2237]/80 text-cyan-200/65">
            <tr>
              <th className="px-2 py-2 font-medium">Date</th>
              <th className="px-2 py-2 font-medium">Source</th>
              <th className="px-2 py-2 font-medium">Pax</th>
              <th className="px-2 py-2 font-medium">Revenue</th>
              <th className="px-2 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-cyan-400/10">
                <td className="px-2 py-2">{formatShortDate(row.isoDate)}</td>
                <td className="px-2 py-2">{row.source}</td>
                <td className="px-2 py-2">{row.pax}</td>
                <td className="px-2 py-2">{formatCompactCurrency(row.revenue)}</td>
                <td className="px-2 py-2">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DeckCard>
  );
}
