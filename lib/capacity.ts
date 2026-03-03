import type { SupabaseClient } from "@supabase/supabase-js";

export const HOURLY_CAP = 50;

type CapacityRow = {
  ticket_general: number | null;
  ticket_youth: number | null;
  ticket_family: number | null;
};

export async function validateCapacity(
  supabase: SupabaseClient,
  visit_date: string,
  visit_time: string,
  newBookingTotal: number
) {
  const { data, error } = await supabase
    .from("orders")
    .select("ticket_general, ticket_youth, ticket_family")
    .eq("visit_date", visit_date)
    .eq("visit_time", visit_time)
    .in("status", ["pending", "confirmed"]);

  if (error) {
    console.error("Capacity query error:", error);
    throw new Error("Capacity query failed");
  }

  const rows = (data as CapacityRow[] | null) ?? [];

  const currentTotal =
    rows.reduce((sum, row) => {
      return (
        sum +
        (row.ticket_general || 0) +
        (row.ticket_youth || 0) +
        (row.ticket_family || 0)
      );
    }, 0) || 0;

  const remaining = Math.max(0, HOURLY_CAP - currentTotal);

  if (currentTotal + newBookingTotal > HOURLY_CAP) {
    return {
      allowed: false,
      remaining,
    };
  }

  return {
    allowed: true,
    remaining,
  };
}
