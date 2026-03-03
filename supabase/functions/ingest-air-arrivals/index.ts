// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type AviationstackFlight = {
  arrival?: {
    scheduled?: string | null;
  } | null;
  flight?: {
    iata?: string | null;
    number?: string | null;
  } | null;
  departure?: {
    iata?: string | null;
  } | null;
  aircraft?: {
    icao?: string | null;
    iata?: string | null;
  } | null;
};

type AviationstackResponse = {
  data?: AviationstackFlight[];
  error?: {
    code?: string | number;
    message?: string;
  };
};

type FlightArrivalInsert = {
  date: string;
  flight_number: string;
  origin: string | null;
  aircraft_type: string | null;
  is_widebody: boolean;
};

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };
const WIDEBODY_PATTERN = /(787|777|767|330|340|350)/;
const PAGE_LIMIT = 100;

function toDateOnly(value: string): string | null {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function withinNext30Days(scheduledIso: string, now: Date): boolean {
  const scheduled = new Date(scheduledIso);
  if (Number.isNaN(scheduled.getTime())) {
    return false;
  }

  const nowMs = now.getTime();
  const thirtyDaysFromNowMs = nowMs + 30 * 24 * 60 * 60 * 1000;
  const scheduledMs = scheduled.getTime();

  return scheduledMs >= nowMs && scheduledMs <= thirtyDaysFromNowMs;
}

function normalizeText(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

async function fetchAllScheduledArrivals(apiKey: string): Promise<{
  flights: AviationstackFlight[];
  error?: string;
}> {
  const allFlights: AviationstackFlight[] = [];
  let offset = 0;

  while (true) {
    const endpoint = new URL("http://api.aviationstack.com/v1/flights");
    endpoint.searchParams.set("access_key", apiKey);
    endpoint.searchParams.set("arr_iata", "KEF");
    endpoint.searchParams.set("limit", String(PAGE_LIMIT));
    endpoint.searchParams.set("offset", String(offset));

    let payload: AviationstackResponse;
    let status = 0;
    try {
      const res = await fetch(endpoint.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      status = res.status;
      if (!res.ok) {
        return { flights: allFlights, error: "Aviationstack request failed: HTTP " + String(res.status) };
      }

      payload = (await res.json()) as AviationstackResponse;
    } catch (error) {
      return {
        flights: allFlights,
        error: error instanceof Error ? error.message : String(error),
      };
    }

    console.log("[ingest-air-arrivals] Aviationstack page status: " + String(status) + " offset=" + String(offset));

    if (payload.error) {
      return {
        flights: allFlights,
        error: payload.error.message ?? "Aviationstack API error",
      };
    }

    const pageRows = Array.isArray(payload.data) ? payload.data : [];
    allFlights.push(...pageRows);

    if (pageRows.length < PAGE_LIMIT) {
      break;
    }

    offset += PAGE_LIMIT;
  }

  return { flights: allFlights };
}

Deno.serve(async () => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const apiKey = Deno.env.get("AVIATIONSTACK_API_KEY");

    console.log("[ingest-air-arrivals] AVIATIONSTACK_API_KEY defined: " + String(Boolean(apiKey)));

    if (!supabaseUrl || !serviceRoleKey || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or AVIATIONSTACK_API_KEY" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const fetched = await fetchAllScheduledArrivals(apiKey);
    if (fetched.error) {
      return new Response(
        JSON.stringify({ error: fetched.error }),
        { status: 502, headers: jsonHeaders }
      );
    }

    const rows = fetched.flights;
    const now = new Date();

    const deduped = new Map<string, FlightArrivalInsert>();

    for (const flight of rows) {
      const scheduled = normalizeText(flight.arrival?.scheduled ?? null);
      const flightNumber = normalizeText(flight.flight?.iata ?? flight.flight?.number ?? null);

      if (!scheduled || !flightNumber) {
        continue;
      }

      if (!withinNext30Days(scheduled, now)) {
        continue;
      }

      const date = toDateOnly(scheduled);
      if (!date) {
        continue;
      }

      const aircraftType = normalizeText(flight.aircraft?.icao ?? flight.aircraft?.iata ?? null);
      const isWidebody = aircraftType ? WIDEBODY_PATTERN.test(aircraftType) : false;

      const row: FlightArrivalInsert = {
        date,
        flight_number: flightNumber,
        origin: normalizeText(flight.departure?.iata ?? null),
        aircraft_type: aircraftType,
        is_widebody: isWidebody,
      };

      deduped.set(date + "__" + flightNumber, row);
    }

    const upsertPayload = Array.from(deduped.values());
    console.log("[ingest-air-arrivals] Records parsed for upsert: " + String(upsertPayload.length));

    if (upsertPayload.length === 0) {
      return new Response(
        JSON.stringify({
          inserted: 0,
          widebodies: 0,
          total_processed: 0,
        }),
        { status: 200, headers: jsonHeaders }
      );
    }

    const { data: upserted, error: upsertError } = await supabase
      .from("flight_arrivals")
      .upsert(upsertPayload, { onConflict: "date,flight_number" })
      .select("id, is_widebody");

    if (upsertError) {
      return new Response(
        JSON.stringify({ error: "flight_arrivals upsert failed: " + upsertError.message }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const inserted = (upserted ?? []).length;
    const widebodies = (upserted ?? []).filter((row) => row.is_widebody).length;

    return new Response(
      JSON.stringify({
        inserted,
        widebodies,
        total_processed: upsertPayload.length,
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
