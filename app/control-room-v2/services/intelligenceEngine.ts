import { HOURLY_CAP } from "@/lib/capacity";
import { PUBLIC_HOURLY_SLOTS } from "@/lib/capacity/checkGroupFeasibility";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type {
  ExternalSignals,
  MarketShareSnapshot,
  OpportunityItem,
  TourismPressureIndex,
} from "@/app/control-room-v2/types/intelligence";

/**
 * DISCOVERED TABLE/COLUMN MAPPING (from existing repo queries)
 *
 * A1 Individual bookings
 * - table: orders
 * - date column: visit_date
 * - pax columns: ticket_general, ticket_youth, ticket_family, total_tickets
 * - status column: status (confirmed value used across V1: "confirmed")
 *
 * A2 Group bookings / group requests
 * - table: group_requests
 * - date columns: preferred_start (timestamp), visit_date (date)
 * - pax columns: pax, group_size
 * - status column: status (approved value used in V1 admin flow: "approved")
 * - note: approved group requests are commonly materialized into orders with source_type="group_request"
 *
 * A3 Flight arrivals
 * - table: flight_arrivals
 * - date column: date
 * - arrivals equivalent: row count per date
 * - widebody column: is_widebody
 * - baseline source: no explicit baseline column found
 *
 * A4 Cruise calls / cruise pax
 * - table: port_calls
 * - date/ETA column: eta
 * - pax column: pax_estimate
 * - status filter used in repo: scheduled, arrived
 */

const ORDER_CONFIRMED_STATUSES = ["confirmed"] as const;
const GROUP_APPROVED_STATUSES = ["approved"] as const;

