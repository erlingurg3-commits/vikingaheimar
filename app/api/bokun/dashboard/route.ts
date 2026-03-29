import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const today = now.toISOString().slice(0, 10);
    const monthStart = `${year}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    // Run all queries in parallel
    const [
      { data: todayBookings },
      { data: monthlyAgg },
      { data: recentBookings },
      { data: channelBreakdown },
    ] = await Promise.all([
      // Today's sales
      supabaseAdmin
        .from("actual_sales_daily")
        .select("revenue_amount, pax, channel, product_type")
        .eq("visit_date", today),

      // Monthly aggregates for the year
      supabaseAdmin
        .from("actual_sales_monthly")
        .select("*")
        .eq("year", year)
        .order("month"),

      // Last 20 bookings
      supabaseAdmin
        .from("actual_sales_daily")
        .select("*")
        .order("booking_date", { ascending: false })
        .limit(20),

      // Channel breakdown for current month
      supabaseAdmin
        .from("actual_sales_daily")
        .select("channel, revenue_amount, pax")
        .gte("visit_date", monthStart)
        .lte("visit_date", today),
    ]);

    // Aggregate today
    const todaySummary = {
      revenue: (todayBookings ?? []).reduce((s, r) => s + Number(r.revenue_amount), 0),
      pax: (todayBookings ?? []).reduce((s, r) => s + Number(r.pax), 0),
      bookings: todayBookings?.length ?? 0,
    };

    // Aggregate channels for current month
    const channels = new Map<string, { revenue: number; pax: number; count: number }>();
    for (const row of channelBreakdown ?? []) {
      const ch = row.channel ?? "unknown";
      const existing = channels.get(ch) ?? { revenue: 0, pax: 0, count: 0 };
      existing.revenue += Number(row.revenue_amount);
      existing.pax += Number(row.pax);
      existing.count++;
      channels.set(ch, existing);
    }

    // YTD totals from monthly aggregates (channel=null rows are combined)
    const ytd = {
      revenue: 0,
      pax: 0,
    };
    for (const row of monthlyAgg ?? []) {
      if (!row.channel && !row.product_type) {
        ytd.revenue += Number(row.revenue_total);
        ytd.pax += Number(row.pax_total);
      }
    }

    return NextResponse.json({
      today: todaySummary,
      ytd,
      monthlyTrend: monthlyAgg ?? [],
      channelBreakdown: Object.fromEntries(channels),
      recentBookings: recentBookings ?? [],
      lastSync: (recentBookings?.[0] as Record<string, unknown>)?.imported_at ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}
