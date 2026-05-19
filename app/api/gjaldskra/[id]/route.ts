import { supabaseAdmin } from "@/lib/supabase-admin";

const ALLOWED_FIELDS = new Set(["name", "setup", "note", "includes", "price", "badge"]);

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabaseAdmin
    .from("gjaldskra")
    .delete()
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const update: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(body)) {
    if (ALLOWED_FIELDS.has(key)) update[key] = val === "" ? null : val;
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: "No valid fields" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("gjaldskra")
    .update(update)
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