function toDateKey(value: string): string {
  return value.slice(0, 10);
}

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function weekday(dateKey: string): number {
  return new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toInt(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}

function parseVisitDateFromPreferredStart(preferredStart: string | null | undefined): string | null {
  if (!preferredStart) {
    return null;
  }

  const parsed = new Date(preferredStart);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

type OrderRow = {
  visit_date: string;
  status: string | null;
  source_type: string | null;
  request_type: string | null;
  source_id: string | null;
  total_tickets: number | null;
  ticket_general: number | null;
  ticket_youth: number | null;
  ticket_family: number | null;
  group_size: number | null;
};

type GroupRequestRow = {
  id: string;
  preferred_start: string | null;
  visit_date: string | null;
  status: string | null;
  pax: number | null;
  group_size: number | null;
};

type FlightArrivalRow = {
  date: string;
  is_widebody: boolean | null;
};

type PortCallRow = {
  eta: string | null;
  pax_estimate: number | null;
  status: string | null;
};

function splitOrderVisitors(row: OrderRow): { individual: number; group: number } {
  const totalTickets =
    toInt(row.total_tickets) ||
    (toInt(row.ticket_general) + toInt(row.ticket_youth) + toInt(row.ticket_family));

  const groupSize = toInt(row.group_size);
  const requestType = (row.request_type ?? "").toLowerCase();
  const sourceType = (row.source_type ?? "").toLowerCase();
  const isGroup = requestType === "group" || sourceType === "group_request" || groupSize > 0;

  if (isGroup) {
    return { individual: 0, group: groupSize || totalTickets };
  }

  return { individual: totalTickets, group: 0 };
}

async function fetchConfirmedOrders(startDateISO: string, endDateISO: string): Promise<OrderRow[]> {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(
      "visit_date, status, source_type, request_type, source_id, total_tickets, ticket_general, ticket_youth, ticket_family, group_size"
    )
    .gte("visit_date", startDateISO)
    .lte("visit_date", endDateISO)
    .in("status", [...ORDER_CONFIRMED_STATUSES]);

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data as OrderRow[];
}

async function fetchApprovedGroupRequests(startDateISO: string, endDateISO: string): Promise<GroupRequestRow[]> {
  const lowerBound = `${startDateISO}T00:00:00.000Z`;
  const upperBound = `${endDateISO}T23:59:59.999Z`;

  const byPreferredStart = await supabaseAdmin
    .from("group_requests")
    .select("id, preferred_start, visit_date, status, pax, group_size")
    .gte("preferred_start", lowerBound)
    .lte("preferred_start", upperBound)
    .in("status", [...GROUP_APPROVED_STATUSES]);

  if (!byPreferredStart.error && Array.isArray(byPreferredStart.data)) {
    return byPreferredStart.data as GroupRequestRow[];
  }

  const byVisitDate = await supabaseAdmin
    .from("group_requests")
    .select("id, preferred_start, visit_date, status, pax, group_size")
    .gte("visit_date", startDateISO)
    .lte("visit_date", endDateISO)
    .in("status", [...GROUP_APPROVED_STATUSES]);

  if (byVisitDate.error || !Array.isArray(byVisitDate.data)) {
    return [];
  }

  return byVisitDate.data as GroupRequestRow[];
}

async function fetchFlightArrivals(startDateISO: string, endDateISO: string): Promise<FlightArrivalRow[]> {
  const { data, error } = await supabaseAdmin
    .from("flight_arrivals")
    .select("date, is_widebody")
    .gte("date", startDateISO)
    .lte("date", endDateISO);

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data as FlightArrivalRow[];
}

async function fetchCruiseCallsForDate(dateISO: string): Promise<PortCallRow[]> {
  const fromIso = `${dateISO}T00:00:00.000Z`;
  const toIso = `${dateISO}T23:59:59.999Z`;

  const { data, error } = await supabaseAdmin
    .from("port_calls")
    .select("eta, pax_estimate, status")
    .gte("eta", fromIso)
    .lte("eta", toIso)
    .in("status", ["scheduled", "arrived"]);

  if (error || !Array.isArray(data)) {
    return [];
  }

  return data as PortCallRow[];
}

export async function getTodayVisitorsActual(dateISO: string): Promise<number> {
  const dateKey = toDateKey(dateISO);

  const [orders, approvedGroupRequests] = await Promise.all([
    fetchConfirmedOrders(dateKey, dateKey),
    fetchApprovedGroupRequests(dateKey, dateKey),
  ]);

  let individualTotal = 0;
  let groupTotalFromOrders = 0;
  const orderBackedGroupRequestIds = new Set<string>();

  for (const row of orders) {
    const split = splitOrderVisitors(row);
    individualTotal += split.individual;
    groupTotalFromOrders += split.group;

    if ((row.source_type ?? "").toLowerCase() === "group_request" && row.source_id) {
      orderBackedGroupRequestIds.add(row.source_id);
    }
  }

  let groupTotalFromRequestsOnly = 0;
  for (const request of approvedGroupRequests) {
    if (orderBackedGroupRequestIds.has(request.id)) {
      continue;
    }

    const requestDate = request.visit_date || parseVisitDateFromPreferredStart(request.preferred_start);
    if (requestDate !== dateKey) {
      continue;
    }

    groupTotalFromRequestsOnly += toInt(request.pax) || toInt(request.group_size);
  }

  return individualTotal + groupTotalFromOrders + groupTotalFromRequestsOnly;
}

export async function getExternalSignals(dateISO: string): Promise<ExternalSignals> {
  const dateKey = toDateKey(dateISO);

  const [todayFlightsRows, sameWeekdayRows, cruiseRows] = await Promise.all([
    fetchFlightArrivals(dateKey, dateKey),
    fetchFlightArrivals(addDays(dateKey, -28), addDays(dateKey, -1)),
    fetchCruiseCallsForDate(dateKey),
  ]);

  const flights_est = todayFlightsRows.length;
  const widebody_count = todayFlightsRows.reduce((sum, row) => sum + (row.is_widebody ? 1 : 0), 0);

  const targetWeekday = weekday(dateKey);
  const byDate = new Map<string, number>();

  for (const row of sameWeekdayRows) {
    if (weekday(row.date) !== targetWeekday) {
      continue;
    }

    byDate.set(row.date, (byDate.get(row.date) ?? 0) + 1);
  }

  const weekdayCounts = Array.from(byDate.values());
  const flights_baseline =
    weekdayCounts.length > 0
      ? Math.max(1, Math.round(weekdayCounts.reduce((sum, value) => sum + value, 0) / weekdayCounts.length))
      : Math.max(1, flights_est);

  const cruise_pax = cruiseRows.reduce((sum, row) => sum + toInt(row.pax_estimate), 0);

  return {
    flights_est,
    flights_baseline,
    widebody_count,
    cruise_pax,
  };
}

export async function getTourismPressureIndex(dateISO: string): Promise<TourismPressureIndex> {
  const external = await getExternalSignals(dateISO);

  const flightPressure = clamp(
    (external.flights_est / Math.max(external.flights_baseline, 1)) * 50,
    0,
    70,
  );
  const cruisePressure = clamp((external.cruise_pax / 3000) * 30, 0, 30);
  const score = Math.round(Math.min(100, flightPressure + cruisePressure));

  const level: TourismPressureIndex["level"] = score >= 70 ? "HIGH" : score >= 45 ? "MED" : "LOW";

  const drivers: string[] = [];
  if (external.flights_est > 0) {
    const ratio = external.flights_est / Math.max(external.flights_baseline, 1);
    if (ratio >= 1.15) {
      drivers.push("Flights are above weekday baseline.");
    } else if (ratio <= 0.9) {
      drivers.push("Flights are below weekday baseline.");
    } else {
      drivers.push("Flights are tracking baseline.");
    }
  }

  if (external.cruise_pax > 0) {
    drivers.push("Cruise arrivals are adding visitor volume.");
  }

  if (external.widebody_count > 0) {
    drivers.push("Widebody share supports long-haul demand.");
  }

  if (drivers.length === 0) {
    drivers.push("No external demand signals connected yet.");
  }

  let confidence = 50;
  if (external.flights_est > 0) {
    confidence += 20;
  }
  if (external.cruise_pax > 0) {
    confidence += 20;
  }
  if (external.flights_baseline > 0) {
    confidence += 10;
  }

  return {
    score,
    level,
    confidence: clamp(confidence, 0, 100),
    drivers: drivers.slice(0, 3),
  };
}

export async function getMarketShare(dateISO: string): Promise<MarketShareSnapshot> {
  const [external, visitors] = await Promise.all([
    getExternalSignals(dateISO),
    getTodayVisitorsActual(dateISO),
  ]);

  const tourismPool = external.flights_est + external.cruise_pax;
  const marketSharePct = tourismPool > 0 ? Number(((visitors / tourismPool) * 100).toFixed(2)) : 0;

  return {
    tourismPool,
    visitors,
    marketSharePct,
    targetPct: 3.0,
  };
}

export async function getOpportunities(windowStartISO: string, days: number): Promise<OpportunityItem[]> {
  const startDate = toDateKey(windowStartISO);
  const safeDays = Math.max(1, Math.trunc(days));
  const endDate = addDays(startDate, safeDays - 1);

  const [orders, approvedGroupRequests] = await Promise.all([
    fetchConfirmedOrders(startDate, endDate),
    fetchApprovedGroupRequests(startDate, endDate),
  ]);

  const orderBackedGroupRequestIds = new Set<string>();
  const dailyBookedVisitors = new Map<string, number>();

  for (const order of orders) {
    const day = order.visit_date;
    if (!day) {
      continue;
    }

    const split = splitOrderVisitors(order);
    dailyBookedVisitors.set(day, (dailyBookedVisitors.get(day) ?? 0) + split.individual + split.group);

    if ((order.source_type ?? "").toLowerCase() === "group_request" && order.source_id) {
      orderBackedGroupRequestIds.add(order.source_id);
    }
  }

  for (const request of approvedGroupRequests) {
    if (orderBackedGroupRequestIds.has(request.id)) {
      continue;
    }

    const day = request.visit_date || parseVisitDateFromPreferredStart(request.preferred_start);
    if (!day || day < startDate || day > endDate) {
      continue;
    }

    const pax = toInt(request.pax) || toInt(request.group_size);
    dailyBookedVisitors.set(day, (dailyBookedVisitors.get(day) ?? 0) + pax);
  }

  const dailyCapacity = HOURLY_CAP * PUBLIC_HOURLY_SLOTS.length;

  const opportunities: Array<OpportunityItem & { deviation: number }> = [];

  for (let offset = 0; offset < safeDays; offset += 1) {
    const day = addDays(startDate, offset);
    const bookedVisitors = dailyBookedVisitors.get(day) ?? 0;
    const utilization = dailyCapacity > 0 ? bookedVisitors / dailyCapacity : 0;

    if (utilization < 0.65) {
      const confidence = clamp(55 + Math.round((0.65 - utilization) * 120), 45, 90);
      opportunities.push({
        dateISO: day,
        type: "FILL",
        title: "Capacity headroom available",
        why: [
          `Utilization is ${(utilization * 100).toFixed(0)}% vs a 65% floor.`,
          `Booked visitors are ${bookedVisitors} against ${dailyCapacity} daily capacity.`,
        ],
        actions: [
          "Increase partner inventory for this date.",
          "Highlight flexible-time offers in direct channels.",
        ],
        confidence,
        deviation: Math.abs(utilization - 0.8),
      });
    } else if (utilization > 0.92) {
      const confidence = clamp(55 + Math.round((utilization - 0.92) * 220), 45, 95);
      opportunities.push({
        dateISO: day,
        type: "PRICE",
        title: "High-demand window",
        why: [
          `Utilization is ${(utilization * 100).toFixed(0)}% above the 92% threshold.`,
          `Booked visitors are ${bookedVisitors} against ${dailyCapacity} daily capacity.`,
        ],
        actions: [
          "Shift sales toward higher-yield ticket mixes.",
          "Protect prime slots for premium demand.",
        ],
        confidence,
        deviation: Math.abs(utilization - 0.8),
      });
    }
  }

  return opportunities
    .sort((a, b) => b.deviation - a.deviation || a.dateISO.localeCompare(b.dateISO))
    .slice(0, 5)
    .map(({ deviation, ...item }) => item);
}
