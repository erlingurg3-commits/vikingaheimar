import { supabase } from "@/lib/supabase";
import {
  canAcceptGroupRequest,
  getGroupCapacitySnapshot,
  suggestAlternativeTimes,
} from "@/lib/group-requests";

type GroupRequestAction = "approve" | "decline" | "select_alternative";

type GroupRequestInsertBody = {
  agent_company?: unknown;
  agent_name?: unknown;
  customer_email?: unknown;
  visit_date?: unknown;
  visit_time?: unknown;
  group_size?: unknown;
  notes?: unknown;
};

type GroupRequestPatchBody = {
  action?: unknown;
  orderId?: unknown;
  selectedTime?: unknown;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNonNegativeInt(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.floor(parsed);
}

function isValidEmail(value: string): boolean {
  return /.+@.+\..+/.test(value);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const visitDate = url.searchParams.get("visit_date") ?? "";
  const capacityMode = url.searchParams.get("capacity") === "1";
  const groupRequestsMode = url.searchParams.get("groupRequests") === "1";

  if (capacityMode) {
    if (!visitDate) {
      return new Response(JSON.stringify({ message: "visit_date is required" }), { status: 400 });
    }

    try {
      const snapshot = await getGroupCapacitySnapshot(supabase, visitDate);
      return new Response(JSON.stringify(snapshot), { status: 200 });
    } catch {
      return new Response(JSON.stringify({ message: "Unable to load capacity" }), { status: 500 });
    }
  }

  if (groupRequestsMode) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, created_at, agent_company, agent_name, customer_email, visit_date, visit_time, group_size, admin_status, admin_decision_reason, suggested_times, status, request_type"
      )
      .eq("request_type", "group")
      .in("admin_status", ["pending_admin_review", "suggested_alternatives"])
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data ?? []), { status: 200 });
  }

  return new Response(JSON.stringify({ message: "Invalid query" }), { status: 400 });
}

