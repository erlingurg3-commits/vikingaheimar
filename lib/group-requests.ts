import type { SupabaseClient } from "@supabase/supabase-js";
import { HOURLY_CAP } from "@/lib/capacity";

export const GROUP_TIME_SLOTS = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
] as const;

export type GroupDecision = "pending" | "approved" | "declined" | "suggested_alternatives";

export type GroupCapacityRow = {
  id: string;
  visit_time: string;
  status: string | null;
  request_type: string | null;
  source: string | null;
  admin_status: string | null;
  total_tickets: number | null;
  group_size: number | null;
};

export type GroupCapacitySnapshot = {
  capacity: number;
  remainingByTime: Record<string, number>;
};

function toNonNegativeInt(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.floor(parsed);
}

function toMinutes(time: string): number | null {
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function isPendingOrConfirmed(status: string | null): boolean {
  return status === "pending" || status === "confirmed";
}

export function doesOrderCountForCapacity(row: GroupCapacityRow): boolean {
  const requestType = row.request_type ?? "standard";
  const source = row.source ?? "";
  const isGroupRequest = requestType === "group" || source === "travel_agent";

  if (!isPendingOrConfirmed(row.status)) {
    return false;
  }

  if (isGroupRequest) {
    return row.admin_status === "approved";
  }

  return true;
}

export function getPaxForCapacityRow(row: GroupCapacityRow): number {
  const requestType = row.request_type ?? "standard";
  const source = row.source ?? "";
  const isGroupRequest = requestType === "group" || source === "travel_agent";

  if (isGroupRequest) {
    return toNonNegativeInt(row.group_size);
  }

  return toNonNegativeInt(row.total_tickets);
}

export function buildRemainingByTime(
  rows: GroupCapacityRow[],
  cap = HOURLY_CAP,
  timeSlots: readonly string[] = GROUP_TIME_SLOTS
): Record<string, number> {
  const bookedByTime = Object.fromEntries(timeSlots.map((slot) => [slot, 0])) as Record<string, number>;

  for (const row of rows) {
    if (!doesOrderCountForCapacity(row)) {
      continue;
    }

    if (!(row.visit_time in bookedByTime)) {
      continue;
    }

    bookedByTime[row.visit_time] += getPaxForCapacityRow(row);
  }

  return Object.fromEntries(
    Object.entries(bookedByTime).map(([time, booked]) => [time, Math.max(0, cap - booked)])
  );
}

export function canAcceptGroupRequest(
  remainingByTime: Record<string, number>,
  visitTime: string,
  groupSize: number
): { allowed: boolean; remaining: number } {
  const remaining = toNonNegativeInt(remainingByTime[visitTime] ?? HOURLY_CAP);
  return {
    allowed: remaining >= groupSize,
    remaining,
  };
}

export function suggestAlternativeTimes(
  requestedTime: string,
  remainingByTime: Record<string, number>,
  groupSize: number,
  maxSuggestions = 5
): string[] {
  const requestedMinutes = toMinutes(requestedTime);

  return Object.entries(remainingByTime)
    .filter(([, remaining]) => toNonNegativeInt(remaining) >= groupSize)
    .map(([time, remaining]) => ({
      time,
      remaining,
      distance:
        requestedMinutes === null || toMinutes(time) === null
          ? Number.MAX_SAFE_INTEGER
          : Math.abs((toMinutes(time) ?? 0) - requestedMinutes),
    }))
    .sort((left, right) => {
      if (left.distance !== right.distance) {
        return left.distance - right.distance;
      }

      return (toMinutes(left.time) ?? 0) - (toMinutes(right.time) ?? 0);
    })
    .slice(0, maxSuggestions)
    .map((item) => item.time);
}

export async function getGroupCapacitySnapshot(
  supabase: SupabaseClient,
  visitDate: string,
  excludedOrderId?: string
): Promise<GroupCapacitySnapshot> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, visit_time, status, request_type, source, admin_status, total_tickets, group_size")
    .eq("visit_date", visitDate);

  if (error) {
    throw new Error(error.message || "Unable to load capacity rows");
  }

  const rows = ((data ?? []) as GroupCapacityRow[]).filter((row) => row.id !== excludedOrderId);

  return {
    capacity: HOURLY_CAP,
    remainingByTime: buildRemainingByTime(rows),
  };
}
