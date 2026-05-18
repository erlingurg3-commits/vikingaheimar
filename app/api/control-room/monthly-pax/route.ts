import { listCalendarEvents } from "@/lib/google-calendar";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface CalendarEvent {
  start?: { dateTime?: string; date?: string };
  end?: { dateDateTime?: string; date?: string };
  summary?: string;
  description?: string;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "info@vikingworld.is";

function parsePax(title: string): number {
  if (!title) return 0;
  const m1 = title.match(/(\d{1,4})\s*\+\s*(\d{1,4})\s*pax/i);
  if (m1) return parseInt(m1[1]) + parseInt(m1[2]);
  const m2 = title.match(/(\d{1,4})\s*pax/i);
  if (m2) return parseInt(m2[1]);
  const parts = title.split(";");
  for (const pt of parts) {
    const m3 = pt.trim().match(/^(\d{1,4})$/);
    if (m3) { const n = parseInt(m3[1]); if (n >= 2 && n < 2000) return n; }
  }
  for (const pt of parts) {
    const m4 = pt.trim().match(/^(\d{1,4})\s*\+\s*(\d{1,4})$/);
    if (m4) return parseInt(m4[1]) + parseInt(m4[2]);
  }
  return 0;
}

function isBreakfast(title: string, desc = ""): boolean {
  return /breakfast|morgunverð|morgunmat|morgunfundur/i.test(title + " " + desc);
}

export async function GET() {
  const year = 2026;

  // ── 1. Calendar (always live) ──────────────────────────────────
  const events: CalendarEvent[] = await listCalendarEvents(
    CALENDAR_ID,
    `${year}-01-01T00:00:00Z`,
    `${year}-12-31T23:59:59Z`
  );

  const cal: Record<string, { bf: number; ent: number }> = {};
  for (const ev of events) {
    const mk =
      ev.start?.dateTime?.slice(0, 7) ?? ev.start?.date?.slice(0, 7);
    if (!mk) continue;
    const pax = parsePax(ev.summary ?? "");
    if (pax === 0) continue;
    if (!cal[mk]) cal[mk] = { bf: 0, ent: 0 };
    if (isBreakfast(ev.summary ?? "", ev.description ?? ""))
      cal[mk].bf += pax;
    else cal[mk].ent += pax;
  }

  // ── 2. Bokun individual pax from Supabase actual_sales_daily ───
  const { data: daily } = await supabaseAdmin
    .from("actual_sales_daily")
    .select("visit_date, pax")
    .gte("visit_date", `${year}-01-01`)
    .lte("visit_date", `${year}-12-31`);

  const bokun: Record<string, number> = {};
  for (const row of daily ?? []) {
    const mk = (row.visit_date as string)?.slice(0, 7);
    if (!mk) continue;
    bokun[mk] = (bokun[mk] ?? 0) + (Number(row.pax) || 0);
  }

  // ── 3. Last sync date for Bokun ────────────────────────────────
  const { data: syncMeta } = await supabaseAdmin
    .from("actual_sales_monthly")
    .select("last_aggregated")
    .eq("year", year)
    .order("last_aggregated", { ascending: false })
    .limit(1);

  const bokunLastSync = syncMeta?.[0]?.last_aggregated ?? null;

  return Response.json({ cal, bokun, bokunLastSync, calEventCount: events.length });
}
