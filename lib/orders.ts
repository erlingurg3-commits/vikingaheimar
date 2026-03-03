import type { SupabaseClient } from "@supabase/supabase-js";
import { HOURLY_CAP, validateCapacity } from "@/lib/capacity";

export type CheckoutDraft = {
  visit_date: string;
  visit_time: string;
  ticket_general: number;
  ticket_youth: number;
  ticket_family: number;
  total_amount: number;
};

export type OrderRow = {
  id: string;
  created_at: string;
  customer_email: string;
  agent_id: string | null;
  agent_name: string | null;
  agent_company: string | null;
  request_type: "standard" | "group" | null;
  group_size: number | null;
  notes: string | null;
  admin_status:
    | "none"
    | "pending_admin_review"
    | "approved"
    | "declined"
    | "suggested_alternatives"
    | null;
  admin_decision_reason: string | null;
  suggested_times: string[] | null;
  visit_date: string;
  visit_time: string;
  ticket_general: number;
  ticket_youth: number;
  ticket_family: number;
  total_tickets: number;
  total_amount: number;
  status: string;
  source: string | null;
  source_type: "standard" | "group_request" | null;
  source_id: string | null;
};

export type OrderInsertInput = {
  customer_email: string;
  agent_id?: string;
  agent_company?: string;
  visit_date: string;
  visit_time: string;
  ticket_general: number;
  ticket_youth: number;
  ticket_family: number;
  total_amount: number;
  status: string;
};

export type CreateStandardOrderParams = {
  customer_email: string;
  visit_date: string;
  visit_time: string;
  ticket_general: number;
  ticket_youth: number;
  ticket_family: number;
  total_amount: number;
  agent_id?: string | null;
  agent_company?: string | null;
  status?: string;
};

export type CreateGroupRequestParams = {
  agent_id?: string | null;
  agent_company?: string | null;
  agent_name: string;
  agent_email: string;
  visit_date: string;
  visit_time: string;
  group_size: number;
  notes?: string | null;
  preferred_visit_time?: string;
  selected_visit_time?: string | null;
  status?: string;
  feasibility?: "feasible" | "not_feasible";
  suggested_times?: string[];
  admin_comment?: string | null;
};

export type GroupRequestInsertRow = {
  id: string;
  created_at: string;
  agent_id: string | null;
  agent_company: string | null;
  agent_name: string;
  agent_email: string | null;
  customer_email: string | null;
  visit_date: string;
  preferred_visit_time: string;
  selected_visit_time: string | null;
  group_size: number;
  notes: string | null;
  status: string;
  feasibility: "feasible" | "not_feasible";
  suggested_times: string[];
  admin_comment: string | null;
};

export type ResolveAgencyOptions = {
  autoCreate?: boolean;
  contact_name?: string;
  email?: string;
  phone?: string;
  country?: string;
  notes?: string;
};

function cleanInsertPayload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
}

