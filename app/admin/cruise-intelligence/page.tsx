import { supabaseAdmin } from "@/lib/supabase-admin";
import CruiseIntelligenceTable from "./CruiseIntelligenceTable";
import CruiseIntelligenceKpiStrip from "./CruiseIntelligenceKpiStrip";
import type { CruiseCRMListRow } from "./cruise-intelligence-types";
import Link from "next/link";

type SearchParams = {
  port?: string;
  status?: string;
  q?: string;
  from?: string;
  to?: string;
  min_pax?: string;
  min_score?: string;
};

type PortOption = {
  id: string;
  code: string;
  name: string;
};

export const dynamic = "force-dynamic";

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function toUtcStartIso(dateInput: string) {
  const parsed = new Date(`${dateInput}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
}

function toUtcEndIso(dateInput: string) {
  const parsed = new Date(`${dateInput}T23:59:59.999Z`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  }
  return parsed.toISOString();
}

function parseNonNegativeInt(value: string | undefined) {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export default async function CruiseIntelligencePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolved = (await searchParams) ?? {};
  const selectedPort = (resolved.port ?? "all").trim();
  const selectedStatus = (resolved.status ?? "all").trim();
  const vesselQuery = (resolved.q ?? "").trim();
  const defaultFrom = toDateInput(new Date());
  const defaultTo = toDateInput(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const selectedFrom = (resolved.from ?? defaultFrom).trim();
  const selectedTo = (resolved.to ?? defaultTo).trim();
  const minPax = parseNonNegativeInt(resolved.min_pax);
  const minScore = parseNonNegativeInt(resolved.min_score);

  const startIso = toUtcStartIso(selectedFrom);
  const endIso = toUtcEndIso(selectedTo);

  const { data: portsData } = await supabaseAdmin
    .from("ports")
    .select("id, code, name")
    .order("name", { ascending: true });

  const ports = (portsData ?? []) as PortOption[];

  let query = supabaseAdmin
    .from("cruise_intelligence_with_crm")
    .select(
      "cruise_call_id, source, source_ref, port_name, vessel_id, vessel_name, cruise_line, eta, etd, pax_estimate, cruise_call_status, season_year, opportunity_score, lead_id, lead_status, owner_user_id, handler_override, suggestion_source, resolved_travel_agency_id, resolved_travel_agency_name, mapping_confidence, handler_confidence, value_estimate_isk, probability, primary_contact_id, primary_contact_name, primary_contact_role, primary_contact_email, primary_contact_phone, next_follow_up_at, last_activity_summary, last_activity_at"
    )
    .gte("eta", startIso)
    .lte("eta", endIso)
    .order("eta", { ascending: true })
    .limit(500);

  if (selectedStatus !== "all") {
    query = query.eq("cruise_call_status", selectedStatus);
  }

  if (selectedPort !== "all") {
    const foundPort = ports.find((port) => port.code === selectedPort);
    if (foundPort) {
      query = query.eq("port_name", foundPort.name);
    }
  }

  if (vesselQuery) {
    query = query.ilike("vessel_name", `%${vesselQuery}%`);
  }

  if (minPax !== null) {
    query = query.gte("pax_estimate", minPax);
  }

  if (minScore !== null) {
    query = query.gte("opportunity_score", minScore);
  }

  const { data, error } = await query;

  const rows: CruiseCRMListRow[] = ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    return {
      cruise_call_id: String(row.cruise_call_id ?? ""),
      source: String(row.source ?? ""),
      source_ref: String(row.source_ref ?? ""),
      eta: String(row.eta ?? ""),
      etd: (row.etd as string | null) ?? null,
      pax_estimate: typeof row.pax_estimate === "number" ? row.pax_estimate : null,
      cruise_call_status: String(row.cruise_call_status ?? "scheduled"),
      cruise_line: (row.cruise_line as string | null) ?? null,
      vessel_name: String(row.vessel_name ?? "Unknown"),
      vessel_id: String(row.vessel_id ?? ""),
      port_name: String(row.port_name ?? "Unknown"),
      season_year: typeof row.season_year === "number" ? row.season_year : new Date().getUTCFullYear(),
      opportunity_score: typeof row.opportunity_score === "number" ? row.opportunity_score : 0,
      lead_id: (row.lead_id as string | null) ?? null,
      lead_status: (row.lead_status as CruiseCRMListRow["lead_status"]) ?? null,
      owner_user_id: (row.owner_user_id as string | null) ?? null,
      handler_override: Boolean(row.handler_override),
      suggestion_source: (row.suggestion_source as CruiseCRMListRow["suggestion_source"]) ?? "none",
      resolved_travel_agency_id: (row.resolved_travel_agency_id as string | null) ?? null,
      resolved_travel_agency_name: (row.resolved_travel_agency_name as string | null) ?? null,
      mapping_confidence: (row.mapping_confidence as CruiseCRMListRow["mapping_confidence"]) ?? null,
      handler_confidence: (row.handler_confidence as CruiseCRMListRow["handler_confidence"]) ?? null,
      value_estimate_isk: typeof row.value_estimate_isk === "number" ? row.value_estimate_isk : null,
      probability: typeof row.probability === "number" ? row.probability : null,
      primary_contact_id: (row.primary_contact_id as string | null) ?? null,
      primary_contact_name: (row.primary_contact_name as string | null) ?? null,
      primary_contact_role: (row.primary_contact_role as string | null) ?? null,
      primary_contact_email: (row.primary_contact_email as string | null) ?? null,
      primary_contact_phone: (row.primary_contact_phone as string | null) ?? null,
      next_follow_up_at: (row.next_follow_up_at as string | null) ?? null,
      last_activity_summary: (row.last_activity_summary as string | null) ?? null,
      last_activity_at: (row.last_activity_at as string | null) ?? null,
    };
  });

  return (
    <main className="min-h-screen bg-[#0b0e12] text-white px-6 py-10 space-y-6">
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">Cruise Intelligence</h1>
            <p className="text-sm text-gray-400">
              90-day forecast of cruise calls for Reykjavik and Reykjanes with opportunity scoring.
            </p>
          </div>
          <Link
            href="/control-room"
            className="rounded-md border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
          >
            Back to Control Room
          </Link>
        </div>
      </header>

      <form className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
        <select
          name="port"
          defaultValue={selectedPort}
          className="h-10 rounded-md border border-white/20 bg-[#10141a] px-3 text-sm"
        >
          <option value="all">All Ports</option>
          {ports.map((port) => (
            <option key={port.id} value={port.code}>
              {port.name}
            </option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={selectedStatus}
          className="h-10 rounded-md border border-white/20 bg-[#10141a] px-3 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="arrived">Arrived</option>
          <option value="departed">Departed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          name="q"
          defaultValue={vesselQuery}
          placeholder="Search vessel"
          className="h-10 rounded-md border border-white/20 bg-[#10141a] px-3 text-sm"
        />

        <input
          name="from"
          defaultValue={selectedFrom}
          type="date"
          className="h-10 rounded-md border border-white/20 bg-[#10141a] px-3 text-sm"
        />

        <input
          name="to"
          defaultValue={selectedTo}
          type="date"
          className="h-10 rounded-md border border-white/20 bg-[#10141a] px-3 text-sm"
        />

        <input
          name="min_pax"
          defaultValue={minPax ?? ""}
          type="number"
          min={0}
          placeholder="Min pax"
          className="h-10 rounded-md border border-white/20 bg-[#10141a] px-3 text-sm"
        />

        <input
          name="min_score"
          defaultValue={minScore ?? ""}
          type="number"
          min={0}
          max={100}
          placeholder="Min score"
          className="h-10 rounded-md border border-white/20 bg-[#10141a] px-3 text-sm"
        />

        <button
          type="submit"
          className="md:col-span-4 xl:col-span-7 h-10 rounded-md border border-emerald-400/30 bg-emerald-500/15 text-emerald-100 text-sm font-medium hover:bg-emerald-500/25"
        >
          Apply Filters
        </button>
      </form>

      {error ? <p className="text-sm text-red-300">{error.message}</p> : null}

      <CruiseIntelligenceKpiStrip rows={rows} />

      <CruiseIntelligenceTable rows={rows} />
    </main>
  );
}
