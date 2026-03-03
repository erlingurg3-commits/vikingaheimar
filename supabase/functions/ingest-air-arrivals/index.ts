// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type NormalizedArrival = {
  scheduled: string;
  flightNumber: string;
  origin: string | null;
  aircraftType: string | null;
};

type ProviderResult = {
  provider: string;
  confidence: number;
  arrivals: NormalizedArrival[];
  error?: string;
};

type FlightArrivalInsert = {
  date: string;
  flight_number: string;
  origin: string | null;
  aircraft_type: string | null;
  is_widebody: boolean;
  provider: string;
  fetched_at: string;
  source_confidence: number;
};

type AviationstackFlight = {
  arrival?: { scheduled?: string | null } | null;
  flight?: { iata?: string | null; number?: string | null } | null;
  departure?: { iata?: string | null } | null;
  aircraft?: { icao?: string | null; iata?: string | null } | null;
};

type AviationstackResponse = {
  data?: AviationstackFlight[];
  error?: { code?: string | number; message?: string };
};

type FlightAwareArrival = {
  scheduled_on?: string | null;
  ident_iata?: string | null;
  ident?: string | null;
  origin?: {
    code_iata?: string | null;
    code?: string | null;
  } | null;
  aircraft_type?: string | null;
  actual_aircraft_type?: string | null;
};

type FlightAwareResponse = {
  arrivals?: FlightAwareArrival[];
  links?: {
    next?: string | null;
  };
};

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };
const WIDEBODY_PATTERN = /(787|777|767|330|340|350)/;
const PAGE_LIMIT = 100;
const DEFAULT_AIRPORT_IATA = "KEF";
const DEFAULT_KEF_ARRIVALS_URL = "https://www.kefairport.is/flug/komur";

