import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-admin";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  admin_comment: z.string().trim().min(1).max(1000),
  reviewed_by: z.string().trim().max(255).optional(),
});

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);

  if (!parsedParams.success) {
    return Response.json({ message: "Invalid request id" }, { status: 400 });
  }

  const payload = await req.json().catch(() => ({}));
  const parsedBody = bodySchema.safeParse(payload);

  if (!parsedBody.success) {
    return Response.json(
      { message: "Invalid request body", issues: parsedBody.error.flatten() },
      { status: 400 }
    );
  }

  const requestId = parsedParams.data.id;

  const { error } = await supabaseAdmin
    .from("group_requests")
    .update({
      status: "declined",
      admin_comment: parsedBody.data.admin_comment,
      reviewed_by: parsedBody.data.reviewed_by ?? "control-room",
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      suggested_times: [],
    })
    .eq("id", requestId);

  if (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }

  await supabaseAdmin
    .from("group_request_allocations")
    .update({ status: "released", released_at: new Date().toISOString() })
    .eq("group_request_id", requestId)
    .eq("status", "active");

  return Response.json(
    {
      message: "Group request declined",
      requestId,
    },
    { status: 200 }
  );
}
