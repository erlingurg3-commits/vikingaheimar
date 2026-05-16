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
      .from("demand_days")
      .select("date, score_level, score, confidence, cruise_pax, air_arrivals")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true });

    if (error) {
      return Response.json({ message: error.message }, { status: 500 });
    }

    return Response.json(data ?? [], { status: 200 });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
