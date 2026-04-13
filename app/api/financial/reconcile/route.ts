import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return Response.json({ error: "date required" }, { status: 400 });

  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [calRes, bokRes] = await Promise.all([
    fetch(`${base}/api/calendar/daily-events?date=${date}`)
      .then((r) => r.json())
      .catch(() => ({ event_count: 0, total_pax: 0, events: [] })),
    fetch(`${base}/api/bokun/daily-revenue?date=${date}`)
      .then((r) => r.json())
      .catch(() => ({
        booking_count: 0,
        pax_count: 0,
        confirmed_revenue_isk: 0,
        agency_breakdown: {},
      })),
  ]);

  const paxDelta = (bokRes.pax_count ?? 0) - (calRes.total_pax ?? 0);

  return Response.json({
    date,
    confirmed_revenue_isk: bokRes.confirmed_revenue_isk ?? 0,
    pax_count: bokRes.pax_count ?? 0,
    booking_count: bokRes.booking_count ?? 0,
    agency_breakdown: bokRes.agency_breakdown ?? {},
    calendar_event_count: calRes.event_count ?? 0,
    calendar_pax: calRes.total_pax ?? 0,
    reconciliation: {
      in_sync: Math.abs(paxDelta) <= 2,
      pax_delta: paxDelta,
      flag:
        Math.abs(paxDelta) > 10
          ? "LARGE_DISCREPANCY"
          : Math.abs(paxDelta) > 2
            ? "MINOR_MISMATCH"
            : "OK",
    },
  });
}
