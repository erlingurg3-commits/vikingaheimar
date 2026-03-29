import { fetchAllBookings, type BokunBooking } from "./client";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ── Channel mapping ───────────────────────────────────────────────

function mapChannel(booking: BokunBooking): string {
  const ch = booking.channelId?.toUpperCase() ?? "";
  const agentTitle = (booking.agent?.title ?? "").toLowerCase();

  if (agentTitle.includes("cruise") || agentTitle.includes("ship")) return "cruise";
  if (agentTitle.includes("school") || agentTitle.includes("skóli")) return "school";
  if (ch === "MARKETPLACE") return "ota";
  if (ch.includes("WIDGET") || ch === "DIRECT_ONLINE_WIDGETS") return "web";
  if (ch.includes("OTA") || ch.includes("VIATOR") || ch.includes("GETYOURGUIDE")) return "ota";
  if (booking.agent) return "agent";
  return "direct";
}

// ── Product type mapping ──────────────────────────────────────────

function mapProductType(booking: BokunBooking): string {
  const rate = (booking.rateTitle ?? booking.fields?.rateTitle ?? "").toLowerCase();
  const product = (booking.product?.title ?? "").toLowerCase();
  if (rate.includes("breakfast") || rate.includes("morgunverð")) return "breakfast";
  if (rate.includes("combo") || rate.includes("pakki")) return "combo";
  if (rate.includes("senior")) return "senior";
  if (product.includes("entrance") || rate.includes("virtual") || rate.includes("viking")) return "entrance";
  return "entrance";
}

// ── Transform booking → actual_sales_daily row ────────────────────

function toSalesRow(b: BokunBooking) {
  return {
    booking_date: new Date(b.creationDate).toISOString().slice(0, 10),
    visit_date: new Date(b.startDate).toISOString().slice(0, 10),
    revenue_amount: b.totalPrice,
    pax: b.fields?.totalParticipants ?? 0,
    channel: mapChannel(b),
    product_type: mapProductType(b),
    booking_reference: b.productConfirmationCode ?? b.confirmationCode,
  };
}

// ── Date helpers ──────────────────────────────────────────────────

function toDateStr(d: { year: number; month: number; day: number }) {
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}

// ── Sync bookings to Supabase ─────────────────────────────────────

export async function syncBookings(opts: {
  from: { year: number; month: number; day: number };
  to: { year: number; month: number; day: number };
}) {
  const fromStr = toDateStr(opts.from);
  const toStr = toDateStr(opts.to);

  // 1. Fetch all bookings from Bokun (API returns all, we filter client-side)
  const allBookings = await fetchAllBookings(opts.from, opts.to);

  // 2. Filter by visit date range and exclude cancelled
  const inRange = allBookings.filter((b) => {
    const visitDate = new Date(b.startDate).toISOString().slice(0, 10);
    return visitDate >= fromStr && visitDate <= toStr;
  });

  const active = inRange.filter(
    (b) => b.status === "CONFIRMED" || b.status === "ARRIVED"
  );

  // 3. Transform to sales rows
  const rows = active.map(toSalesRow);

  if (rows.length === 0) {
    return {
      synced: 0,
      total: allBookings.length,
      inRange: inRange.length,
      active: 0,
    };
  }

  // 4. Upsert in batches (Supabase limit ~1000 rows per request)
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabaseAdmin
      .from("actual_sales_daily")
      .upsert(batch, { onConflict: "booking_reference", ignoreDuplicates: false });

    if (error) {
      throw new Error(`Supabase upsert failed (batch ${i}): ${error.message}`);
    }
  }

  // 5. Refresh monthly aggregates
  await refreshMonthlyAggregates(fromStr, toStr);

  return {
    synced: rows.length,
    total: allBookings.length,
    inRange: inRange.length,
    active: active.length,
    cancelled: inRange.length - active.length,
  };
}

// ── Refresh monthly aggregates ────────────────────────────────────

async function refreshMonthlyAggregates(fromDate: string, toDate: string) {
  // Paginate to get all rows (Supabase default limit is 1000)
  const dailyRows: Array<{
    visit_date: string;
    revenue_amount: number;
    pax: number;
    channel: string | null;
    product_type: string | null;
  }> = [];
  let from = 0;
  const PAGE = 1000;
  while (true) {
    const { data } = await supabaseAdmin
      .from("actual_sales_daily")
      .select("visit_date, revenue_amount, pax, channel, product_type")
      .gte("visit_date", fromDate)
      .lte("visit_date", toDate)
      .range(from, from + PAGE - 1);
    if (!data || data.length === 0) break;
    dailyRows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  if (dailyRows.length === 0) return;

  // Group by year/month (combined totals + per-channel + per-product)
  const agg = new Map<string, { revenue: number; pax: number }>();

  for (const row of dailyRows) {
    const d = new Date(row.visit_date);
    const ym = `${d.getFullYear()}-${d.getMonth() + 1}`;

    // Combined total (channel=null, product_type=null)
    const totalKey = `${ym}-null-null`;
    const t = agg.get(totalKey) ?? { revenue: 0, pax: 0 };
    t.revenue += Number(row.revenue_amount);
    t.pax += Number(row.pax);
    agg.set(totalKey, t);

    // Per-channel
    if (row.channel) {
      const chKey = `${ym}-${row.channel}-null`;
      const c = agg.get(chKey) ?? { revenue: 0, pax: 0 };
      c.revenue += Number(row.revenue_amount);
      c.pax += Number(row.pax);
      agg.set(chKey, c);
    }

    // Per-product
    if (row.product_type) {
      const ptKey = `${ym}-null-${row.product_type}`;
      const p = agg.get(ptKey) ?? { revenue: 0, pax: 0 };
      p.revenue += Number(row.revenue_amount);
      p.pax += Number(row.pax);
      agg.set(ptKey, p);
    }
  }

  const monthlyRows = Array.from(agg.entries()).map(([key, val]) => {
    const parts = key.split("-");
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const channel = parts[2] === "null" ? null : parts[2];
    const productType = parts[3] === "null" ? null : parts[3];
    return {
      year,
      month,
      channel,
      product_type: productType,
      revenue_total: val.revenue,
      pax_total: val.pax,
      last_aggregated: new Date().toISOString(),
    };
  });

  // Upsert monthly aggregates
  if (monthlyRows.length > 0) {
    await supabaseAdmin
      .from("actual_sales_monthly")
      .upsert(monthlyRows, {
        onConflict: "year,month,channel,product_type",
        ignoreDuplicates: false,
      });
  }
}