export async function POST(req: Request) {
  const body = (await req.json()) as GroupRequestInsertBody;

  const agentCompany = asTrimmedString(body.agent_company);
  const agentName = asTrimmedString(body.agent_name);
  const customerEmail = asTrimmedString(body.customer_email).toLowerCase();
  const visitDate = asTrimmedString(body.visit_date);
  const visitTime = asTrimmedString(body.visit_time);
  const groupSize = asNonNegativeInt(body.group_size);
  const notes = asTrimmedString(body.notes);

  if (!agentCompany || !agentName || !customerEmail || !visitDate || !visitTime || groupSize < 1 || groupSize > 500) {
    return new Response(JSON.stringify({ message: "Missing or invalid required fields" }), { status: 400 });
  }

  if (!isValidEmail(customerEmail)) {
    return new Response(JSON.stringify({ message: "Invalid contact email" }), { status: 400 });
  }

  try {
    const snapshot = await getGroupCapacitySnapshot(supabase, visitDate);
    const availability = canAcceptGroupRequest(snapshot.remainingByTime, visitTime, groupSize);

    if (availability.allowed) {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          request_type: "group",
          agent_company: agentCompany,
          agent_name: agentName,
          customer_email: customerEmail,
          visit_date: visitDate,
          visit_time: visitTime,
          group_size: groupSize,
          notes: notes || null,
          ticket_general: 0,
          ticket_youth: 0,
          ticket_family: 0,
          total_amount: 0,
          status: "pending",
          source: "travel_agent",
          admin_status: "pending_admin_review",
          admin_decision_reason: null,
          suggested_times: null,
        })
        .select("id, visit_time")
        .single();

      if (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
      }

      return new Response(
        JSON.stringify({
          outcome: "pending_admin_review",
          referenceId: data?.id ?? null,
          visitTime: data?.visit_time ?? visitTime,
        }),
        { status: 200 }
      );
    }

    const suggestedTimes = suggestAlternativeTimes(visitTime, snapshot.remainingByTime, groupSize, 5);

    const { data, error } = await supabase
      .from("orders")
      .insert({
        request_type: "group",
        agent_company: agentCompany,
        agent_name: agentName,
        customer_email: customerEmail,
        visit_date: visitDate,
        visit_time: visitTime,
        group_size: groupSize,
        notes: notes || null,
        ticket_general: 0,
        ticket_youth: 0,
        ticket_family: 0,
        total_amount: 0,
        status: "pending",
        source: "travel_agent",
        admin_status: "suggested_alternatives",
        admin_decision_reason: "Requested time unavailable",
        suggested_times: suggestedTimes,
      })
      .select("id")
      .single();

    if (error) {
      return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        outcome: "suggested_alternatives",
        referenceId: data?.id ?? null,
        suggestedTimes,
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ message: "Unable to process group request" }), { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as GroupRequestPatchBody;

  const action = asTrimmedString(body.action) as GroupRequestAction;
  const orderId = asTrimmedString(body.orderId);
  const selectedTime = asTrimmedString(body.selectedTime);

  if (!orderId) {
    return new Response(JSON.stringify({ message: "orderId is required" }), { status: 400 });
  }

  const { data: existingRow, error: fetchError } = await supabase
    .from("orders")
    .select("id, visit_date, visit_time, group_size, request_type, source")
    .eq("id", orderId)
    .single();

  if (fetchError || !existingRow) {
    return new Response(JSON.stringify({ message: "Group request not found" }), { status: 404 });
  }

  const groupSize = asNonNegativeInt(existingRow.group_size);

  if (action === "decline") {
    const { error } = await supabase
      .from("orders")
      .update({
        admin_status: "declined",
        status: "cancelled",
        admin_decision_reason: "Declined by admin",
      })
      .eq("id", orderId);

    if (error) {
      return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ outcome: "declined", referenceId: orderId }), { status: 200 });
  }

  if (action !== "approve" && action !== "select_alternative") {
    return new Response(JSON.stringify({ message: "Invalid action" }), { status: 400 });
  }

  const targetTime = action === "select_alternative" ? selectedTime : asTrimmedString(existingRow.visit_time);

  if (!targetTime) {
    return new Response(JSON.stringify({ message: "selectedTime is required" }), { status: 400 });
  }

  try {
    const snapshot = await getGroupCapacitySnapshot(supabase, asTrimmedString(existingRow.visit_date), orderId);
    const availability = canAcceptGroupRequest(snapshot.remainingByTime, targetTime, groupSize);

    if (availability.allowed) {
      const updatePayload =
        action === "approve"
          ? {
              admin_status: "approved",
              status: "confirmed",
              admin_decision_reason: "Approved by admin",
              suggested_times: null,
            }
          : {
              visit_time: targetTime,
              admin_status: "pending_admin_review",
              admin_decision_reason: "Alternative selected by agency",
              suggested_times: null,
            };

      const { error } = await supabase.from("orders").update(updatePayload).eq("id", orderId);

      if (error) {
        return new Response(JSON.stringify({ message: error.message }), { status: 500 });
      }

      return new Response(
        JSON.stringify({
          outcome: action === "approve" ? "approved" : "pending_admin_review",
          referenceId: orderId,
          visitTime: targetTime,
        }),
        { status: 200 }
      );
    }

    const suggestedTimes = suggestAlternativeTimes(targetTime, snapshot.remainingByTime, groupSize, 5);

    const { error } = await supabase
      .from("orders")
      .update({
        admin_status: "suggested_alternatives",
        status: "pending",
        admin_decision_reason:
          action === "approve"
            ? "Slot became unavailable; alternatives suggested"
            : "Requested time unavailable",
        suggested_times: suggestedTimes,
      })
      .eq("id", orderId);

    if (error) {
      return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({
        outcome: "suggested_alternatives",
        referenceId: orderId,
        suggestedTimes,
        message: "Capacity full for selected time",
      }),
      { status: 409 }
    );
  } catch {
    return new Response(JSON.stringify({ message: "Unable to update group request" }), { status: 500 });
  }
}
