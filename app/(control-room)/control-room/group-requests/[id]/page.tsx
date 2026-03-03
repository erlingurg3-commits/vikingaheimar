"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/app/components/primitives/Badge";

type GroupRequestDetail = {
  id: string;
  created_at: string;
  agent_company: string;
  agent_name: string;
  customer_email: string;
  visit_date: string;
  preferred_visit_time: string;
  selected_visit_time: string | null;
  group_size: number;
  notes: string | null;
  status: "pending_admin_review" | "approved" | "declined" | "suggested_alternatives";
  feasibility: "feasible" | "not_feasible";
  suggested_times: string[];
  admin_comment: string | null;
};

type AllocationRow = {
  id: string;
  visit_date: string;
  visit_time: string;
  pax: number;
  status: string;
};

type LinkedOrderRow = {
  id: string;
  visit_date: string;
  visit_time: string;
  status: string;
  source_type: string | null;
  source_id: string | null;
  ticket_general: number | null;
  ticket_youth: number | null;
  ticket_family: number | null;
};

type DetailPayload = {
  request: GroupRequestDetail;
  allocations: AllocationRow[];
  linkedOrders: LinkedOrderRow[];
};

function statusBadge(status: GroupRequestDetail["status"]) {
  if (status === "pending_admin_review") {
    return <Badge variant="info" size="sm">Pending Review</Badge>;
  }

  if (status === "suggested_alternatives") {
    return <Badge variant="warning" size="sm">Suggested Alternatives</Badge>;
  }

  if (status === "approved") {
    return <Badge variant="success" size="sm">Approved</Badge>;
  }

  return <Badge variant="error" size="sm">Declined</Badge>;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function GroupRequestDetailPage({ params }: PageProps) {
  const [requestId, setRequestId] = useState("");
  const [row, setRow] = useState<GroupRequestDetail | null>(null);
  const [allocations, setAllocations] = useState<AllocationRow[]>([]);
  const [linkedOrders, setLinkedOrders] = useState<LinkedOrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminComment, setAdminComment] = useState("");
  const [startTime, setStartTime] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    params.then((value) => setRequestId(value.id));
  }, [params]);

  useEffect(() => {
    if (!requestId) return;

    const load = async () => {
      setError("");

      const response = await fetch(`/api/groups/request/${requestId}`);
      const payload = (await response.json()) as DetailPayload | { message?: string };

      if (!response.ok || !("request" in payload)) {
        const message = "message" in payload ? (payload.message ?? "Unable to load request") : "Unable to load request";
        setError(message);
        setRow(null);
        setLoading(false);
        return;
      }

      setRow(payload.request);
      setAllocations(payload.allocations ?? []);
      setLinkedOrders(payload.linkedOrders ?? []);

      const selected = payload.request.selected_visit_time ?? payload.request.preferred_visit_time;
      const startIso = `${payload.request.visit_date}T${selected}:00.000Z`;
      setStartTime(startIso);
      setAdminComment(payload.request.admin_comment ?? "");
      setLoading(false);
    };

    void load();
  }, [requestId, feedback]);

  const candidateTimes = useMemo(() => {
    if (!row) return [];

    const base = row.selected_visit_time ?? row.preferred_visit_time;
    const merged = [base, ...(row.suggested_times ?? [])];

    return Array.from(new Set(merged.filter(Boolean))).map(
      (time) => `${row.visit_date}T${time}:00.000Z`
    );
  }, [row]);

  const approve = async () => {
    if (!requestId) return;

    setBusy(true);
    setError("");
    setFeedback("");

    const response = await fetch(`/api/control-room/group-requests/${requestId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        admin_comment: adminComment || undefined,
        start_time: startTime || undefined,
      }),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError(payload.message ?? "Approval failed");
      setBusy(false);
      return;
    }

    setFeedback(payload.message ?? "Approved");
    setBusy(false);
  };

  const decline = async () => {
    if (!requestId) return;
    if (!adminComment.trim()) {
      setError("Please provide an admin comment when declining.");
      return;
    }

    setBusy(true);
    setError("");
    setFeedback("");

    const response = await fetch(`/api/control-room/group-requests/${requestId}/decline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        admin_comment: adminComment,
      }),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError(payload.message ?? "Decline failed");
      setBusy(false);
      return;
    }

    setFeedback(payload.message ?? "Declined");
    setBusy(false);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 p-5 sm:p-6 backdrop-blur-xl">
      {loading ? <p className="text-sm text-gray-400">Loading request details...</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {feedback ? <p className="text-sm text-emerald-300">{feedback}</p> : null}

      {row ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">Group Request Detail</h2>
              <p className="text-sm text-gray-400">Reference ID: {row.id}</p>
            </div>
            {statusBadge(row.status)}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-gray-200">
              <p><span className="text-gray-400">Agency:</span> {row.agent_company}</p>
              <p><span className="text-gray-400">Contact:</span> {row.agent_name}</p>
              <p><span className="text-gray-400">Email:</span> {row.customer_email}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-gray-200">
              <p><span className="text-gray-400">Date:</span> {row.visit_date}</p>
              <p><span className="text-gray-400">Preferred:</span> {row.preferred_visit_time}</p>
              <p><span className="text-gray-400">Current:</span> {row.selected_visit_time ?? row.preferred_visit_time}</p>
              <p><span className="text-gray-400">Group Size:</span> {row.group_size}</p>
            </div>
          </div>

          {row.notes ? (
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-gray-200">
              <p className="text-gray-400 mb-1">Notes</p>
              <p>{row.notes}</p>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Approval start time (UTC)</label>
            <select
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="w-full rounded-lg border border-emerald-500/20 bg-black/30 px-3 py-2 text-sm text-white"
            >
              {candidateTimes.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-comment" className="text-sm text-gray-300">Admin comment</label>
            <textarea
              id="admin-comment"
              value={adminComment}
              onChange={(event) => setAdminComment(event.target.value)}
              className="w-full min-h-24 rounded-lg border border-emerald-500/20 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={approve}
              disabled={busy}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-500/20 disabled:opacity-60"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={decline}
              disabled={busy}
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-500/20 disabled:opacity-60"
            >
              Decline
            </button>
          </div>

          <section className="rounded-xl border border-emerald-500/20 bg-black/20 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white">Verification Panel</h3>

            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Allocations</p>
              {allocations.length === 0 ? (
                <p className="mt-2 text-sm text-gray-400">No allocations found for this request.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {allocations.map((allocation) => (
                    <li key={allocation.id} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200">
                      {allocation.visit_date} {allocation.visit_time} · {allocation.pax} pax · {allocation.status}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.1em] text-gray-400">Linked Orders (source_type=group_request)</p>
              {linkedOrders.length === 0 ? (
                <p className="mt-2 text-sm text-gray-400">No linked orders found.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {linkedOrders.map((order) => (
                    <li key={order.id} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200">
                      #{order.id.slice(0, 8)} · {order.visit_date} {order.visit_time} · status {order.status} · pax {Number(order.ticket_general ?? 0) + Number(order.ticket_youth ?? 0) + Number(order.ticket_family ?? 0)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      ) : null}
    </section>
  );
}
