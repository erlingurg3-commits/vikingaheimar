import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabaseAdmin
    .from("teya_settlements")
    .select("*")
    .order("settlement_date", { ascending: false });

  if (from) query = query.gte("settlement_date", from);
  if (to) query = query.lte("settlement_date", to);

  const { data, error } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const rows = data ?? [];

  const totalSales = rows.reduce((s, r) => s + (r.sales ?? 0), 0);
  const totalFees = rows.reduce((s, r) => s + (r.fees ?? 0), 0);
  const totalRefunds = rows.reduce((s, r) => s + (r.refunds ?? 0), 0);
  const totalNet = rows.reduce((s, r) => s + (r.net_amount ?? 0), 0);
  const totalTransferred = rows.reduce((s, r) => s + (r.transferred ?? 0), 0);

  return Response.json({
    rows,
    summary: { totalSales, totalFees, totalRefunds, totalNet, totalTransferred },
  });
}
