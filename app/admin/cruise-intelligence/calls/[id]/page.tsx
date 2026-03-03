import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function createOutreachTask(formData: FormData) {
  "use server";

  const portCallId = String(formData.get("port_call_id") ?? "").trim();
  const vesselId = String(formData.get("vessel_id") ?? "").trim();
  const assignee = String(formData.get("assignee") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const dueAtInput = String(formData.get("due_at") ?? "").trim();
  const priorityInput = Number.parseInt(String(formData.get("priority") ?? "3"), 10);

  if (!portCallId) {
    redirect("/admin/cruise-intelligence");
  }

  const dueAtIso = dueAtInput ? new Date(dueAtInput).toISOString() : null;
  const priority = Number.isFinite(priorityInput)
    ? Math.min(5, Math.max(1, priorityInput))
    : 3;

  const { error } = await supabaseAdmin.from("outreach_tasks").insert({
    port_call_id: portCallId,
    vessel_id: vesselId || null,
    assignee: assignee || null,
    notes: notes || null,
    priority,
    due_at: dueAtIso,
    created_by: "admin",
    status: "pending",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/admin/cruise-intelligence/calls/${portCallId}`);
  redirect(`/admin/cruise-intelligence/calls/${portCallId}`);
}

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

export default async function CruiseCallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: portCall, error } = await supabaseAdmin
    .from("port_calls")
    .select(
      "id, eta, etd, berth, pax_estimate, status, cruise_line, vessel_name_raw, vessel_id, ports(id, code, name), vessels(id, name, cruise_line), opportunities(score, score_reasons, recommended_action)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!portCall) {
    notFound();
  }

  const { data: tasks, error: tasksError } = await supabaseAdmin
    .from("outreach_tasks")
    .select("id, status, priority, due_at, assignee, notes, created_at")
    .eq("port_call_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (tasksError) {
    throw new Error(tasksError.message);
  }

  const opportunity = Array.isArray(portCall.opportunities)
    ? portCall.opportunities[0]
    : portCall.opportunities;

  return (
    <main className="min-h-screen bg-[#0b0e12] text-white px-6 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Port Call Detail</h1>
          <p className="text-sm text-gray-400">{portCall.vessel_name_raw}</p>
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

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 space-y-2 text-sm">
          <p><span className="text-gray-400">Port:</span> {(portCall.ports as { name?: string } | null)?.name ?? "Unknown"}</p>
          <p><span className="text-gray-400">ETA:</span> {formatDateTime(portCall.eta)}</p>
          <p><span className="text-gray-400">ETD:</span> {formatDateTime(portCall.etd)}</p>
          <p><span className="text-gray-400">Berth:</span> {portCall.berth ?? "—"}</p>
          <p><span className="text-gray-400">Pax estimate:</span> {portCall.pax_estimate ?? "—"}</p>
          <p><span className="text-gray-400">Status:</span> {portCall.status}</p>
          <p><span className="text-gray-400">Line:</span> {portCall.cruise_line ?? "—"}</p>
          <p>
            <span className="text-gray-400">Vessel page:</span>{" "}
            <Link href={`/admin/cruise-intelligence/vessels/${portCall.vessel_id}`} className="text-blue-300 underline">
              Open vessel profile
            </Link>
          </p>
        </div>

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4 space-y-2 text-sm">
          <p className="text-emerald-200 font-medium">Opportunity</p>
          <p><span className="text-gray-400">Score:</span> {(opportunity as { score?: number } | null)?.score ?? 0}</p>
          <p>
            <span className="text-gray-400">Recommended action:</span>{" "}
            {(opportunity as { recommended_action?: string } | null)?.recommended_action ?? "—"}
          </p>
          <div>
            <p className="text-gray-400">Reasons:</p>
            <ul className="list-disc ml-5 space-y-1 mt-1">
              {((opportunity as { score_reasons?: string[] } | null)?.score_reasons ?? []).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-black/20 p-4">
        <h2 className="text-lg font-semibold mb-3">Create Outreach Task</h2>
        <form action={createOutreachTask} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input type="hidden" name="port_call_id" value={portCall.id} />
          <input type="hidden" name="vessel_id" value={portCall.vessel_id} />

          <input
            name="assignee"
            placeholder="Assignee"
            className="h-10 rounded-md border border-white/20 bg-[#10141a] px-3 text-sm"
          />

          <input
            name="due_at"
            type="datetime-local"
            className="h-10 rounded-md border border-white/20 bg-[#10141a] px-3 text-sm"
          />

          <select
            name="priority"
            defaultValue="3"
            className="h-10 rounded-md border border-white/20 bg-[#10141a] px-3 text-sm"
          >
            <option value="1">Priority 1 (highest)</option>
            <option value="2">Priority 2</option>
            <option value="3">Priority 3</option>
            <option value="4">Priority 4</option>
            <option value="5">Priority 5 (lowest)</option>
          </select>

          <input
            name="notes"
            placeholder="Notes"
            className="h-10 rounded-md border border-white/20 bg-[#10141a] px-3 text-sm"
          />

          <button
            type="submit"
            className="md:col-span-2 h-10 rounded-md border border-emerald-400/30 bg-emerald-500/15 text-emerald-100 text-sm font-medium hover:bg-emerald-500/25"
          >
            Create outreach task
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-white/10 bg-black/20 p-4">
        <h2 className="text-lg font-semibold mb-3">Outreach Queue</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="text-xs uppercase tracking-[0.08em] text-gray-400">
              <tr>
                <th className="text-left py-2">Created</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Priority</th>
                <th className="text-left py-2">Due</th>
                <th className="text-left py-2">Assignee</th>
                <th className="text-left py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {(tasks ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">No outreach tasks yet.</td>
                </tr>
              ) : null}
              {(tasks ?? []).map((task) => (
                <tr key={task.id} className="border-t border-white/10">
                  <td className="py-2">{formatDateTime(task.created_at)}</td>
                  <td className="py-2">{task.status}</td>
                  <td className="py-2">{task.priority}</td>
                  <td className="py-2">{formatDateTime(task.due_at)}</td>
                  <td className="py-2">{task.assignee ?? "—"}</td>
                  <td className="py-2">{task.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
