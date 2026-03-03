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
    .select("id, created_at, agent_company, agent_name, customer_email, visit_date, preferred_visit_time, selected_visit_time, group_size, notes, status, feasibility, suggested_times, admin_comment")
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

  return Response.json(
    {
      request: data,
      allocations: allocationsResponse.data ?? [],
      linkedOrders: ordersResponse.data ?? [],
    },
    { status: 200 }
  );
}
