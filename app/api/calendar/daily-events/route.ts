import { NextRequest } from "next/server";
import { listCalendarEvents } from "@/lib/google-calendar";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "info@vikingworld.is";
const AGENCIES = [
  "Atlantik",
  "TTT",
  "ACIS",
  "EF Tours",
  "EF Cultural",
  "Premier World",
  "Lorentson",
  "Gray Line",
  "Iceland Travel",
];

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  if (!date) return Response.json({ error: "date required" }, { status: 400 });

  const timeMin = new Date(`${date}T00:00:00`).toISOString();
  const timeMax = new Date(`${date}T23:59:59`).toISOString();

  try {
    const events = await listCalendarEvents(CALENDAR_ID, timeMin, timeMax);

    const parsed = events.map((e: Record<string, unknown>) => {
      const summary = (e.summary as string) ?? "";
      const paxMatch = summary.match(/(\d+)\s*\+?\s*(\d+)?\s*pax/i);
      const main = paxMatch ? parseInt(paxMatch[1]) : 0;
      const extra = paxMatch?.[2] ? parseInt(paxMatch[2]) : 0;
      const pax = main + extra;
      const agency =
        AGENCIES.find((a) =>
          summary.toLowerCase().includes(a.toLowerCase())
        ) ?? "Direct";
      const start = e.start as { dateTime?: string; date?: string } | undefined;
      return { summary, start: start?.dateTime ?? start?.date, pax, agency };
    });

    const total_pax = parsed.reduce((s: number, e: { pax: number }) => s + e.pax, 0);

    return Response.json({
      date,
      event_count: events.length,
      total_pax,
      events: parsed,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({
      error: message,
      event_count: 0,
      total_pax: 0,
      events: [],
    });
  }
}