function asPositiveInt(value: number): number {
  const normalized = Number(value);
  if (!Number.isFinite(normalized) || normalized < 0) {
    return 0;
  }

  return Math.floor(normalized);
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function resolveAgency(
  supabase: SupabaseClient,
  companyName: string,
  options: ResolveAgencyOptions = {}
): Promise<string | null> {
  const normalizedCompany = companyName.trim();
  if (!normalizedCompany) {
    return null;
  }

  const { data: existing } = await supabase
    .from("travel_agencies")
    .select("id")
    .eq("company_name", normalizedCompany)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  if (!options.autoCreate) {
    return null;
  }

  const { data: inserted, error } = await supabase
    .from("travel_agencies")
    .insert(
      cleanInsertPayload({
        company_name: normalizedCompany,
        contact_name: options.contact_name?.trim() || null,
        email: options.email ? normalizeEmail(options.email) : null,
        phone: options.phone?.trim() || null,
        country: options.country?.trim() || null,
        notes: options.notes?.trim() || null,
      })
    )
    .select("id")
    .single();

  if (error || !inserted?.id) {
    return null;
  }

  return inserted.id;
}

export async function createStandardOrder(
  supabase: SupabaseClient,
  params: CreateStandardOrderParams
): Promise<{ data: OrderRow | null; error: string | null }> {
  const ticketGeneral = asPositiveInt(params.ticket_general);
  const ticketYouth = asPositiveInt(params.ticket_youth);
  const ticketFamily = asPositiveInt(params.ticket_family);
  const requestedPax = ticketGeneral + ticketYouth + ticketFamily;

  if (!params.visit_date || !params.visit_time || requestedPax <= 0) {
    return { data: null, error: "Missing required order fields" };
  }

  const customerEmail = normalizeEmail(params.customer_email);
  if (!customerEmail) {
    return { data: null, error: "Missing customer_email" };
  }

  const capacity = await validateCapacity(
    supabase,
    params.visit_date,
    params.visit_time,
    requestedPax
  ).catch(() => null);

  if (!capacity) {
    return { data: null, error: "Unable to validate hourly capacity" };
  }

  if (!capacity.allowed) {
    return {
      data: null,
      error: `This time slot has reached maximum capacity (${HOURLY_CAP}). Remaining: ${capacity.remaining}`,
    };
  }

  const insertPayload = cleanInsertPayload<OrderInsertInput>({
    customer_email: customerEmail,
    visit_date: params.visit_date,
    visit_time: params.visit_time,
    ticket_general: ticketGeneral,
    ticket_youth: ticketYouth,
    ticket_family: ticketFamily,
    total_amount: asPositiveInt(params.total_amount),
    status: params.status ?? "confirmed",
    agent_id: params.agent_id ?? undefined,
    agent_company: params.agent_company?.trim() || undefined,
  });

  const { data, error } = await supabase
    .from("orders")
    .insert(insertPayload)
    .select(
      "id, created_at, customer_email, agent_id, agent_name, agent_company, visit_date, visit_time, ticket_general, ticket_youth, ticket_family, total_tickets, total_amount, status, source"
    )
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const row = data as Partial<OrderRow> | null;

  return {
    data: row
      ? {
          id: row.id ?? "",
          created_at: row.created_at ?? new Date().toISOString(),
          customer_email: row.customer_email ?? customerEmail,
          agent_id: row.agent_id ?? null,
          agent_name: row.agent_name ?? null,
          agent_company: row.agent_company ?? null,
          request_type: row.request_type ?? null,
          group_size: row.group_size ?? null,
          notes: row.notes ?? null,
          admin_status: row.admin_status ?? null,
          admin_decision_reason: row.admin_decision_reason ?? null,
          suggested_times: row.suggested_times ?? null,
          visit_date: row.visit_date ?? params.visit_date,
          visit_time: row.visit_time ?? params.visit_time,
          ticket_general: row.ticket_general ?? ticketGeneral,
          ticket_youth: row.ticket_youth ?? ticketYouth,
          ticket_family: row.ticket_family ?? ticketFamily,
          total_tickets: row.total_tickets ?? ticketGeneral + ticketYouth + ticketFamily,
          total_amount: row.total_amount ?? asPositiveInt(params.total_amount),
          status: row.status ?? (params.status ?? "confirmed"),
          source: row.source ?? "web",
          source_type: row.source_type ?? null,
          source_id: row.source_id ?? null,
        }
      : null,
    error: null,
  };
}

export async function createGroupRequest(
  supabase: SupabaseClient,
  params: CreateGroupRequestParams
): Promise<{ data: GroupRequestInsertRow | null; error: string | null }> {
  const agentCompany = params.agent_company?.trim() || null;
  const agentId = params.agent_id ?? null;

  if (!agentId && !agentCompany) {
    return { data: null, error: "Either agent_id or agent_company is required" };
  }

  if (!params.agent_name.trim() || !params.agent_email.trim()) {
    return { data: null, error: "agent_name and agent_email are required" };
  }

  const insertPayload = cleanInsertPayload({
    agent_id: agentId,
    agent_company: agentCompany,
    agent_name: params.agent_name.trim(),
    agent_email: normalizeEmail(params.agent_email),
    customer_email: normalizeEmail(params.agent_email),
    visit_date: params.visit_date,
    preferred_visit_time: params.preferred_visit_time ?? params.visit_time,
    selected_visit_time: params.selected_visit_time ?? null,
    group_size: asPositiveInt(params.group_size),
    notes: params.notes?.trim() || null,
    status: params.status ?? "pending_admin_review",
    feasibility: params.feasibility ?? "not_feasible",
    suggested_times: params.suggested_times ?? [],
    admin_comment: params.admin_comment ?? null,
  });

  const { data, error } = await supabase
    .from("group_requests")
    .insert(insertPayload)
    .select(
      "id, created_at, agent_id, agent_company, agent_name, agent_email, customer_email, visit_date, preferred_visit_time, selected_visit_time, group_size, notes, status, feasibility, suggested_times, admin_comment"
    )
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as GroupRequestInsertRow, error: null };
}
