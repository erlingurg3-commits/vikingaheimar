import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const parsed = paramsSchema.safeParse(params);

  if (!parsed.success) {
    return Response.json({ message: "Invalid request id" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("group_requests")
    .select("id, created_at, agent_company, agent_name, agent_email, preferred_start, pax, notes, status, feasibility, suggested_times, admin_comment")
    .eq("id", parsed.data.id)
    .single();

  if (error || !data) {
    return Response.json({ message: "Group request not found" }, { status: 404 });
  }

  const [allocationsResponse, ordersResponse] = await Promise.all([
    supabaseAdmin
      .from("group_request_allocations")
      .select("id, visit_date, visit_time, pax, status")
      .eq("group_request_id", parsed.data.id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("orders")
      .select("id, visit_date, visit_time, status, source_type, source_id, ticket_general, ticket_youth, ticket_family, group_size, total_amount, admin_decision_reason")
      .eq("source_type", "group_request")
      .eq("source_id", parsed.data.id)
      .order("created_at", { ascending: false }),
  ]);

  const preferred = new Date(String(data.preferred_start ?? ""));
  const visitDate = Number.isNaN(preferred.getTime())
    ? ""
    : `${preferred.getUTCFullYear()}-${String(preferred.getUTCMonth() + 1).padStart(2, "0")}-${String(preferred.getUTCDate()).padStart(2, "0")}`;
  const preferredVisitTime = Number.isNaN(preferred.getTime())
    ? ""
    : `${String(preferred.getUTCHours()).padStart(2, "0")}:${String(preferred.getUTCMinutes()).padStart(2, "0")}`;

  const request = {
    id: String(data.id),
    created_at: String(data.created_at),
    agent_company: String(data.agent_company ?? ""),
    agent_name: String(data.agent_name ?? ""),
    customer_email: String(data.agent_email ?? ""),
    visit_date: visitDate,
    preferred_visit_time: preferredVisitTime,
    selected_visit_time: null,
    group_size: Number(data.pax ?? 0),
    notes: data.notes ?? null,
    status: String(data.status) as "pending_admin_review" | "approved" | "declined" | "suggested_alternatives",
    feasibility: String(data.feasibility) as "feasible" | "not_feasible",
    suggested_times: Array.isArray(data.suggested_times) ? data.suggested_times : [],
    admin_comment: data.admin_comment ?? null,
  };

  return Response.json(
    {
      request,
      allocations: allocationsResponse.data ?? [],
      linkedOrders: ordersResponse.data ?? [],
    },
    { status: 200 }
  );
}
