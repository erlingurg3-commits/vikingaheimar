// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SourceConfig = {
  source: string;
  embedUrl: string;
  eventsUrl: string;
  portCode: "REK";
  portName: string;
};

type ParsedCall = {
  vesselName: string;
  paxCapacity: number | null;
  crewCapacity: number | null;
  eta: string;
  etd: string | null;
  berth: string | null;
  status: string;
  sourceRef: string;
  rawPayload: Record<string, unknown>;
};

type PortRow = {
  id: string;
  code: string;
};

type VesselRow = {
  id: string;
  normalized_name: string;
};

type DokkEvent = {
  id?: number;
  arrival?: string;
  departure?: string;
  location_name?: string;
  vessel_name?: string;
  vessel_passengers?: number;
  status?: string;
  port_name?: string;
  [key: string]: unknown;
};

const DEFAULT_DOKK_EMBED_URL = "https://portal.dokk.is/embed/calendar/5";
const DEFAULT_DOKK_EVENTS_URL = "https://dokk-backend.azurewebsites.net/api/v1/calendar/port/5/";

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeVesselName(value: string): string {
  return normalizeText(value).toLowerCase();
}

function toIsoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function normalizePortCallStatus(value: string): string {
  const normalized = normalizeText(value).toLowerCase();
  if (["scheduled", "arrived", "departed", "cancelled"].includes(normalized)) {
    return normalized;
  }

  return "scheduled";
}

function normalizeDokkEvents(source: SourceConfig, events: DokkEvent[]): ParsedCall[] {
  const rows: ParsedCall[] = [];

  for (const event of events) {
    const eventId = typeof event.id === "number" ? String(event.id) : null;
    const vesselName = normalizeText(String(event.vessel_name ?? ""));
    const eta = toIsoOrNull(event.arrival);
    if (!eventId || !vesselName || !eta) {
      continue;
    }

    const berth = normalizeText(String(event.location_name ?? "")) || null;
    const etd = toIsoOrNull(event.departure);
    const pax = Number(event.vessel_passengers);
    const crew = Number(event.vessel_crew);
    const sourceStatus = normalizeText(String(event.status ?? "scheduled")) || "scheduled";

    rows.push({
      vesselName,
      paxCapacity: Number.isFinite(pax) ? pax : null,
      crewCapacity: Number.isFinite(crew) ? crew : null,
      eta,
      etd,
      berth,
      status: sourceStatus,
      sourceRef: eventId,
      rawPayload: {
        id: eventId,
        status: sourceStatus,
        port_name: event.port_name ?? null,
        location_name: event.location_name ?? null,
        vessel_passengers: Number.isFinite(pax) ? pax : null,
        vessel_crew: Number.isFinite(crew) ? crew : null,
      },
    });
  }

  return rows;
}

