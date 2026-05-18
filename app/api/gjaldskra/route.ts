import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("gjaldskra")
    .select("*")
    .order("category")
    .order("sort_order");

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data ?? []);
}
