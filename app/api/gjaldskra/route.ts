import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const { category, sort_order, name, setup, note, includes, price, badge } = body;

  if (!category || !name || !price) {
    return Response.json({ error: "category, name and price are required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("gjaldskra")
    .insert({ category, sort_order: sort_order ?? 999, name, setup: setup ?? null, note: note ?? null, includes: includes ?? null, price, badge: badge ?? null })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("gjaldskra")
    .select("*")
    .order("category")
    .order("sort_order");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}
