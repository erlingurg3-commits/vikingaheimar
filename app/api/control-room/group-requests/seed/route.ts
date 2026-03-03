import { supabaseAdmin } from "@/lib/supabase-admin";
import { checkGroupFeasibility } from "@/lib/capacity/checkGroupFeasibility";

function nextTopOfHourUtc() {
  const now = new Date();
  const top = new Date(now);
  top.setUTCMinutes(0, 0, 0);
  top.setUTCHours(top.getUTCHours() + 1);

  const visitDate = `${top.getUTCFullYear()}-${String(top.getUTCMonth() + 1).padStart(2, "0")}-${String(
    top.getUTCDate()
  ).padStart(2, "0")}`;

  const hour = `${String(top.getUTCHours()).padStart(2, "0")}:00`;

  return {
    preferredStartIso: top.toISOString(),
    visitDate,
    visitHour: hour,
  };
}

export async function POST() {
  const seed = nextTopOfHourUtc();

  try {
    const feasibility = await checkGroupFeasibility(supabaseAdmin, {
      visitDate: seed.visitDate,
      preferredHour: seed.visitHour,
      pax: 30,
    });

    const { data, error } = await supabaseAdmin
      .from("group_requests")
      .insert({
        agent_company: "Atlantik",
        agent_name: "Paula",
        customer_email: "paula@example.com",
        visit_date: seed.visitDate,
        preferred_visit_time: seed.visitHour,
        selected_visit_time: feasibility.feasibility === "feasible" ? seed.visitHour : null,
        group_size: 30,
        notes: `Seed test request (preferred_start=${seed.preferredStartIso}, duration_minutes=60)`,
        status:
          feasibility.feasibility === "feasible"
            ? "pending_admin_review"
            : "suggested_alternatives",
        feasibility: feasibility.feasibility,
        suggested_times: feasibility.suggestedTimes,
      })
      .select("id")
      .single();

    if (error) {
      return Response.json({ message: error.message }, { status: 500 });
    }

    return Response.json({ id: data.id }, { status: 200 });
  } catch {
    return Response.json({ message: "Unable to seed test request" }, { status: 500 });
  }
}
