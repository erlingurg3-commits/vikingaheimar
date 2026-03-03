import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  checkGroupFeasibility,
  PUBLIC_HOURLY_SLOTS,
  toUtcDateAndHour,
} from "@/lib/capacity/checkGroupFeasibility";
import { resolveAgency } from "@/lib/orders";

const createGroupRequestSchema = z
  .object({
    agent_id: z.string().uuid().optional(),
    agent_company: z.string().trim().min(1).optional(),
    agency_company: z.string().trim().min(1).optional(),
    agent_name: z.string().trim().min(1).optional(),
    agency_name: z.string().trim().min(1).optional(),
    agent_email: z.string().trim().email().optional(),
    agency_email: z.string().trim().email().optional(),
    agent_phone: z.string().trim().max(64).optional(),
    preferred_start: z.string().min(1).optional(),
    visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    visit_time: z.string().regex(/^\d{1,2}:\d{2}$/).optional(),
    duration_minutes: z.coerce.number().int().min(15).max(12 * 60).optional(),
    pax: z.coerce.number().int().min(1).max(500).optional(),
    group_size: z.coerce.number().int().min(1).max(500).optional(),
    notes: z.string().trim().max(2000).optional(),
    mock_instant_booking: z.boolean().optional(),
  })
  .refine((input) => Boolean(input.agent_id || input.agent_company || input.agency_company), {
    message: "agent_id or agent_company is required",
    path: ["agent_company"],
  })
  .refine((input) => Boolean(input.agent_email || input.agency_email), {
    message: "agent_email is required",
    path: ["agent_email"],
  })
  .refine(
    (input) => Boolean(input.preferred_start || (input.visit_date && input.visit_time)),
    {
      message: "preferred_start or visit_date + visit_time is required",
      path: ["preferred_start"],
    }
  )
  .refine((input) => Boolean(input.pax || input.group_size), {
    message: "pax is required",
    path: ["pax"],
  });

const selectAlternativeSchema = z.object({
  request_id: z.string().uuid(),
  selected_visit_time: z.string().min(1),
});

const capacityQuerySchema = z.object({
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pax: z.coerce.number().int().min(1).max(500).optional(),
  group_size: z.coerce.number().int().min(1).max(500).optional(),
});

function formatIsoFromDateAndHour(visitDate: string, hour: string) {
  return `${visitDate}T${hour}:00.000Z`;
}

const MOCK_GROUP_TICKET_PRICE_ISK = 3800;

function normalizeHour(value: string) {
  const { hour } = toUtcDateAndHour(value);
  return hour;
}

