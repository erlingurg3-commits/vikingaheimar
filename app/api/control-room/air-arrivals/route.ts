import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DemandRowRich = {
  date: string;
  score: number | null;
  score_level: string | null;
  confidence: number | null;
  cruise_pax: number | null;
  air_arrivals: number | null;
  flights: number | null;
  widebodies: number | null;
};

type DemandRowLegacy = {
  date: string;
  score: number | null;
  level: string | null;
  cruise_pax: number | null;
  flights: number | null;
  widebodies: number | null;
};

type FlightArrivalRow = {
  date: string;
  flight_number: string | null;
  origin: string | null;
  aircraft_type: string | null;
  is_widebody: boolean | null;
  provider: string | null;
  source_confidence: number | null;
  status_text?: string | null;
};

type IsaviaSnapshot = {
  flightsLeftToday: number | null;
  bagsOnBelt: number | null;
  source: "isavia-live" | "unavailable";
  arrivals: FlightArrivalRow[];
};

type AirArrivalsResponse = {
  ok: true;
  totals: {
    flights7d: number;
    airArrivals7d: number;
    widebodies7d: number;
    avgConfidence: number;
  };
  isavia: IsaviaSnapshot;
  demandDays: DemandRowRich[];
  arrivals: FlightArrivalRow[];
  topOrigins: Array<{ origin: string; flights: number }>;
};

const ISAVIA_KEF_ARRIVALS_URL = "https://www.kefairport.is/api/flightData";

type IsaviaFlightDataResponse = {
  ok?: boolean;
  value?: IsaviaFlightDataRow[];
};

type IsaviaFlightDataRow = {
  destination?: string | null;
  flightNumber?: string | null;
  status?: string | null;
  belt?: string | null;
  arrival?: boolean | null;
  date?: string | null;
};

const AIR_ARRIVALS_CACHE_TTL_MS = 5 * 60 * 1000;
let airArrivalsCache: { expiresAt: number; payload: AirArrivalsResponse } | null = null;

