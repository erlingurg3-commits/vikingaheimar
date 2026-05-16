import { NextRequest } from "next/server";
import * as XLSX from "xlsx";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { listCalendarEvents } from "@/lib/google-calendar";

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "info@vikingworld.is";
const ASSUMED_TICKET_PRICE = 2990;

function extractPax(text: string): number {
  const combined = text.match(/(\d+)\s*\+\s*(\d+)\s*pax/i);
  if (combined) return parseInt(combined[1]) + parseInt(combined[2]);
  const single = text.match(/(\d+)\s*(?:pax|guests?|manns?)/i);
  if (single) return parseInt(single[1]);
  return 0;
}

function iskCell(n: number) {
  return { v: n, t: "n", z: '#,##0 "kr"' };
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const from = params.get("from") ?? today;
  const to = params.get("to") ?? today;

  // Fetch all data sources in parallel
  const [teyaResult, bokunRows, calendarEvents] = await Promise.all([
    supabaseAdmin
      .from("teya_settlements")
      .select("*")
      .gte("settlement_date", from)
      .lte("settlement_date", to)
      .order("settlement_date")
      .then(({ data }) => data ?? [])
      .catch(() => []),

    supabaseAdmin
      .from("actual_sales_daily")
      .select("visit_date, revenue_amount, pax, channel, product_type, booking_reference")
      .gte("visit_date", from)
      .lte("visit_date", to)
      .order("visit_date")
      .then(({ data }) => data ?? [])
      .catch(() => []),

    listCalendarEvents(
      CALENDAR_ID,
      new Date(`${from}T00:00:00`).toISOString(),
      new Date(`${to}T23:59:59`).toISOString()
    ).catch(() => []),
  ]);

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ─────────────────────────────────────────────
  const bokunGross = Math.round(bokunRows.reduce((s, r) => s + ((r.revenue_amount as number) ?? 0), 0));
  const bokunPax = bokunRows.reduce((s, r) => s + ((r.pax as number) ?? 0), 0);
  const teyaGross = teyaResult.reduce((s, r) => s + ((r.sales as number) ?? 0), 0);
  const teyaNet = teyaResult.reduce((s, r) => s + ((r.net_amount as number) ?? 0), 0);
  const teyaFees = teyaResult.reduce((s, r) => s + ((r.fees as number) ?? 0), 0);
  const calPax = calendarEvents.reduce((s, e) => {
    const summary = (e.summary as string) ?? "";
    const desc = (e.description as string) ?? "";
    return s + extractPax(summary + " " + desc);
  }, 0);
  const calGross = calPax * ASSUMED_TICKET_PRICE;
  const totalGross = bokunGross + teyaGross + calGross;
  const totalNet = bokunGross + teyaNet;

  const summaryData = [
    [`Revenue Intelligence Export — ${from} to ${to}`],
    [],
    ["Stream", "Gross (ISK)", "Net (ISK)", "Transactions / Events", "Notes"],
    ["Bokun", bokunGross, bokunGross, bokunRows.length, `${bokunPax} pax · synced from actual_sales_daily`],
    ["Teya", teyaGross, teyaNet, teyaResult.length, `Fees: ${teyaFees} kr`],
    ["Calendar (Groups)", calGross, "", calendarEvents.length, `${calPax} pax × ${ASSUMED_TICKET_PRICE} kr`],
    [],
    ["TOTAL", totalGross, totalNet, "", ""],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 22 }, { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // ── Sheet 2: Teya ─────────────────────────────────────────────────
  const teyaHeaders = [
    "MID", "Contract ID", "Contract Name", "Settlement Date", "Currency",
    "Status", "Sales (ISK)", "Refunds (ISK)", "Chargebacks (ISK)",
    "Fees (ISK)", "Transferred (ISK)", "Net Amount (ISK)",
  ];
  const teyaRows = teyaResult.map((r) => [
    r.mid, r.contract_id, r.contract_name, r.settlement_date, r.currency,
    r.status,
    iskCell(r.sales ?? 0),
    iskCell(r.refunds ?? 0),
    iskCell(r.chargebacks ?? 0),
    iskCell(r.fees ?? 0),
    iskCell(r.transferred ?? 0),
    iskCell(r.net_amount ?? 0),
  ]);
  const wsTeya = XLSX.utils.aoa_to_sheet([teyaHeaders, ...teyaRows]);
  wsTeya["!cols"] = [
    { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 10 },
    { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTeya, "Teya");

  // ── Sheet 3: Bokun ────────────────────────────────────────────────
  const bokunHeaders = [
    "Visit Date", "Booking Reference", "Channel", "Product Type", "Pax", "Revenue (ISK)",
  ];
  const bokunSheetRows = bokunRows.map((r) => [
    r.visit_date,
    r.booking_reference ?? "",
    r.channel ?? "",
    r.product_type ?? "",
    r.pax ?? 0,
    iskCell(Math.round((r.revenue_amount as number) ?? 0)),
  ]);
  const wsBokun = XLSX.utils.aoa_to_sheet([bokunHeaders, ...bokunSheetRows]);
  wsBokun["!cols"] = [
    { wch: 12 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 6 }, { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsBokun, "Bokun");

  // ── Sheet 4: Calendar ─────────────────────────────────────────────
  const calHeaders = ["Date", "Event Title", "Pax Extracted", "Est. Revenue (ISK)"];
  const calRows = calendarEvents.map((e) => {
    const summary = (e.summary as string) ?? "";
    const desc = (e.description as string) ?? "";
    const pax = extractPax(summary + " " + desc);
    const start = e.start as { dateTime?: string; date?: string } | undefined;
    const date = (start?.dateTime ?? start?.date ?? "").slice(0, 10);
    return [date, summary, pax, iskCell(pax * ASSUMED_TICKET_PRICE)];
  });
  const wsCal = XLSX.utils.aoa_to_sheet([calHeaders, ...calRows]);
  wsCal["!cols"] = [{ wch: 12 }, { wch: 40 }, { wch: 14 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsCal, "Calendar");

  const buf: Buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="vikingworld-revenue-${today}.xlsx"`,
    },
  });
}