function getVisitDateFromPreferredStart(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}-${String(
    parsed.getUTCDate()
  ).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = capacityQuerySchema.safeParse({
    visit_date: url.searchParams.get("visit_date"),
    pax: url.searchParams.get("pax") ?? undefined,
    group_size: url.searchParams.get("group_size") ?? undefined,
  });

  if (!parsed.success) {
    return Response.json(
      {
        message: "Invalid query parameters",
        issues: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    const requestedPax = parsed.data.pax ?? parsed.data.group_size ?? 1;
    const feasibility = await checkGroupFeasibility(supabaseAdmin, {
      visitDate: parsed.data.visit_date,
      preferredHour: "12:00",
      pax: requestedPax,
    });

    const slots = PUBLIC_HOURLY_SLOTS.map((slot) => {
      const remaining = feasibility.remainingByHour[slot] ?? 50;
      return {
        time: slot,
        remaining,
        canFit: remaining >= requestedPax,
      };
    });

    return Response.json(
      {
        capacity: 50,
        slots,
        remainingByTime: feasibility.remainingByHour,
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ message: "Unable to check capacity" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const parsed = createGroupRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      {
        message: "Invalid request payload",
        issues: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const agentCompany = (input.agent_company ?? input.agency_company ?? "").trim();
  const agentName = (input.agent_name ?? input.agency_name ?? "").trim();
  const agentEmail = (input.agent_email ?? input.agency_email ?? "").trim().toLowerCase();
  const requestedPax = Number(input.pax ?? input.group_size ?? 0);
  const durationMinutes = Number(input.duration_minutes ?? 60);
  const shouldCreateMockBooking = input.mock_instant_booking !== false;

  let preferredStart = input.preferred_start ?? "";
  if (!preferredStart && input.visit_date && input.visit_time) {
    const normalizedHour = normalizeHour(input.visit_time);
    preferredStart = formatIsoFromDateAndHour(input.visit_date, normalizedHour);
  }

  const preferred = toUtcDateAndHour(preferredStart);
  if (!preferred.visitDate || !preferred.hour) {
    return Response.json({ message: "Invalid preferred_start" }, { status: 400 });
  }

  try {
    const feasibility = await checkGroupFeasibility(supabaseAdmin, {
      visitDate: preferred.visitDate,
      preferredHour: preferred.hour,
      pax: requestedPax,
    });

    const status =
      feasibility.feasibility === "feasible"
        ? "pending_admin_review"
        : "suggested_alternatives";

    const suggestedTimes =
      feasibility.feasibility === "feasible"
        ? []
        : feasibility.suggestedTimes.map((time) => formatIsoFromDateAndHour(preferred.visitDate, time));

    const fallbackCompany = agentCompany || "Unspecified agency";
    const resolvedAgentId = input.agent_id
      ? input.agent_id
      : await resolveAgency(supabaseAdmin, fallbackCompany, {
          autoCreate: true,
          contact_name: agentName,
          email: agentEmail,
        });

    const { data, error } = await supabaseAdmin
      .from("group_requests")
      .insert({
        agent_id: resolvedAgentId ?? null,
        agent_company: fallbackCompany,
        agent_name: agentName,
        agent_email: agentEmail,
        agent_phone: input.agent_phone ?? null,
        preferred_start: preferredStart,
        duration_minutes: durationMinutes,
        pax: requestedPax,
        notes: input.notes ?? null,
        status,
        feasibility: feasibility.feasibility,
        feasibility_reason:
          feasibility.feasibility === "feasible"
            ? null
            : `Requested slot unavailable. Remaining at preferred slot: ${feasibility.remainingAtPreferredHour}`,
        suggested_times: suggestedTimes,
      })
      .select("id, status, preferred_start, suggested_times")
      .single();

    if (error) {
      return Response.json({ message: error.message }, { status: 500 });
    }

    let mockBookingId: string | null = null;

    if (shouldCreateMockBooking && status === "pending_admin_review") {
      const totalAmount = requestedPax * MOCK_GROUP_TICKET_PRICE_ISK;

      const { data: insertedOrder, error: orderError } = await supabaseAdmin
        .from("orders")
        .insert({
          customer_email: agentEmail,
          agent_email: agentEmail,
          agent_id: resolvedAgentId ?? null,
          agent_company: fallbackCompany,
          agent_name: agentName,
          visit_date: preferred.visitDate,
          visit_time: preferred.hour,
          ticket_general: requestedPax,
          ticket_youth: 0,
          ticket_family: 0,
          total_amount: totalAmount,
          status: "confirmed",
          source: "travel_agent",
          source_type: "group_request",
          source_id: data.id,
          request_type: "group",
          group_size: requestedPax,
          notes: input.notes ?? null,
          admin_status: "approved",
          admin_decision_reason: "Auto-confirmed mock group booking",
        })
        .select("id")
        .single();

      if (!orderError) {
        mockBookingId = insertedOrder?.id ?? null;

        await supabaseAdmin
          .from("group_requests")
          .update({
            status: "approved",
            admin_comment: "Auto-confirmed mock group booking",
          })
          .eq("id", data.id);
      }
    }

    return Response.json(
      {
        requestId: data.id,
        outcome: mockBookingId ? "approved_mock_booking" : data.status,
        preferredStart: data.preferred_start,
        suggestedTimes: data.suggested_times ?? [],
        mockBookingId,
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ message: "Unable to submit group request" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const payload = await req.json().catch(() => ({}));
  const parsed = selectAlternativeSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      {
        message: "Invalid request payload",
        issues: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { request_id: requestId, selected_visit_time: selectedVisitTime } = parsed.data;

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("group_requests")
    .select("id, preferred_start, pax, status")
    .eq("id", requestId)
    .single();

  if (existingError || !existing) {
    return Response.json({ message: "Group request not found" }, { status: 404 });
  }

  const currentVisitDate = getVisitDateFromPreferredStart(existing.preferred_start);
  const selectedParsed = toUtcDateAndHour(selectedVisitTime);

  const targetVisitDate = selectedParsed.visitDate || currentVisitDate;
  const targetHour = selectedParsed.hour;

  if (!targetVisitDate || !targetHour) {
    return Response.json({ message: "Invalid selected_visit_time" }, { status: 400 });
  }

  try {
    const feasibility = await checkGroupFeasibility(supabaseAdmin, {
      visitDate: targetVisitDate,
      preferredHour: targetHour,
      pax: Number(existing.pax ?? 0),
    });

    if (feasibility.feasibility !== "feasible") {
      const { error } = await supabaseAdmin
        .from("group_requests")
        .update({
          status: "suggested_alternatives",
          feasibility: "not_feasible",
          feasibility_reason: "Selected alternative is no longer feasible",
          suggested_times: feasibility.suggestedTimes.map((time) =>
            formatIsoFromDateAndHour(targetVisitDate, time)
          ),
          admin_comment: "Selected alternative is no longer feasible",
        })
        .eq("id", requestId);

      if (error) {
        return Response.json({ message: error.message }, { status: 500 });
      }

      return Response.json(
        {
          requestId,
          outcome: "suggested_alternatives",
          suggestedTimes: feasibility.suggestedTimes.map((time) =>
            formatIsoFromDateAndHour(targetVisitDate, time)
          ),
          message: "Selected alternative is no longer feasible",
        },
        { status: 409 }
      );
    }

    const nextPreferredStart = formatIsoFromDateAndHour(targetVisitDate, feasibility.preferredHour);

    const { error } = await supabaseAdmin
      .from("group_requests")
      .update({
        preferred_start: nextPreferredStart,
        status: "pending_admin_review",
        feasibility: "feasible",
        feasibility_reason: null,
        suggested_times: [],
        admin_comment: "Alternative selected by agency",
      })
      .eq("id", requestId);

    if (error) {
      return Response.json({ message: error.message }, { status: 500 });
    }

    return Response.json(
      {
        requestId,
        outcome: "pending_admin_review",
        preferredStart: nextPreferredStart,
      },
      { status: 200 }
    );
  } catch {
    return Response.json({ message: "Unable to update request" }, { status: 500 });
  }
}
