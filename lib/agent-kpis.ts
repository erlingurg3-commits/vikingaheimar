import type { OrderRow } from "@/lib/orders";

export type AgentKpiRow = {
  agent_company: string;
  total_bookings: number;
  total_pax: number;
  individual_pax: number;
  group_pax: number;
  group_requests: number;
  group_approved_count: number;
  group_approval_rate: number;
  group_heavy: boolean;
  total_revenue: number;
  yield_per_guest: number | null;
  confirmed_count: number;
  pending_count: number;
  confirmation_rate: number;
};

export type AgentKpiSummary = {
  totalAgencyRevenue: number;
  totalAgencyPax: number;
  averageAgencyYield: number | null;
  totalGroupRequests: number;
  totalGroupPax: number;
  groupApprovalRate: number;
  topPerformingAgency: AgentKpiRow | null;
  highestRevenueAgency: AgentKpiRow | null;
  highestYieldAgency: AgentKpiRow | null;
};

export type AgentSortKey = "revenue" | "pax" | "yield" | "bookings" | "confirmation_rate";
export type AgentSortDirection = "asc" | "desc";

function toPositiveNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function isGroupBooking(order: OrderRow): boolean {
  return (
    order.request_type === "group" ||
    order.source === "travel_agent" ||
    order.source_type === "group_request"
  );
}

export function extractOrderPax(order: OrderRow): number {
  const anyOrder = order as OrderRow & {
    pax?: number | null;
    guests?: number | null;
    quantity?: number | null;
    booking_group_size?: number | null;
  };

  const explicitPax =
    toPositiveNumber(anyOrder.pax) ||
    toPositiveNumber(anyOrder.guests) ||
    toPositiveNumber(anyOrder.quantity) ||
    toPositiveNumber(anyOrder.booking_group_size);

  const ticketPax =
    toPositiveNumber(order.total_tickets) ||
    toPositiveNumber(order.ticket_general) +
      toPositiveNumber(order.ticket_youth) +
      toPositiveNumber(order.ticket_family);

  const groupPax = toPositiveNumber(order.group_size);

  if (isGroupBooking(order)) {
    return groupPax || explicitPax || ticketPax;
  }

  return explicitPax || ticketPax || groupPax;
}

export function isAgentOrder(order: OrderRow): boolean {
  return typeof order.agent_company === "string" && order.agent_company.trim().length > 0;
}

export function aggregateAgentKpis(orders: OrderRow[]): AgentKpiRow[] {
  const map = new Map<string, AgentKpiRow>();

  for (const order of orders) {
    if (!isAgentOrder(order)) {
      continue;
    }

    const company = order.agent_company!.trim();
    const status = (order.status ?? "").toLowerCase();
    const isGroupRequest = isGroupBooking(order);
    const adminStatus = (order.admin_status ?? "").toLowerCase();
    const effectivePax = extractOrderPax(order);

    const current = map.get(company) ?? {
      agent_company: company,
      total_bookings: 0,
      total_pax: 0,
      individual_pax: 0,
      group_pax: 0,
      group_requests: 0,
      group_approved_count: 0,
      group_approval_rate: 0,
      group_heavy: false,
      total_revenue: 0,
      yield_per_guest: null,
      confirmed_count: 0,
      pending_count: 0,
      confirmation_rate: 0,
    };

    current.total_bookings += 1;
    current.total_pax += effectivePax;
    current.total_revenue += Number(order.total_amount ?? 0);

    if (isGroupRequest) {
      current.group_requests += 1;
      current.group_pax += effectivePax;

      if (adminStatus === "approved") {
        current.group_approved_count += 1;
      }
    } else {
      current.individual_pax += effectivePax;
    }

    if (status === "confirmed") {
      current.confirmed_count += 1;
    } else if (status === "pending") {
      current.pending_count += 1;
    }

    map.set(company, current);
  }

  return Array.from(map.values()).map((row) => ({
    ...row,
    confirmation_rate:
      row.total_bookings > 0 ? row.confirmed_count / row.total_bookings : 0,
    group_approval_rate:
      row.group_requests > 0 ? row.group_approved_count / row.group_requests : 0,
    group_heavy: row.group_pax > row.individual_pax,
    yield_per_guest: row.total_pax > 0 ? row.total_revenue / row.total_pax : null,
  }));
}

export function sortAgentKpis(
  rows: AgentKpiRow[],
  sortBy: AgentSortKey,
  direction: AgentSortDirection = "desc"
): AgentKpiRow[] {
  const sorted = [...rows];

  sorted.sort((left, right) => {
    let delta = 0;

    if (sortBy === "revenue") {
      delta = right.total_revenue - left.total_revenue;
    } else if (sortBy === "pax") {
      delta = right.total_pax - left.total_pax;
    } else if (sortBy === "yield") {
      delta = (right.yield_per_guest ?? -1) - (left.yield_per_guest ?? -1);
    } else if (sortBy === "confirmation_rate") {
      delta = right.confirmation_rate - left.confirmation_rate;
    } else {
      delta = right.total_bookings - left.total_bookings;
    }

    if (direction === "asc") {
      return -delta;
    }

    return delta;
  });

  return sorted;
}

export function buildAgentKpiSummary(rows: AgentKpiRow[]): AgentKpiSummary {
  const totalAgencyRevenue = rows.reduce((sum, row) => sum + row.total_revenue, 0);
  const totalAgencyPax = rows.reduce((sum, row) => sum + row.total_pax, 0);
  const averageAgencyYield = totalAgencyPax > 0 ? totalAgencyRevenue / totalAgencyPax : null;
  const totalGroupRequests = rows.reduce((sum, row) => sum + row.group_requests, 0);
  const totalGroupPax = rows.reduce((sum, row) => sum + row.group_pax, 0);
  const totalGroupApproved = rows.reduce((sum, row) => sum + row.group_approved_count, 0);
  const groupApprovalRate = totalGroupRequests > 0 ? totalGroupApproved / totalGroupRequests : 0;

  const topPerformingAgency = [...rows].sort((left, right) => {
    if (right.confirmation_rate !== left.confirmation_rate) {
      return right.confirmation_rate - left.confirmation_rate;
    }
    return right.total_bookings - left.total_bookings;
  })[0] ?? null;

  const highestRevenueAgency = [...rows].sort(
    (left, right) => right.total_revenue - left.total_revenue
  )[0] ?? null;

  const highestYieldAgency = [...rows]
    .filter((row) => (row.yield_per_guest ?? 0) > 0)
    .sort((left, right) => (right.yield_per_guest ?? 0) - (left.yield_per_guest ?? 0))[0] ?? null;

  return {
    totalAgencyRevenue,
    totalAgencyPax,
    averageAgencyYield,
    totalGroupRequests,
    totalGroupPax,
    groupApprovalRate,
    topPerformingAgency,
    highestRevenueAgency,
    highestYieldAgency,
  };
}
