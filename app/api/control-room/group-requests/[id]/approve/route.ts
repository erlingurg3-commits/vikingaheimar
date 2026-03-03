import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkGroupFeasibility, toUtcDateAndHour } from "@/lib/capacity/checkGroupFeasibility";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  admin_comment: z.string().trim().max(1000).optional(),
  start_time: z.string().min(1).optional(),
  paxSplit: z.array(z.number().int().positive()).optional(),
  reviewed_by: z.string().trim().max(255).optional(),
});

const MOCK_GROUP_TICKET_PRICE_ISK = 3800;

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);

  if (!parsedParams.success) {
    return Response.json({ message: "Invalid request id" }, { status: 400 });
  }

  const payload = await req.json().catch(() => ({}));
  const parsedBody = bodySchema.safeParse(payload);

  if (!parsedBody.success) {
    return Response.json(
      { message: "Invalid request body", issues: parsedBody.error.flatten() },
      { status: 400 }
    );
  }

  const requestId = parsedParams.data.id;

  const { data: groupRequest, error: fetchError } = await supabaseAdmin
    .from("group_requests")
    .select("id, preferred_start, pax, status, agent_id, agent_company, agent_name, agent_email, customer_email")
    .eq("id", requestId)
    .single();

  if (fetchError || !groupRequest) {
    return Response.json({ message: "Group request not found" }, { status: 404 });
  }

  if (groupRequest.status === "approved") {
    return Response.json({ message: "Group request already approved" }, { status: 409 });
  }

  const derivedStart = toUtcDateAndHour(
    parsedBody.data.start_time ||
      String(groupRequest.preferred_start)
  );

  const fallbackStart = toUtcDateAndHour(String(groupRequest.preferred_start));
  const targetDate = derivedStart.visitDate || fallbackStart.visitDate;
  const targetTime = derivedStart.hour || fallbackStart.hour;

  if (!targetDate || !targetTime) {
    return Response.json({ message: "Unable to resolve selected start time" }, { status: 400 });
  }

  try {
    const requestedPax = Number(groupRequest.pax ?? 0);

    const feasibility = await checkGroupFeasibility(supabaseAdmin, {
      visitDate: targetDate,
      preferredHour: targetTime,
      pax: requestedPax,
    });

    if (feasibility.feasibility !== "feasible") {
      await supabaseAdmin
        .from("group_requests")
        .update({
          status: "suggested_alternatives",
          feasibility: "not_feasible",
          suggested_times: feasibility.suggestedTimes,
          admin_comment:
            "Slot became unavailable; alternatives suggested",
          reviewed_by: parsedBody.data.reviewed_by ?? "control-room",
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      return Response.json(
        {
          message: "Slot no longer feasible",
          outcome: "suggested_alternatives",
          suggestedTimes: feasibility.suggestedTimes,
        },
        { status: 409 }
      );
    }

    const split = parsedBody.data.paxSplit;
    const allocationsToCreate =
      Array.isArray(split) && split.length > 0
        ? split
        : [requestedPax];

    const totalSplitPax = allocationsToCreate.reduce((sum, value) => sum + value, 0);
    if (totalSplitPax !== requestedPax) {
      return Response.json(
        { message: "paxSplit total must equal request pax" },
        { status: 400 }
      );
    }

    const baseHour = Number(targetTime.split(":")[0]);
    const allocationRows = allocationsToCreate.map((pax, index) => ({
      group_request_id: requestId,
      visit_date: targetDate,
      visit_time: `${String((baseHour + index) % 24).padStart(2, "0")}:00`,
      pax,
      status: "active",
    }));

    const { data: allocationRowsData, error: allocationError } = await supabaseAdmin
      .from("group_request_allocations")
      .insert(allocationRows)
      .select("id");

    if (allocationError || !allocationRowsData) {
      return Response.json({ message: allocationError?.message ?? "Unable to allocate capacity" }, { status: 500 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_email: groupRequest.customer_email ?? groupRequest.agent_email,
        agent_email: groupRequest.agent_email ?? groupRequest.customer_email,
        agent_id: groupRequest.agent_id,
        agent_company: groupRequest.agent_company,
        agent_name: groupRequest.agent_name,
        visit_date: targetDate,
        visit_time: targetTime,
        ticket_general: requestedPax,
        ticket_youth: 0,
        ticket_family: 0,
        total_amount: requestedPax * MOCK_GROUP_TICKET_PRICE_ISK,
        status: "confirmed",
        source: "travel_agent",
        source_type: "group_request",
        source_id: requestId,
        request_type: "group",
        group_size: Number(groupRequest.pax ?? 0),
        admin_status: "approved",
        admin_decision_reason: parsedBody.data.admin_comment || "Approved by admin",
      })
      .select("id")
      .single();

    if (orderError) {
      await supabaseAdmin
        .from("group_request_allocations")
        .update({ status: "released", released_at: new Date().toISOString() })
        .eq("group_request_id", requestId)
        .eq("status", "active");

      return Response.json({ message: orderError.message }, { status: 500 });
    }

    const { error: updateError } = await supabaseAdmin
      .from("group_requests")
      .update({
        status: "approved",
        feasibility: "feasible",
        preferred_start: `${targetDate}T${targetTime}:00.000Z`,
        admin_comment: parsedBody.data.admin_comment || "Approved by admin",
        reviewed_by: parsedBody.data.reviewed_by ?? "control-room",
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        suggested_times: [],
      })
      .eq("id", requestId);

    if (updateError) {
      return Response.json({ message: updateError.message }, { status: 500 });
    }

    return Response.json(
      {
        message: "Group request approved",
        requestId,
        orderId: order.id,
        allocationIds: allocationRowsData.map((row) => row.id),
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ message: "Unable to approve group request" }, { status: 500 });
  }
}
