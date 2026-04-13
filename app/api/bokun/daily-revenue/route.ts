import { NextRequest } from "next/server";
import { searchProductBookings, BokunBooking } from "@/lib/bokun/client";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return Response.json({ error: "date required" }, { status: 400 });

  const [year, month, day] = date.split("-").map(Number);

  try {
    const result = await searchProductBookings({
      startDate: { year, month, day },
      endDate: { year, month, day },
      pageSize: 100,
      statuses: ["CONFIRMED"],
    });

    const bookings = result.results ?? [];

    const pax_count = bookings.reduce(
      (s: number, b: BokunBooking) => s + (b.fields?.totalParticipants ?? 0),
      0
    );

    const confirmed_revenue_isk = Math.round(
      bookings.reduce(
        (s: number, b: BokunBooking) => s + (b.totalPrice ?? 0),
        0
      )
    );

    const agency_breakdown = bookings.reduce(
      (acc: Record<string, number>, b: BokunBooking) => {
        const agency = b.agent?.title ?? b.seller?.title ?? b.channel?.title ?? "Direct";
        acc[agency] = (acc[agency] ?? 0) + (b.fields?.totalParticipants ?? 0);
        return acc;
      },
      {}
    );

    return Response.json({
      date,
      booking_count: bookings.length,
      pax_count,
      confirmed_revenue_isk,
      agency_breakdown,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({
      error: message,
      booking_count: 0,
      pax_count: 0,
      confirmed_revenue_isk: 0,
      agency_breakdown: {},
    });
  }
}
