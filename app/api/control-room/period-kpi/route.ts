import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return Response.json(
        { message: "Missing required query params: from, to" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("actual_sales_daily")
      .select("visit_date, revenue_amount, pax")
      .gte("visit_date", from)
      .lte("visit_date", to);

    if (error) {
      return Response.json({ message: error.message }, { status: 500 });
    }

    const rows = data ?? [];
    const revenue = rows.reduce((s, r) => s + Number(r.revenue_amount), 0);
    const pax = rows.reduce((s, r) => s + Number(r.pax), 0);
    const bookings = rows.length;

    return Response.json({ revenue, pax, bookings }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