function toDateOnly(value: string): string | null {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function normalizeText(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeFlightNumber(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  return normalized.replace(/\s+/g, "").toUpperCase();
}

function withinWindow(scheduledIso: string, nowMs: number, endMs: number): boolean {
  const scheduledMs = new Date(scheduledIso).getTime();
  if (Number.isNaN(scheduledMs)) {
    return false;
  }

  return scheduledMs >= nowMs && scheduledMs <= endMs;
}

async function fetchAviationstack(apiKey: string, airportIata: string): Promise<ProviderResult> {
  const arrivals: NormalizedArrival[] = [];
  let offset = 0;

  while (true) {
    const endpoint = new URL("http://api.aviationstack.com/v1/flights");
    endpoint.searchParams.set("access_key", apiKey);
    endpoint.searchParams.set("arr_iata", airportIata);
    endpoint.searchParams.set("limit", String(PAGE_LIMIT));
    endpoint.searchParams.set("offset", String(offset));

    let payload: AviationstackResponse;
    try {
      const response = await fetch(endpoint.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        return {
          provider: "aviationstack",
          confidence: 70,
          arrivals,
          error: "Aviationstack request failed: HTTP " + String(response.status),
        };
      }

      payload = (await response.json()) as AviationstackResponse;
    } catch (error) {
      return {
        provider: "aviationstack",
        confidence: 70,
        arrivals,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    if (payload.error) {
      return {
        provider: "aviationstack",
        confidence: 70,
        arrivals,
        error: payload.error.message ?? "Aviationstack API error",
      };
    }

    const pageRows = Array.isArray(payload.data) ? payload.data : [];
    for (const row of pageRows) {
      const scheduled = normalizeText(row.arrival?.scheduled ?? null);
      const flightNumber = normalizeFlightNumber(row.flight?.iata ?? row.flight?.number ?? null);

      if (!scheduled || !flightNumber) {
        continue;
      }

      arrivals.push({
        scheduled,
        flightNumber,
        origin: normalizeText(row.departure?.iata ?? null),
        aircraftType: normalizeText(row.aircraft?.icao ?? row.aircraft?.iata ?? null),
      });
    }

    if (pageRows.length < PAGE_LIMIT) {
      break;
    }

    offset += PAGE_LIMIT;
  }

  return {
    provider: "aviationstack",
    confidence: 70,
    arrivals,
  };
}

async function fetchFlightAware(apiKey: string, baseUrl: string, airportIata: string): Promise<ProviderResult> {
  const arrivals: NormalizedArrival[] = [];
  const start = new Date().toISOString();
  const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const normalizedBase = baseUrl.replace(/\/$/, "");
  let endpoint = new URL(`${normalizedBase}/airports/${airportIata}/flights/arrivals`);
  endpoint.searchParams.set("start", start);
  endpoint.searchParams.set("end", end);

  for (let page = 0; page < 10; page += 1) {
    let payload: FlightAwareResponse;
    try {
      const response = await fetch(endpoint.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "x-apikey": apiKey,
        },
      });

      if (!response.ok) {
        return {
          provider: "flightaware",
          confidence: 90,
          arrivals,
          error: "FlightAware request failed: HTTP " + String(response.status),
        };
      }

      payload = (await response.json()) as FlightAwareResponse;
    } catch (error) {
      return {
        provider: "flightaware",
        confidence: 90,
        arrivals,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    const pageRows = Array.isArray(payload.arrivals) ? payload.arrivals : [];
    for (const row of pageRows) {
      const scheduled = normalizeText(row.scheduled_on ?? null);
      const flightNumber = normalizeFlightNumber(row.ident_iata ?? row.ident ?? null);

      if (!scheduled || !flightNumber) {
        continue;
      }

      arrivals.push({
        scheduled,
        flightNumber,
        origin: normalizeText(row.origin?.code_iata ?? row.origin?.code ?? null),
        aircraftType: normalizeText(row.actual_aircraft_type ?? row.aircraft_type ?? null),
      });
    }

    const nextPath = normalizeText(payload.links?.next ?? null);
    if (!nextPath) {
      break;
    }

    endpoint = nextPath.startsWith("http")
      ? new URL(nextPath)
      : new URL(`${normalizedBase}${nextPath}`);
  }

  return {
    provider: "flightaware",
    confidence: 90,
    arrivals,
  };
}

function parseKefArrivalsFromHtml(html: string, referenceDateIso: string): NormalizedArrival[] {
  const arrivals: NormalizedArrival[] = [];
  const compact = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");

  const rowPattern = /(\d{1,2}:\d{2})(?:\s+\d{1,2}:\d{2})?\s+([^\d][^A-Z0-9]{0,8}.*?|.*?)\s+([A-Z0-9]{2,3}\d{2,5}[A-Z]?)\s+(?:Á\s+áætlun|Áætlað|Lent|Seinkun|Boarding|Estimated|Scheduled)/gi;

  for (const match of compact.matchAll(rowPattern)) {
    const time = normalizeText(match[1]);
    const originCandidate = normalizeText(match[2]);
    const flightNumber = normalizeFlightNumber(match[3]);

    if (!time || !flightNumber) {
      continue;
    }

    const hhmm = time.padStart(5, "0");
    const scheduled = `${referenceDateIso}T${hhmm}:00.000Z`;

    arrivals.push({
      scheduled,
      flightNumber,
      origin: originCandidate,
      aircraftType: null,
    });
  }

  return arrivals;
}

async function fetchKefAirportPage(url: string): Promise<ProviderResult> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      return {
        provider: "kefairport",
        confidence: 45,
        arrivals: [],
        error: "KEF arrivals page request failed: HTTP " + String(response.status),
      };
    }

    const html = await response.text();
    const todayIso = new Date().toISOString().slice(0, 10);
    const arrivals = parseKefArrivalsFromHtml(html, todayIso);

    return {
      provider: "kefairport",
      confidence: 45,
      arrivals,
      error: arrivals.length === 0 ? "No parseable arrivals found in KEF page response" : undefined,
    };
  } catch (error) {
    return {
      provider: "kefairport",
      confidence: 45,
      arrivals: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function fetchProviders(): Promise<{
  results: ProviderResult[];
  enabledProviders: string[];
}> {
  const airportIata = normalizeText(Deno.env.get("AIR_ARRIVALS_AIRPORT_IATA")) ?? DEFAULT_AIRPORT_IATA;
  const configured = (normalizeText(Deno.env.get("AIR_ARRIVALS_PROVIDERS")) ?? "flightaware,aviationstack,kefairport")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const enabledProviders: string[] = [];
  const results: ProviderResult[] = [];

  for (const provider of configured) {
    if (provider === "flightaware") {
      const apiKey = normalizeText(Deno.env.get("FLIGHTAWARE_API_KEY"));
      const baseUrl = normalizeText(Deno.env.get("FLIGHTAWARE_BASE_URL")) ?? "https://aeroapi.flightaware.com/aeroapi";
      if (!apiKey) {
        continue;
      }

      enabledProviders.push(provider);
      results.push(await fetchFlightAware(apiKey, baseUrl, airportIata));
      continue;
    }

    if (provider === "aviationstack") {
      const apiKey = normalizeText(Deno.env.get("AVIATIONSTACK_API_KEY"));
      if (!apiKey) {
        continue;
      }

      enabledProviders.push(provider);
      results.push(await fetchAviationstack(apiKey, airportIata));
      continue;
    }

    if (provider === "kefairport") {
      const url = normalizeText(Deno.env.get("KEF_ARRIVALS_URL")) ?? DEFAULT_KEF_ARRIVALS_URL;
      enabledProviders.push(provider);
      results.push(await fetchKefAirportPage(url));
    }
  }

  return { results, enabledProviders };
}

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const fetched = await fetchProviders();
    if (fetched.enabledProviders.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No provider credentials configured. Set FLIGHTAWARE_API_KEY and/or AVIATIONSTACK_API_KEY",
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const providerErrors = fetched.results
      .filter((result) => result.error)
      .map((result) => ({ provider: result.provider, error: result.error }));

    const nowMs = Date.now();
    const endMs = nowMs + 30 * 24 * 60 * 60 * 1000;
    const fetchedAt = new Date(nowMs).toISOString();

    const providerPriority = new Map<string, number>();
    fetched.enabledProviders.forEach((name, index) => {
      providerPriority.set(name, index);
    });

    const deduped = new Map<string, FlightArrivalInsert & { _priority: number }>();

    for (const result of fetched.results) {
      const priority = providerPriority.get(result.provider) ?? 999;

      for (const arrival of result.arrivals) {
        if (!withinWindow(arrival.scheduled, nowMs, endMs)) {
          continue;
        }

        const date = toDateOnly(arrival.scheduled);
        if (!date) {
          continue;
        }

        const flightNumber = normalizeFlightNumber(arrival.flightNumber);
        if (!flightNumber) {
          continue;
        }

        const aircraftType = normalizeText(arrival.aircraftType);
        const row: FlightArrivalInsert & { _priority: number } = {
          date,
          flight_number: flightNumber,
          origin: normalizeText(arrival.origin),
          aircraft_type: aircraftType,
          is_widebody: aircraftType ? WIDEBODY_PATTERN.test(aircraftType) : false,
          provider: result.provider,
          fetched_at: fetchedAt,
          source_confidence: result.confidence,
          _priority: priority,
        };

        const key = `${date}__${flightNumber}`;
        const existing = deduped.get(key);
        if (!existing || row._priority < existing._priority) {
          deduped.set(key, row);
        }
      }
    }

    const upsertPayload = Array.from(deduped.values()).map(({ _priority, ...row }) => row);

    if (upsertPayload.length === 0) {
      return new Response(
        JSON.stringify({
          inserted: 0,
          widebodies: 0,
          total_processed: 0,
          enabled_providers: fetched.enabledProviders,
          provider_errors: providerErrors,
        }),
        { status: 200, headers: jsonHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    let upserted: Array<{ id: string; is_widebody: boolean }> | null = null;

    const enrichedUpsert = await supabase
      .from("flight_arrivals")
      .upsert(upsertPayload, { onConflict: "date,flight_number" })
      .select("id, is_widebody");

    if (!enrichedUpsert.error) {
      upserted = (enrichedUpsert.data ?? []) as Array<{ id: string; is_widebody: boolean }>;
    } else {
      const errorMessage = String(enrichedUpsert.error.message ?? "").toLowerCase();
      const missingProvenanceColumns =
        errorMessage.includes("provider") ||
        errorMessage.includes("fetched_at") ||
        errorMessage.includes("source_confidence");

      if (!missingProvenanceColumns) {
        return new Response(
          JSON.stringify({ error: "flight_arrivals upsert failed: " + enrichedUpsert.error.message }),
          { status: 500, headers: jsonHeaders }
        );
      }

      const legacyPayload = upsertPayload.map((row) => ({
        date: row.date,
        flight_number: row.flight_number,
        origin: row.origin,
        aircraft_type: row.aircraft_type,
        is_widebody: row.is_widebody,
      }));

      const legacyUpsert = await supabase
        .from("flight_arrivals")
        .upsert(legacyPayload, { onConflict: "date,flight_number" })
        .select("id, is_widebody");

      if (legacyUpsert.error) {
        return new Response(
          JSON.stringify({ error: "flight_arrivals legacy upsert failed: " + legacyUpsert.error.message }),
          { status: 500, headers: jsonHeaders }
        );
      }

      upserted = (legacyUpsert.data ?? []) as Array<{ id: string; is_widebody: boolean }>;
    }

    const inserted = (upserted ?? []).length;
    const widebodies = (upserted ?? []).filter((row) => row.is_widebody).length;

    return new Response(
      JSON.stringify({
        inserted,
        widebodies,
        total_processed: upsertPayload.length,
        enabled_providers: fetched.enabledProviders,
        provider_errors: providerErrors,
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
