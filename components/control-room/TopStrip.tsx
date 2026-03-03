import { formatTimestamp } from "@/components/control-room/format";

type TopStripProps = {
  selectedMonth: number;
  selectedYear: number;
  monthOptions: number[];
  yearOptions: number[];
  lastUpdatedIso: string;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
};

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function TopStrip({
  selectedMonth,
  selectedYear,
  monthOptions,
  yearOptions,
  lastUpdatedIso,
  onMonthChange,
  onYearChange,
}: TopStripProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-400/20 bg-gradient-to-r from-slate-900/85 via-[#112338]/70 to-[#0f2238]/80 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <label className="text-xs text-cyan-200/70" htmlFor="control-room-month">
          Month
        </label>
        <select
          id="control-room-month"
          value={selectedMonth}
          onChange={(event) => onMonthChange(Number(event.target.value))}
          className="rounded-lg border border-cyan-400/20 bg-[#101c2e]/90 px-2.5 py-1 text-xs text-cyan-50 focus:outline-none"
        >
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {MONTH_LABELS[month - 1]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-cyan-200/70" htmlFor="control-room-year">
          Year
        </label>
        <select
          id="control-room-year"
          value={selectedYear}
          onChange={(event) => onYearChange(Number(event.target.value))}
          className="rounded-lg border border-cyan-400/20 bg-[#101c2e]/90 px-2.5 py-1 text-xs text-cyan-50 focus:outline-none"
        >
          {yearOptions.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <p className="text-[11px] text-cyan-200/60">Last updated {formatTimestamp(lastUpdatedIso)}</p>
    </div>
  );
}
