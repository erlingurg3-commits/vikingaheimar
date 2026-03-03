import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

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

export default async function VesselDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: vessel, error: vesselError } = await supabaseAdmin
    .from("vessels")
    .select("id, name, normalized_name, cruise_line, imo, capacity_estimate")
    .eq("id", id)
    .maybeSingle();

  if (vesselError) {
    throw new Error(vesselError.message);
  }

  if (!vessel) {
    notFound();
  }

  const { data: calls, error: callsError } = await supabaseAdmin
    .from("port_calls")
    .select("id, eta, etd, berth, status, pax_estimate, ports(id, name, code), opportunities(score)")
    .eq("vessel_id", id)
    .gte("eta", new Date().toISOString())
    .order("eta", { ascending: true })
    .limit(50);

  if (callsError) {
    throw new Error(callsError.message);
  }

  return (
    <main className="min-h-screen bg-[#0b0e12] text-white px-6 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Vessel Profile</h1>
          <p className="text-sm text-gray-400">{vessel.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/cruise-intelligence"
            className="rounded-md border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
          >
            Back to forecast
          </Link>
          <Link
            href="/control-room"
            className="rounded-md border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
          >
            Back to Control Room
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-black/20 p-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <p><span className="text-gray-400">Name:</span> {vessel.name}</p>
        <p><span className="text-gray-400">Cruise line:</span> {vessel.cruise_line ?? "—"}</p>
        <p><span className="text-gray-400">IMO:</span> {vessel.imo ?? "—"}</p>
        <p><span className="text-gray-400">Capacity estimate:</span> {vessel.capacity_estimate ?? "—"}</p>
      </section>

      <section className="rounded-xl border border-white/10 bg-black/20 p-4">
        <h2 className="text-lg font-semibold mb-3">Upcoming Calls</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="text-xs uppercase tracking-[0.08em] text-gray-400">
              <tr>
                <th className="text-left py-2">Port</th>
                <th className="text-left py-2">ETA</th>
                <th className="text-left py-2">ETD</th>
                <th className="text-left py-2">Berth</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Pax</th>
                <th className="text-left py-2">Opportunity</th>
                <th className="text-left py-2">Call</th>
              </tr>
            </thead>
            <tbody>
              {(calls ?? []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-400">No upcoming calls.</td>
                </tr>
              ) : null}
              {(calls ?? []).map((call) => {
                const score = Array.isArray(call.opportunities)
                  ? call.opportunities[0]?.score ?? 0
                  : (call.opportunities as { score?: number } | null)?.score ?? 0;

                return (
                  <tr key={call.id} className="border-t border-white/10">
                    <td className="py-2">{(call.ports as { name?: string } | null)?.name ?? "Unknown"}</td>
                    <td className="py-2">{formatDateTime(call.eta)}</td>
                    <td className="py-2">{formatDateTime(call.etd)}</td>
                    <td className="py-2">{call.berth ?? "—"}</td>
                    <td className="py-2">{call.status}</td>
                    <td className="py-2">{call.pax_estimate ?? "—"}</td>
                    <td className="py-2">{score}</td>
                    <td className="py-2">
                      <Link
                        href={`/admin/cruise-intelligence/calls/${call.id}`}
                        className="text-blue-300 underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
