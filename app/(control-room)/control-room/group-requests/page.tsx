import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Badge } from "@/app/components/primitives/Badge";

type GroupRequestRow = {
  id: string;
  created_at: string;
  agent_id: string | null;
  agent_company: string;
  agent_name: string;
  agent_email: string;
  preferred_start: string;
  pax: number;
  status: string;
  suggested_times: string[];
  notes: string | null;
  admin_comment: string | null;
};

function statusBadge(status: GroupRequestRow["status"]) {
  if (status === "pending_admin_review") {
    return <Badge variant="info" size="sm">Pending Review</Badge>;
  }

  if (status === "suggested_alternatives") {
    return <Badge variant="warning" size="sm">Alternatives</Badge>;
  }

  if (status === "approved") {
    return <Badge variant="success" size="sm">Approved</Badge>;
  }

  return <Badge variant="error" size="sm">Declined</Badge>;
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function GroupRequestsQueuePage() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("group_requests")
    .select("id, created_at, agent_id, agent_company, agent_name, agent_email, preferred_start, pax, status, suggested_times, notes, admin_comment")
    .in("status", ["submitted", "pending_admin_review", "suggested_alternatives"])
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: agencies } = await supabase
    .from("travel_agencies")
    .select("id, company_name");

  const agencyNameById = new Map<string, string>();
  for (const agency of agencies ?? []) {
    agencyNameById.set(agency.id, agency.company_name);
  }

  const queueRows = ((data ?? []) as GroupRequestRow[]).map((row) => {
    const preferredDate = new Date(row.preferred_start);
    const visitDate = Number.isNaN(preferredDate.getTime())
      ? row.preferred_start
      : preferredDate.toLocaleDateString("en-CA");
    const visitTime = Number.isNaN(preferredDate.getTime())
      ? "—"
      : preferredDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

    return {
      ...row,
      agencyDisplayName:
        (row.agent_id ? agencyNameById.get(row.agent_id) : null) ?? row.agent_company,
      visitDate,
      visitTime,
    };
  });

  return (
    <section className="space-y-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 p-5 sm:p-6 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Group Requests Queue</h2>
          <p className="mt-1 text-sm text-gray-400">Last 50 travel agency requests ordered by latest first.</p>
        </div>
      </div>

      {error ? <p className="text-sm text-red-300">{error.message}</p> : null}

      <div className="overflow-x-auto rounded-xl border border-emerald-500/15">
        <table className="min-w-[1200px] w-full text-sm">
          <thead className="bg-black/40 text-xs uppercase tracking-[0.12em] text-gray-400">
            <tr>
              <th className="px-3 py-3 text-left">Created</th>
              <th className="px-3 py-3 text-left">Agency</th>
              <th className="px-3 py-3 text-left">Contact</th>
              <th className="px-3 py-3 text-left">Email</th>
              <th className="px-3 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-left">Time</th>
              <th className="px-3 py-3 text-left">Group Size</th>
              <th className="px-3 py-3 text-left">Admin Status</th>
              <th className="px-3 py-3 text-left">Suggested Times</th>
              <th className="px-3 py-3 text-left">Comment</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {queueRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-10 text-center text-gray-400">No requests in queue.</td>
              </tr>
            ) : null}

            {queueRows.map((row) => (
              <tr key={row.id} className="border-t border-white/10 text-gray-100 hover:bg-white/5">
                <td className="px-3 py-3">{formatTimestamp(row.created_at)}</td>
                <td className="px-3 py-3 font-medium text-white">{row.agencyDisplayName}</td>
                <td className="px-3 py-3">{row.agent_name}</td>
                <td className="px-3 py-3">{row.agent_email}</td>
                <td className="px-3 py-3">{row.visitDate}</td>
                <td className="px-3 py-3">{row.visitTime}</td>
                <td className="px-3 py-3">{row.pax}</td>
                <td className="px-3 py-3">{statusBadge(row.status)}</td>
                <td className="px-3 py-3 text-xs text-gray-300">
                  {Array.isArray(row.suggested_times) && row.suggested_times.length > 0
                    ? row.suggested_times.join(", ")
                    : "—"}
                </td>
                <td className="px-3 py-3 text-xs text-gray-300">{row.admin_comment ?? row.notes ?? "—"}</td>
                <td className="px-3 py-3">
                  <Link
                    href={`/control-room/group-requests/${row.id}`}
                    className="inline-flex rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-100 hover:bg-emerald-500/20"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
