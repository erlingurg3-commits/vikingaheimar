import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const { data: highDay, error: highDayError } = await supabaseAdmin
      .from("demand_days")
      .select("date, score, confidence, cruise_pax, air_arrivals")
      .eq("score_level", "HIGH")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (highDayError) {
      return Response.json({ message: highDayError.message }, { status: 500 });
    }

    return Response.json({ nextHighDay: highDay ?? null }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