function toInt(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function toPercent(value: number, max = 100): number {
  return Math.max(0, Math.min(max, Math.round(value)));
}

function normalizeText(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function estimateAirArrivals(flights: number, widebodies: number): number {
  return Math.max(0, (flights - widebodies) * 180 + widebodies * 300);
}

function getReykjavikDateKey(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Atlantic/Reykjavik",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function getReykjavikNow(): Date {
  const now = new Date();
  const local = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Atlantic/Reykjavik",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  return new Date(local.replace(" ", "T") + "Z");
}

function toReykjavikDateKeyFromIso(iso: string | null | undefined, fallbackDate: string): string {
  if (!iso) {
    return fallbackDate;
  }

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackDate;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Atlantic/Reykjavik",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);

  const year = parts.find((part) => part.type === "year")?.value ?? fallbackDate.slice(0, 4);
  const month = parts.find((part) => part.type === "month")?.value ?? fallbackDate.slice(5, 7);
  const day = parts.find((part) => part.type === "day")?.value ?? fallbackDate.slice(8, 10);

  return `${year}-${month}-${day}`;
}

function toIsaviaStatusText(rawStatus: string | null | undefined): string {
  const status = (rawStatus ?? "").trim().toUpperCase();

  if (!status || status === "NOSTATUS" || status === "ON" || status === "ONTIME" || status === "SCH" || status === "SCHEDULED") {
    return "Á áætlun";
  }

  if (status === "EST") {
    return "Áætlað";
  }

  if (status === "ARR" || status === "ARRIVED" || status === "LANDED" || status === "LND" || status === "ATA") {
    return "Lent";
  }

  if (status === "BELT" || status === "BAG") {
    return "Töskur á belti";
  }

  if (status === "LBB") {
    return "Töskur á belti";
  }

  if (status === "DEL" || status === "DELAYED") {
    return "Seinkun";
  }

  if (status === "CNL" || status === "CANCELLED") {
    return "Fellt niður";
  }

  if (status === "ATD" || status === "DEP" || status === "DEPARTED") {
    return "Farin";
  }

  return status;
}

function isUpcomingStatus(statusText: string | null | undefined): boolean {
  const status = normalizeText(statusText);
  return (
    status === "a aaetlun" ||
    status === "aaetlad" ||
    status === "seinkun" ||
    status === "delayed" ||
    status === "estimated"
  );
}

async function getIsaviaSnapshot(): Promise<IsaviaSnapshot> {
  try {
    const today = getReykjavikDateKey();
    const now = getReykjavikNow();
    const response = await fetch(`${ISAVIA_KEF_ARRIVALS_URL}?date=${today}T00:00:00.000Z&cargo=false&type=arrivals&search=`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; VikingaheimarControlRoom/1.0)",
      },
    });

    if (!response.ok) {
      return { flightsLeftToday: null, bagsOnBelt: null, source: "unavailable", arrivals: [] };
    }

    const payload = (await response.json()) as IsaviaFlightDataResponse;
    const rows = Array.isArray(payload.value) ? payload.value : [];
    const arrivalsOnly = rows
      .filter((row) => row.arrival === true)
      .map((row) => {
        const normalizedStatus = toIsaviaStatusText(row.status);
        const scheduledAt = row.date ? new Date(row.date) : null;
        const rowDate = toReykjavikDateKeyFromIso(row.date, today);

        return {
          date: rowDate,
          flight_number: (row.flightNumber ?? "").trim().toUpperCase() || null,
          origin: (row.destination ?? "").trim() || null,
          aircraft_type: null,
          is_widebody: null,
          provider: "isavia",
          source_confidence: 100,
          status_text: normalizedStatus,
          scheduledAt,
        };
      })
      .filter((row) => row.flight_number && row.origin);

    const uniqueRows = Array.from(
      new Map(arrivalsOnly.map((row) => [row.flight_number, row])).values(),
    ).sort((a, b) => {
      const aTime = a.scheduledAt ? a.scheduledAt.getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.scheduledAt ? b.scheduledAt.getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

    const pendingStatuses = new Set(["Á ÁÆTLUN", "ÁÆTLAÐ", "SEINKUN"]);
    const flightsLeftToday = uniqueRows.reduce((count, row) => {
      const status = (row.status_text ?? "").toUpperCase();
      const isToday = row.date === today;
      const isPendingByStatus = pendingStatuses.has(status);
      const isPendingByTime = row.scheduledAt ? row.scheduledAt >= now : false;
      return count + (isToday && (isPendingByStatus || isPendingByTime) ? 1 : 0);
    }, 0);

    const bagsOnBelt = uniqueRows.filter((row) => {
      const status = (row.status_text ?? "").toUpperCase();
      return status === "TÖSKUR Á BELTI";
    }).length;

    const arrivals = uniqueRows.map((row) => ({
      date: row.date,
      flight_number: row.flight_number,
      origin: row.origin,
      aircraft_type: null,
      is_widebody: null,
      provider: "isavia",
      source_confidence: 100,
      status_text: row.status_text,
    }));

    if (arrivals.length === 0) {
      return { flightsLeftToday: null, bagsOnBelt: null, source: "unavailable", arrivals: [] };
    }

    return {
      flightsLeftToday,
      bagsOnBelt,
      source: "isavia-live",
      arrivals,
    };
  } catch {
    return { flightsLeftToday: null, bagsOnBelt: null, source: "unavailable", arrivals: [] };
  }
}

export async function GET(req: Request) {
  try {
    const useFresh = new URL(req.url).searchParams.get("fresh");
    const bypassCache = useFresh === "1" || useFresh === "true";
    if (!bypassCache && airArrivalsCache && airArrivalsCache.expiresAt > Date.now()) {
      return Response.json(airArrivalsCache.payload, { status: 200 });
    }

    const today = getReykjavikDateKey();

    let demandRows: DemandRowRich[] = [];

    const richQuery = await supabaseAdmin
      .from("demand_days")
      .select("date, score, score_level, confidence, cruise_pax, air_arrivals, flights, widebodies")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(14);

    if (!richQuery.error) {
      demandRows = (richQuery.data ?? []) as DemandRowRich[];
    } else {
      const fallbackQuery = await supabaseAdmin
        .from("demand_days")
        .select("date, score, level, cruise_pax, flights, widebodies")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(14);

      if (fallbackQuery.error) {
        return Response.json({ ok: false, message: fallbackQuery.error.message }, { status: 500 });
      }

      demandRows = ((fallbackQuery.data ?? []) as DemandRowLegacy[]).map((row) => {
        const flights = toInt(row.flights);
        const widebodies = toInt(row.widebodies);
        const estimatedAirArrivals = Math.max(0, (flights - widebodies) * 180 + widebodies * 300);

        return {
          date: row.date,
          score: row.score,
          score_level: row.level ?? "NORMAL",
          confidence: null,
          cruise_pax: row.cruise_pax,
          air_arrivals: estimatedAirArrivals,
          flights,
          widebodies,
        };
      });
    }

    let arrivals: FlightArrivalRow[] = [];

    const richFlightsQuery = await supabaseAdmin
      .from("flight_arrivals")
      .select("date, flight_number, origin, aircraft_type, is_widebody, provider, source_confidence")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(100);

    if (!richFlightsQuery.error) {
      arrivals = (richFlightsQuery.data ?? []) as FlightArrivalRow[];
    } else {
      const fallbackFlightsQuery = await supabaseAdmin
        .from("flight_arrivals")
        .select("date, flight_number, origin, aircraft_type, is_widebody")
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(100);

      if (fallbackFlightsQuery.error) {
        return Response.json({ ok: false, message: fallbackFlightsQuery.error.message }, { status: 500 });
      }

      arrivals = ((fallbackFlightsQuery.data ?? []) as Omit<FlightArrivalRow, "provider" | "source_confidence">[]).map(
        (row) => ({
          ...row,
          provider: null,
          source_confidence: null,
          status_text: null,
        })
      );
    }

    const flightsByDate = new Map<string, number>();
    const widebodiesByDate = new Map<string, number>();

    for (const row of arrivals) {
      const date = row.date;
      flightsByDate.set(date, (flightsByDate.get(date) ?? 0) + 1);

      if (Boolean(row.is_widebody)) {
        widebodiesByDate.set(date, (widebodiesByDate.get(date) ?? 0) + 1);
      }
    }

    demandRows = demandRows.map((row) => {
      const dbFlights = toInt(row.flights);
      const dbWidebodies = toInt(row.widebodies);
      const flightRowsCount = flightsByDate.get(row.date);
      const widebodyRowsCount = widebodiesByDate.get(row.date);

      const flights = flightRowsCount ?? dbFlights;
      const widebodies = Math.min(flights, widebodyRowsCount ?? dbWidebodies);
      const airArrivals = estimateAirArrivals(flights, widebodies);

      return {
        ...row,
        flights,
        widebodies,
        air_arrivals: airArrivals,
      };
    });

    const effectiveIsavia = await getIsaviaSnapshot();

    const todayIndex = demandRows.findIndex((row) => row.date === today);
    if (todayIndex >= 0 && effectiveIsavia.flightsLeftToday !== null) {
      const current = demandRows[todayIndex];
      demandRows[todayIndex] = {
        ...current,
        flights: effectiveIsavia.flightsLeftToday,
        widebodies: Math.min(toInt(current.widebodies), effectiveIsavia.flightsLeftToday),
      };
    }

    let arrivalsForPanel = arrivals.slice(0, 30);
    if (effectiveIsavia.arrivals.length > 0) {
      const isaviaUpcoming = effectiveIsavia.arrivals.filter((row) => isUpcomingStatus(row.status_text));
      arrivalsForPanel = (isaviaUpcoming.length > 0 ? isaviaUpcoming : effectiveIsavia.arrivals).slice(0, 30);
    }

    const totals = {
      flights7d: demandRows.slice(0, 7).reduce((sum, row) => sum + toInt(row.flights), 0),
      airArrivals7d: demandRows.slice(0, 7).reduce((sum, row) => sum + toInt(row.air_arrivals), 0),
      widebodies7d: demandRows.slice(0, 7).reduce((sum, row) => sum + toInt(row.widebodies), 0),
      avgConfidence: demandRows.length
        ? toPercent(demandRows.reduce((sum, row) => sum + toInt(row.confidence), 0) / demandRows.length)
        : 0,
    };

    const originMap = new Map<string, number>();
    for (const row of arrivalsForPanel) {
      const origin = (row.origin ?? "Unknown").trim() || "Unknown";
      originMap.set(origin, (originMap.get(origin) ?? 0) + 1);
    }

    const topOrigins = Array.from(originMap.entries())
      .map(([origin, flights]) => ({ origin, flights }))
      .sort((a, b) => b.flights - a.flights)
      .slice(0, 6);

    const payload: AirArrivalsResponse = {
      ok: true,
      totals,
      isavia: effectiveIsavia,
      demandDays: demandRows,
      arrivals: arrivalsForPanel,
      topOrigins,
    };

    airArrivalsCache = {
      expiresAt: Date.now() + AIR_ARRIVALS_CACHE_TTL_MS,
      payload,
    };

    return Response.json(payload, { status: 200 });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}