async function fetchDokkEvents(source: SourceConfig): Promise<{
  calls: ParsedCall[];
  bytesFetched: number;
  eventsFound: number;
  sample: ParsedCall[];
  error?: string;
}> {
  try {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      start_date: now.toISOString().slice(0, 10),
      end_date: windowEnd.toISOString().slice(0, 10),
      port: "1",
      location: "",
      vessel: "",
    });

    const endpoint = `${source.eventsUrl}?${params.toString()}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Referer: source.embedUrl,
        Origin: "https://portal.dokk.is",
        "User-Agent": "vikingaheimar-cruise-intelligence/1.0",
      },
    });

    const body = await response.text();
    const bytesFetched = new TextEncoder().encode(body).length;

    if (!response.ok) {
      return {
        calls: [],
        bytesFetched,
        eventsFound: 0,
        sample: [],
        error: `HTTP ${response.status}`,
      };
    }

    const parsed = JSON.parse(body) as unknown;
    const events = Array.isArray(parsed) ? (parsed as DokkEvent[]) : [];
    const calls = normalizeDokkEvents(source, events);

    return {
      calls,
      bytesFetched,
      eventsFound: events.length,
      sample: calls.slice(0, 3),
    };
  } catch (error) {
    return {
      calls: [],
      bytesFetched: 0,
      eventsFound: 0,
      sample: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

Deno.serve(async () => {
  const startedAt = Date.now();

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      }),
      { status: 500, headers: jsonHeaders }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const sources: SourceConfig[] = [{
    source: "dokk",
    embedUrl: Deno.env.get("CRUISE_SOURCE_REYKJAVIK_URL") ?? DEFAULT_DOKK_EMBED_URL,
    eventsUrl: Deno.env.get("CRUISE_DOKK_EVENTS_URL") ?? DEFAULT_DOKK_EVENTS_URL,
    portCode: "REK",
    portName: "Reykjavik Harbour",
  }];

  const logs: Array<Record<string, unknown>> = [];

  try {
    const { data: portsData, error: portsError } = await supabase
      .from("ports")
      .upsert(
        sources.map((source) => ({
          code: source.portCode,
          name: source.portName,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "code" }
      )
      .select("id, code");

    if (portsError) {
      throw new Error(`ports upsert failed: ${portsError.message}`);
    }

    const portMap = new Map<string, PortRow>();
    for (const row of (portsData ?? []) as PortRow[]) {
      portMap.set(row.code, row);
    }

    const collected: Array<{ source: SourceConfig; call: ParsedCall }> = [];

    for (const source of sources) {
      const result = await fetchDokkEvents(source);
      logs.push({
        source: source.source,
        embed_url: source.embedUrl,
        events_url: source.eventsUrl,
        bytes_fetched: result.bytesFetched,
        events_returned: result.eventsFound,
        normalized_calls: result.calls.length,
        sample_calls: result.sample,
        error: result.error ?? null,
      });

      for (const call of result.calls) {
        collected.push({ source, call });
      }
    }

    if (collected.length === 0) {
      return new Response(
        JSON.stringify({
          ok: true,
          ingested_calls: 0,
          scored: 0,
          duration_ms: Date.now() - startedAt,
          logs,
        }),
        { status: 200, headers: jsonHeaders }
      );
    }

    const vesselsPayload = Array.from(
      new Map(
        collected.map(({ call }) => {
          const normalized = normalizeVesselName(call.vesselName);
          return [
            normalized,
            {
              name: call.vesselName,
              normalized_name: normalized,
              cruise_line: call.cruiseLine,
              updated_at: new Date().toISOString(),
            },
          ];
        })
      ).values()
    );

    const { data: vesselData, error: vesselsError } = await supabase
      .from("vessels")
      .upsert(vesselsPayload, { onConflict: "normalized_name" })
      .select("id, normalized_name");

    if (vesselsError) {
      throw new Error(`vessels upsert failed: ${vesselsError.message}`);
    }

    const vesselMap = new Map<string, VesselRow>();
    for (const row of (vesselData ?? []) as VesselRow[]) {
      vesselMap.set(row.normalized_name, row);
    }

    const nowIso = new Date().toISOString();

    const portCallPayload = collected
      .map(({ source, call }) => {
        const vessel = vesselMap.get(normalizeVesselName(call.vesselName));
        const port = portMap.get(source.portCode);

        if (!vessel || !port) {
          return null;
        }

        return {
          source: source.source,
          source_ref: call.sourceRef,
          port_id: port.id,
          vessel_id: vessel.id,
          vessel_name_raw: call.vesselName,
          cruise_line: null,
          berth: call.berth,
          eta: call.eta,
          etd: call.etd,
          pax_estimate: call.paxCapacity,
          status: normalizePortCallStatus(call.status),
          raw_payload: {
            ...call.rawPayload,
            source_status: call.status,
            crew_capacity: call.crewCapacity,
          },
          ingested_at: nowIso,
          updated_at: nowIso,
        };
      })
      .filter((row): row is NonNullable<typeof row> => Boolean(row));

    const { data: upsertedRows, error: callsError } = await supabase
      .from("port_calls")
      .upsert(portCallPayload, { onConflict: "source_ref" })
      .select("id, source_ref");

    if (callsError) {
      throw new Error(`port_calls upsert failed: ${callsError.message}`);
    }

    logs.push({
      source: "dokk",
      events_returned: collected.length,
      normalized: portCallPayload.length,
      inserted: (upsertedRows ?? []).length,
      sample_records: portCallPayload.slice(0, 3).map((row) => ({
        source_ref: row.source_ref,
        vessel_name_raw: row.vessel_name_raw,
        eta: row.eta,
        etd: row.etd,
        berth: row.berth,
        status: row.status,
      })),
    });

    const ninetyDaysOutIso = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: scored, error: scoringError } = await supabase.rpc("recompute_cruise_opportunities", {
      p_window_start: nowIso,
      p_window_end: ninetyDaysOutIso,
    });

    if (scoringError) {
      throw new Error(`opportunity scoring failed: ${scoringError.message}`);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        ingested_calls: (upsertedRows ?? []).length,
        scored: scored ?? 0,
        duration_ms: Date.now() - startedAt,
        logs,
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    logs.push({
      level: "fatal",
      error: error instanceof Error ? error.message : String(error),
    });

    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        duration_ms: Date.now() - startedAt,
        logs,
      }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
