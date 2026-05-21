import { NextRequest } from "next/server";
import { listCalendarEvents } from "@/lib/google-calendar";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "info@vikingworld.is";

export async function GET(req: NextRequest) {
  const year = req.nextUrl.searchParams.get("year");
  const month = req.nextUrl.searchParams.get("month");
  if (!year || !month) {
    return Response.json({ error: "year and month required" }, { status: 400 });
  }

  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const timeMin = new Date(y, m - 1, 1, 0, 0, 0).toISOString();
  const timeMax = new Date(y, m, 0, 23, 59, 59).toISOString();

  try {
    const events = await listCalendarEvents(CALENDAR_ID, timeMin, timeMax);

    let total_pax = 0;
    for (const e of events) {
      const summary = (e.summary as string) ?? "";
      const paxMatch = summary.match(/(\d{1,4})\s*\+?\s*(\d{1,4})?\s*pax/i);
      if (paxMatch) {
        total_pax += parseInt(paxMatch[1]);
        if (paxMatch[2]) total_pax += parseInt(paxMatch[2]);
      }
    }

    return Response.json({ year: y, month: m, total_pax, event_count: events.length });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: message, year: y, month: m, total_pax: 0, event_count: 0 });
  }
}
