import Link from "next/link";

export type ForecastRow = {
  id: string;
  eta: string;
  etd: string | null;
  berth: string | null;
  pax_estimate: number | null;
  status: string;
  cruise_line: string | null;
  vessel_name_raw: string;
  vessel_id: string;
  port_name: string;
  port_code: string;
  opportunity_score: number;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: string) {
  switch (status) {
    case "arrived":
      return "Arrived";
    case "departed":
      return "Departed";
    case "cancelled":
      return "Cancelled";
    default:
      return "Scheduled";
  }
}

export function ForecastTable({ rows }: { rows: ForecastRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-[1150px] w-full text-sm">
        <thead className="bg-black/30 text-xs uppercase tracking-[0.1em] text-gray-400">
          <tr>
            <th className="px-3 py-3 text-left">Date</th>
            <th className="px-3 py-3 text-left">Port</th>
            <th className="px-3 py-3 text-left">Vessel</th>
            <th className="px-3 py-3 text-left">Pax</th>
            <th className="px-3 py-3 text-left">Line</th>
            <th className="px-3 py-3 text-left">Berth</th>
            <th className="px-3 py-3 text-left">ETA</th>
            <th className="px-3 py-3 text-left">ETD</th>
            <th className="px-3 py-3 text-left">Status</th>
            <th className="px-3 py-3 text-left">Opportunity Score</th>
            <th className="px-3 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={11} className="px-3 py-10 text-center text-gray-400">
                No calls matched your filters.
              </td>
            </tr>
          ) : null}

          {rows.map((row) => (
            <tr key={row.id} className="border-t border-white/10 text-gray-100 hover:bg-white/5">
              <td className="px-3 py-3">{new Date(row.eta).toLocaleDateString("en-GB")}</td>
              <td className="px-3 py-3">{row.port_name}</td>
              <td className="px-3 py-3 font-medium text-white">{row.vessel_name_raw}</td>
              <td className="px-3 py-3">{row.pax_estimate ?? "—"}</td>
              <td className="px-3 py-3">{row.cruise_line ?? "—"}</td>
              <td className="px-3 py-3">{row.berth ?? "—"}</td>
              <td className="px-3 py-3">{formatDateTime(row.eta)}</td>
              <td className="px-3 py-3">{formatDateTime(row.etd)}</td>
              <td className="px-3 py-3">{statusLabel(row.status)}</td>
              <td className="px-3 py-3 font-semibold text-emerald-300">{row.opportunity_score}</td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/cruise-intelligence/calls/${row.id}`}
                    className="inline-flex rounded-md border border-emerald-400/40 px-2 py-1 text-xs text-emerald-100 hover:bg-emerald-500/20"
                  >
                    Call
                  </Link>
                  <Link
                    href={`/admin/cruise-intelligence/vessels/${row.vessel_id}`}
                    className="inline-flex rounded-md border border-blue-400/40 px-2 py-1 text-xs text-blue-100 hover:bg-blue-500/20"
                  >
                    Vessel
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
