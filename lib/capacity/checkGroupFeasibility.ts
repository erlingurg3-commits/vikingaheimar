import type { SupabaseClient } from "@supabase/supabase-js";
import { HOURLY_CAP } from "@/lib/capacity";

export const PUBLIC_HOURLY_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;

type ConfirmedOrderRow = {
  visit_time: string;
  ticket_general: number | null;
  ticket_youth: number | null;
  ticket_family: number | null;
};

export type GroupFeasibilityInput = {
  visitDate: string;
  preferredHour: string;
  pax: number;
};

export type GroupFeasibilityResult = {
  feasibility: "feasible" | "not_feasible";
  preferredHour: string;
  remainingAtPreferredHour: number;
  suggestedTimes: string[];
  remainingByHour: Record<string, number>;
};

function toHourString(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function parseHour(time: string): number | null {
  const normalized = normalizeToHour(time);
  const match = normalized.match(/^(\d{2}):00$/);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) {
    return null;
  }

  return hour;
}

export function normalizeToHour(time: string): string {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return time;
  }

  const hour = Number(match[1]);
  if (!Number.isFinite(hour) || hour < 0 || hour > 23) {
    return time;
  }

  return `${String(hour).padStart(2, "0")}:00`;
}

export function toUtcDateAndHour(preferredStart: string): { visitDate: string; hour: string } {
  const asDate = new Date(preferredStart);

  if (!Number.isNaN(asDate.getTime())) {
    const visitDate = `${asDate.getUTCFullYear()}-${String(asDate.getUTCMonth() + 1).padStart(2, "0")}-${String(
      asDate.getUTCDate()
    ).padStart(2, "0")}`;

    const hour = `${String(asDate.getUTCHours()).padStart(2, "0")}:00`;

    return { visitDate, hour };
  }

  return {
    visitDate: "",
    hour: normalizeToHour(preferredStart),
  };
}

function buildRemainingByHour(rows: ConfirmedOrderRow[]): Record<string, number> {
  const consumedByHour = Object.fromEntries(
    Array.from({ length: 24 }, (_, index) => [toHourString(index), 0])
  ) as Record<string, number>;

  for (const row of rows) {
    const slot = normalizeToHour(row.visit_time);
    if (!(slot in consumedByHour)) {
      continue;
    }

    const pax =
      Number(row.ticket_general ?? 0) +
      Number(row.ticket_youth ?? 0) +
      Number(row.ticket_family ?? 0);

    consumedByHour[slot] += Math.max(0, pax);
  }

  return Object.fromEntries(
    Object.entries(consumedByHour).map(([hour, consumed]) => [hour, Math.max(0, HOURLY_CAP - consumed)])
  );
}

function pickSuggestedTimes(
  preferredHour: string,
  remainingByHour: Record<string, number>,
  pax: number,
  maxSuggestions = 6,
  windowHours = 6
): string[] {
  const preferred = parseHour(preferredHour);
  if (preferred === null) {
    return [];
  }

  return Array.from({ length: 24 }, (_, index) => index)
    .filter((hour) => Math.abs(hour - preferred) <= windowHours)
    .map((hour) => {
      const slot = toHourString(hour);
      return {
        slot,
        remaining: remainingByHour[slot] ?? 0,
        distance: Math.abs(hour - preferred),
      };
    })
    .filter((item) => item.remaining >= pax)
    .sort((left, right) => {
      if (left.distance !== right.distance) {
        return left.distance - right.distance;
      }

      return parseHour(left.slot)! - parseHour(right.slot)!;
    })
    .slice(0, maxSuggestions)
    .map((item) => item.slot);
}

export async function checkGroupFeasibility(
  supabase: SupabaseClient,
  input: GroupFeasibilityInput
): Promise<GroupFeasibilityResult> {
  const normalizedHour = normalizeToHour(input.preferredHour);

  const { data, error } = await supabase
    .from("orders")
    .select("visit_time, ticket_general, ticket_youth, ticket_family")
    .eq("visit_date", input.visitDate)
    .eq("status", "confirmed");

  if (error) {
    throw new Error(error.message || "Unable to load confirmed orders for capacity check");
  }

  const rows = (data ?? []) as ConfirmedOrderRow[];
  const remainingByHour = buildRemainingByHour(rows);
  const remainingAtPreferredHour = remainingByHour[normalizedHour] ?? HOURLY_CAP;

  const feasible = input.pax > 0 && remainingAtPreferredHour >= input.pax;

  const suggestedTimes = feasible
    ? []
    : pickSuggestedTimes(normalizedHour, remainingByHour, input.pax, 6, 6);

  return {
    feasibility: feasible ? "feasible" : "not_feasible",
    preferredHour: normalizedHour,
    remainingAtPreferredHour,
    suggestedTimes,
    remainingByHour,
  };
}
