import { NextRequest } from "next/server";
import { fetchBookingsByVisitDate, BokunBooking } from "@/lib/bokun/client";

export const dynamic = "force-dynamic";

function formatTime(ms: number | null | undefined): string {
  if (!ms) return "00:00";
  return new Intl.DateTimeFormat("is-IS", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Atlantic/Reykjavik",
  }).format(new Date(ms));
}

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return Response.json({ error: "date required" }, { status: 400 });

  try {
    const visitBookings = await fetchBookingsByVisitDate(date);

    const bookings = visitBookings.map((b: BokunBooking) => ({
      confirmationCode: b.confirmationCode ?? "",
      customer: {
        name:        `${b.customer?.firstName ?? ""} ${b.customer?.lastName ?? ""}`.trim() || null,
        phone:       b.customer?.phoneNumber ?? null,
        email:       b.customer?.email ?? null,
        nationality: b.customer?.nationality ?? null,
      },
      startTime:    formatTime(b.startDateTime ?? b.startDate),
      product:      b.product?.title ?? "",
      channelTitle: b.channel?.title ?? b.seller?.title ?? "",
      agent:        b.agent?.title ?? null,
      pax:          b.fields?.totalParticipants ?? 0,
      paxBreakdown: (b.fields?.priceCategoryBookings ?? []).map((pc) => ({
        category: pc.pricingCategory?.title ?? "",
        count:    pc.passengers ?? 0,
      })),
      amount:   Math.round(b.totalPrice ?? 0),
      currency: b.currency ?? "ISK",
    }));

    const totalPax = bookings.reduce((s, b) => s + b.pax, 0);

    return Response.json({ date, totalPax, bookingCount: bookings.length, bookings });
  } catch (e) {
    return Response.json({ error: String(e), bookings: [] }, { status: 500 });
  }
}
