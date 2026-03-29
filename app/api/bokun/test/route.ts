import { NextResponse } from "next/server";
import {
  testConnection,
  searchProductBookings,
  getUpcomingAvailability,
} from "@/lib/bokun/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conn = await testConnection();

    // Fetch recent bookings sample + upcoming availability
    const [bookings, availability] = await Promise.all([
      searchProductBookings({ page: 1, pageSize: 5 }),
      getUpcomingAvailability(775694, 7),
    ]);

    // Summarize
    const bookingSummary = bookings.results.map((b) => ({
      code: b.confirmationCode,
      status: b.status,
      channel: b.channelId,
      customer: `${b.customer.firstName} ${b.customer.lastName}`,
      nationality: b.customer.nationality,
      pax: b.fields.totalParticipants,
      revenue: `${b.totalPrice} ${b.currency}`,
      visitDate: new Date(b.startDate).toISOString().slice(0, 10),
      bookedAt: new Date(b.creationDate).toISOString(),
      rate: b.rateTitle,
    }));

    return NextResponse.json({
      status: "connected",
      suppliers: conn.suppliers,
      totalBookings: bookings.totalHits,
      recentBookings: bookingSummary,
      upcomingAvailability: availability.map((a) => ({
        date: a.localizedDate,
        booked: a.bookedParticipants,
        available: a.unlimitedAvailability ? "unlimited" : a.availabilityCount,
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
