import type { SupabaseClient } from "@supabase/supabase-js";
import { HOURLY_CAP } from "@/lib/capacity";

export const HOURLY_TIME_SLOTS = [
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

type OrderCapacityRow = {
  visit_time: string;
  status: string | null;
  source_type: string | null;
  ticket_general: number | null;
  ticket_youth: number | null;
  ticket_family: number | null;
};

type AllocationCapacityRow = {
  visit_time: string;
  status: string | null;
  pax: number | null;
};

export type GroupFeasibilityResult = {
  feasibility: "feasible" | "not_feasible";
  preferredTime: string;
  preferredRemaining: number;
  suggestedTimes: string[];
  remainingByTime: Record<string, number>;
};

function toMinutes(time: string): number | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function normalizeToHour(time: string): string {
  const parts = time.split(":");
  if (parts.length < 2) {
    return time;
  }

  const hour = Number(parts[0]);
  if (!Number.isFinite(hour)) {
    return time;
  }

  return `${String(hour).padStart(2, "0")}:00`;
}

function getOrderPax(row: OrderCapacityRow): number {
  return (
    Number(row.ticket_general ?? 0) +
    Number(row.ticket_youth ?? 0) +
    Number(row.ticket_family ?? 0)
  );
}

function getRequestedPax(groupSize: number): number {
  const parsed = Number(groupSize);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.floor(parsed);
}

export async function getRemainingCapacityByHour(
  supabase: SupabaseClient,
  visitDate: string,
  excludedGroupRequestId?: string
): Promise<Record<string, number>> {
  const [ordersResponse, allocationsResponse] = await Promise.all([
    supabase
      .from("orders")
      .select("visit_time, status, source_type, ticket_general, ticket_youth, ticket_family")
      .eq("visit_date", visitDate)
      .in("status", ["pending", "confirmed"]),
    supabase
      .from("group_request_allocations")
      .select("visit_time, status, pax, group_request_id")
      .eq("visit_date", visitDate)
      .eq("status", "active"),
  ]);

  if (ordersResponse.error) {
    throw new Error(ordersResponse.error.message || "Unable to load orders for feasibility");
  }

  if (allocationsResponse.error) {
    throw new Error(allocationsResponse.error.message || "Unable to load allocations for feasibility");
  }

  const remainingByTime = Object.fromEntries(
    HOURLY_TIME_SLOTS.map((slot) => [slot, HOURLY_CAP])
  ) as Record<string, number>;

  const orders = (ordersResponse.data ?? []) as OrderCapacityRow[];
  for (const order of orders) {
    const slot = normalizeToHour(order.visit_time);
    if (!(slot in remainingByTime)) {
      continue;
    }

    const sourceType = order.source_type ?? "standard";
    if (sourceType === "group_request") {
      continue;
    }

    remainingByTime[slot] = Math.max(0, remainingByTime[slot] - getOrderPax(order));
  }

  const allocations = (allocationsResponse.data ?? []) as (AllocationCapacityRow & {
    group_request_id?: string | null;
  })[];

  for (const allocation of allocations) {
    const slot = normalizeToHour(allocation.visit_time);
    if (!(slot in remainingByTime)) {
      continue;
    }

    if (excludedGroupRequestId && allocation.group_request_id === excludedGroupRequestId) {
      continue;
    }

    remainingByTime[slot] = Math.max(0, remainingByTime[slot] - Number(allocation.pax ?? 0));
  }

  return remainingByTime;
}

export function buildAlternativeSuggestions(
  preferredTime: string,
  remainingByTime: Record<string, number>,
  groupSize: number,
  maxSuggestions = 6,
  hourWindow = 6
): string[] {
  const requestedPax = getRequestedPax(groupSize);
  const preferredMinutes = toMinutes(preferredTime);

  return Object.entries(remainingByTime)
    .filter(([, remaining]) => remaining >= requestedPax)
    .filter(([time]) => {
      if (preferredMinutes === null) {
        return true;
      }

      const minutes = toMinutes(time);
      if (minutes === null) {
        return false;
      }

      return Math.abs(minutes - preferredMinutes) <= hourWindow * 60;
    })
    .map(([time, remaining]) => {
      const minutes = toMinutes(time);
      return {
        time,
        remaining,
        distance:
          preferredMinutes === null || minutes === null
            ? Number.MAX_SAFE_INTEGER
            : Math.abs(minutes - preferredMinutes),
      };
    })
    .sort((left, right) => {
      if (left.distance !== right.distance) {
        return left.distance - right.distance;
      }

      const leftMinutes = toMinutes(left.time) ?? 0;
      const rightMinutes = toMinutes(right.time) ?? 0;
      return leftMinutes - rightMinutes;
    })
    .slice(0, maxSuggestions)
    .map((item) => item.time);
}

export async function evaluateGroupRequestFeasibility(
  supabase: SupabaseClient,
  visitDate: string,
  preferredTime: string,
  groupSize: number,
  excludedGroupRequestId?: string
): Promise<GroupFeasibilityResult> {
  const requestedPax = getRequestedPax(groupSize);
  const normalizedPreferred = normalizeToHour(preferredTime);

  const remainingByTime = await getRemainingCapacityByHour(
    supabase,
    visitDate,
    excludedGroupRequestId
  );

  const preferredRemaining = remainingByTime[normalizedPreferred] ?? HOURLY_CAP;
  const feasible = requestedPax > 0 && preferredRemaining >= requestedPax;

  const suggestedTimes = feasible
    ? []
    : buildAlternativeSuggestions(normalizedPreferred, remainingByTime, requestedPax, 6, 6);

  return {
    feasibility: feasible ? "feasible" : "not_feasible",
    preferredTime: normalizedPreferred,
    preferredRemaining,
    suggestedTimes,
    remainingByTime,
  };
}
