import { supabase } from "@/lib/supabase";
import { HOURLY_CAP } from "@/lib/capacity";
import { createStandardOrder } from "@/lib/orders";

type AnyRecord = Record<string, unknown>;

function asNonNegativeInt(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.floor(parsed);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as AnyRecord;

  const result = await createStandardOrder(supabase, {
    customer_email: asString(body.customer_email),
    visit_date: asString(body.visit_date),
    visit_time: asString(body.visit_time),
    ticket_general: asNonNegativeInt(body.ticket_general),
    ticket_youth: asNonNegativeInt(body.ticket_youth),
    ticket_family: asNonNegativeInt(body.ticket_family),
    total_amount: asNonNegativeInt(body.total_amount),
    agent_id: asString(body.agent_id) || null,
    agent_company: asString(body.agent_company) || null,
    status: asString(body.status) || "confirmed",
  });

  if (result.error) {
    const status = result.error.includes("capacity") ? 409 : 400;
    return Response.json({ message: result.error }, { status });
  }

  return Response.json(
    {
      success: true,
      bookingId: result.data?.id ?? null,
      order: result.data,
    },
    { status: 200 }
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const visitDate = url.searchParams.get("visit_date");
  const capacityMode = url.searchParams.get("capacity");

  if (visitDate && capacityMode === "1") {
    const { data, error } = await supabase
      .from("orders")
      .select("visit_time, status, ticket_general, ticket_youth, ticket_family")
      .eq("visit_date", visitDate)
      .in("status", ["pending", "confirmed"]);

    if (error) {
      return Response.json({ message: error.message }, { status: 500 });
    }

    const usedByTime = (data ?? []).reduce<Record<string, number>>((acc, row) => {
      const visitTime = typeof row.visit_time === "string" ? row.visit_time : "";
      if (!visitTime) {
        return acc;
      }

      acc[visitTime] =
        (acc[visitTime] ?? 0) +
        asNonNegativeInt(row.ticket_general) +
        asNonNegativeInt(row.ticket_youth) +
        asNonNegativeInt(row.ticket_family);

      return acc;
    }, {});

    const remainingByTime = Object.fromEntries(
      Object.entries(usedByTime).map(([time, used]) => [time, Math.max(0, HOURLY_CAP - used)])
    );

    return Response.json(
      {
        capacity: HOURLY_CAP,
        remainingByTime,
      },
      { status: 200 }
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, created_at, customer_email, agent_id, agent_name, agent_company, visit_date, visit_time, ticket_general, ticket_youth, ticket_family, total_tickets, total_amount, status, source, source_type, source_id"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 200 });
}
