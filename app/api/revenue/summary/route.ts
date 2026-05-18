import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { listCalendarEvents } from "@/lib/google-calendar";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "info@vikingworld.is";
const ASSUMED_TICKET_PRICE = 2990;
// ota = Travel Agent / marketplace — shown individually (group agency bookings vary by product)
// web / walkin — aggregated (individual ticket purchases, not interesting at row level)
const INDIVIDUAL_CHANNELS = new Set(["group", "cruise", "school", "ota"]);

function dateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(from + "T00:00:00Z");
  const end = new Date(to + "T00:00:00Z");
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

function extractPax(text: string): number {
  const combined = text.match(/(\d+)\s*\+\s*(\d+)\s*pax/i);
  if (combined) return parseInt(combined[1]) + parseInt(combined[2]);
  const single = text.match(/(\d+)\s*(?:pax|guests?|manns?)/i);
  if (single) return parseInt(single[1]);
  return 0;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const from = params.get("from") ?? today;
  const to = params.get("to") ?? today;
  const source = params.get("source") ?? "all";

  const dates = dateRange(from, to);
  const dailyMap: Record<string, { bokun: number; teya: number; calendar: number }> = {};
  const bokunDetailMap: Record<string, Record<string, { channel: string; product_type: string; pax: number; amount: number; booking_ref: string | null }>> = {};
  const calDetailMap: Record<string, Array<{ title: string; description: string; startTime: string | null; pax: number; amount: number }>> = {};
  for (const d of dates) {
    dailyMap[d] = { bokun: 0, teya: 0, calendar: 0 };
    bokunDetailMap[d] = {};
    calDetailMap[d] = [];
  }

  const streams = {
    bokun: { gross: 0, net: 0, transactions: 0, pax: 0 },
    teya: { gross: 0, net: 0, transactions: 0, fees: 0 },
    calendar: { gross: 0, pax: 0, events: 0 },
  };

  const tasks: Promise<void>[] = [];

  if (source === "all" || source === "teya") {
    tasks.push(
      Promise.resolve(
        supabaseAdmin
          .from("teya_settlements")
          .select("settlement_date, sales, net_amount, fees")
          .gte("settlement_date", from)
          .lte("settlement_date", to)
      ).then(({ data }) => {
          for (const row of data ?? []) {
            const d = row.settlement_date as string;
            streams.teya.gross += (row.sales as number) ?? 0;
            streams.teya.net += (row.net_amount as number) ?? 0;
            streams.teya.fees += (row.fees as number) ?? 0;
            streams.teya.transactions++;
            if (dailyMap[d]) dailyMap[d].teya += (row.sales as number) ?? 0;
          }
        })
        .catch(() => undefined)
    );
  }

  if (source === "all" || source === "bokun") {
    tasks.push(
      (async () => {
        try {
          const { data: dbRows, error: dbError } = await supabaseAdmin
            .from("actual_sales_daily")
            .select("visit_date, revenue_amount, pax, channel, product_type, booking_reference")
            .gte("visit_date", from)
            .lte("visit_date", to);

          if (dbError) return;

          for (const row of dbRows ?? []) {
            const d = row.visit_date as string;
            const amount = Math.round((row.revenue_amount as number) ?? 0);
            const pax = (row.pax as number) ?? 0;
            const channel = (row.channel as string) || "unknown";
            const product_type = (row.product_type as string) || "unknown";
            const booking_ref = (row.booking_reference as string) || null;

            streams.bokun.gross += amount;
            streams.bokun.net += amount;
            streams.bokun.pax += pax;
            streams.bokun.transactions++;

            if (dailyMap[d]) dailyMap[d].bokun += amount;

            if (bokunDetailMap[d]) {
              if (INDIVIDUAL_CHANNELS.has(channel)) {
                const key = booking_ref ?? `${channel}:${product_type}:${amount}:${pax}`;
                bokunDetailMap[d][key] = { channel, product_type, pax, amount, booking_ref };
              } else {
                const key = `${channel}:${product_type}`;
                if (!bokunDetailMap[d][key]) {
                  bokunDetailMap[d][key] = { channel, product_type, pax: 0, amount: 0, booking_ref: null };
                }
                bokunDetailMap[d][key].pax += pax;
                bokunDetailMap[d][key].amount += amount;
              }
            }
          }
        } catch (err) {
          console.error("[revenue/summary] Bokun task error:", err);
        }
      })()
    );
  }

  if (source === "all" || source === "calendar") {
    tasks.push(
      listCalendarEvents(
        CALENDAR_ID,
        new Date(`${from}T00:00:00`).toISOString(),
        new Date(`${to}T23:59:59`).toISOString()
      )
        .then((events) => {
          for (const e of events) {
            const title = (e.summary as string) ?? "";
            const desc = (e.description as string) ?? "";
            const pax = extractPax(title + " " + desc);
            const start = e.start as { dateTime?: string; date?: string } | undefined;
            const startRaw = start?.dateTime ?? start?.date ?? "";
            const d = startRaw.slice(0, 10);
            const startTime = start?.dateTime
              ? new Date(start.dateTime).toLocaleTimeString("is-IS", { hour: "2-digit", minute: "2-digit", timeZone: "Atlantic/Reykjavik" })
              : null;
            const amount = pax * ASSUMED_TICKET_PRICE;
            streams.calendar.gross += amount;
            streams.calendar.pax += pax;
            streams.calendar.events++;
            if (d && dailyMap[d]) {
              dailyMap[d].calendar += amount;
              calDetailMap[d]?.push({ title, description: desc, startTime, pax, amount });
            }
          }
        })
        .catch(() => undefined)
    );
  }

  await Promise.all(tasks);

  return Response.json({
    period: { from, to },
    streams,
    total: {
      gross: streams.bokun.gross + streams.teya.gross + streams.calendar.gross,
      net: streams.bokun.net + streams.teya.net,
    },
    daily: dates.map((date) => ({
      date,
      bokun: dailyMap[date].bokun,
      teya: dailyMap[date].teya,
      calendar: dailyMap[date].calendar,
      total: dailyMap[date].bokun + dailyMap[date].teya + dailyMap[date].calendar,
      bokun_detail: Object.values(bokunDetailMap[date] ?? {}).sort((a, b) => b.amount - a.amount),
      calendar_detail: calDetailMap[date] ?? [],
    })),
  });
}
