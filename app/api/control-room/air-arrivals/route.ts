import { supabaseAdmin } from "@/lib/supabase-admin";

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
};

function toInt(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function toPercent(value: number, max = 100): number {
  return Math.max(0, Math.min(max, Math.round(value)));
}

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

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

    const { data: flightRows, error: flightError } = await supabaseAdmin
      .from("flight_arrivals")
      .select("date, flight_number, origin, aircraft_type, is_widebody")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(100);

    if (flightError) {
      return Response.json({ ok: false, message: flightError.message }, { status: 500 });
    }

    const arrivals = (flightRows ?? []) as FlightArrivalRow[];

    const totals = {
      flights7d: demandRows.slice(0, 7).reduce((sum, row) => sum + toInt(row.flights), 0),
      airArrivals7d: demandRows.slice(0, 7).reduce((sum, row) => sum + toInt(row.air_arrivals), 0),
      widebodies7d: demandRows.slice(0, 7).reduce((sum, row) => sum + toInt(row.widebodies), 0),
      avgConfidence: demandRows.length
        ? toPercent(demandRows.reduce((sum, row) => sum + toInt(row.confidence), 0) / demandRows.length)
        : 0,
    };

    const originMap = new Map<string, number>();
    for (const row of arrivals) {
      const origin = (row.origin ?? "Unknown").trim() || "Unknown";
      originMap.set(origin, (originMap.get(origin) ?? 0) + 1);
    }

    const topOrigins = Array.from(originMap.entries())
      .map(([origin, flights]) => ({ origin, flights }))
      .sort((a, b) => b.flights - a.flights)
      .slice(0, 6);

    return Response.json(
      {
        ok: true,
        totals,
        demandDays: demandRows,
        arrivals: arrivals.slice(0, 30),
        topOrigins,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Unexpected server error" },
      { status: 500 }
    );
  }
}
