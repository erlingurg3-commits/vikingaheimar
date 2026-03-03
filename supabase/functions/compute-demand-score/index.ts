// @ts-nocheck
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type LegacyLevel = "normal" | "elevated" | "high";
type ScoreLevel = "LOW" | "MEDIUM" | "HIGH";

type DemandUpsertRow = {
  date: string;
  cruise_pax: number;
  air_arrivals: number;
  flights: number;
  widebodies: number;
  score: number;
  level: LegacyLevel;
  score_level: ScoreLevel;
  confidence: number;
  explanation: string;
  updated_at: string;
};

type NewlyHighRow = {
  date: string;
  score: number;
  cruise_pax: number;
  air_arrivals: number;
  flights: number;
  widebodies: number;
  confidence: number;
};

type DailyComputedRow = {
  date: string;
  cruise_pax: number;
  real_air_arrivals: number;
  baseline_air_arrivals: number;
  air_arrivals: number;
  flights: number;
  widebodies: number;
  score: number;
  score_level: ScoreLevel;
  confidence: number;
};

const jsonHeaders = { "Content-Type": "application/json; charset=utf-8" };
const WINDOW_DAYS = 365;
const NARROWBODY_PAX = 170;
const WIDEBODY_PAX = 280;
const baselineByMonth: Record<number, number> = {
  1: 8000,
  2: 8500,
  3: 9000,
  4: 10000,
  5: 11000,
  6: 13000,
  7: 14000,
  8: 13500,
  9: 11000,
  10: 9500,
  11: 8500,
  12: 9000,
};

function toUtcDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(base: Date, days: number): Date {
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + days));
}

function normalizeLegacyLevel(value: unknown): LegacyLevel {
  const normalized = String(value ?? "normal").trim().toLowerCase();
  if (normalized === "high") return "high";
  if (normalized === "elevated") return "elevated";
  return "normal";
}

function normalizeScoreLevel(value: unknown): ScoreLevel {
  const normalized = String(value ?? "LOW").trim().toUpperCase();
  if (normalized === "HIGH") return "HIGH";
  if (normalized === "MEDIUM") return "MEDIUM";
  return "LOW";
}

function toInt(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

function toLegacyLevel(scoreLevel: ScoreLevel): LegacyLevel {
  if (scoreLevel === "HIGH") return "high";
  if (scoreLevel === "MEDIUM") return "elevated";
  return "normal";
}

function computeScore(cruisePax: number, airArrivals: number, dateIso: string): { score: number; scoreLevel: ScoreLevel } {
  const date = new Date(dateIso + "T00:00:00Z");
  const weekday = date.getUTCDay();
  const month = date.getUTCMonth() + 1;

  const cruiseComponent = (cruisePax / 4500) * 50;
  const airComponent = (airArrivals / 13000) * 30;
  const weekendBonus = (weekday === 5 || weekday === 6) ? 5 : 0;
  const peakMonthBonus = (month >= 5 && month <= 8) ? 8 : 0;

  const rawScore = cruiseComponent + airComponent + weekendBonus + peakMonthBonus;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  if (score >= 75) {
    return { score, scoreLevel: "HIGH" };
  }

  if (score >= 60) {
    return { score, scoreLevel: "MEDIUM" };
  }

  return { score, scoreLevel: "LOW" };
}

function calculateConfidence(cruisePax: number, airArrivals: number): number {
  let confidence = 50;

  if (cruisePax > 3000) {
    confidence += 25;
  }

  if (cruisePax > 4500) {
    confidence += 10;
  }

  if (airArrivals > 12000) {
    confidence += 10;
  }

  return Math.min(95, confidence);
}

Deno.serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
          hint: "Set required function environment variables.",
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const startDateUtc = addUtcDays(new Date(), 0);
    const endDateUtc = addUtcDays(startDateUtc, WINDOW_DAYS - 1);
    const windowStart = toUtcDateOnly(startDateUtc);
    const windowEnd = toUtcDateOnly(endDateUtc);
    const afterWindowEndExclusive = toUtcDateOnly(addUtcDays(endDateUtc, 1));

    const { data: schemaProbeRows, error: schemaProbeError } = await supabase
      .from("demand_days")
      .select("date, score_level, confidence, air_arrivals")
      .limit(1);

    if (schemaProbeError) {
      return new Response(
        JSON.stringify({
          error: "Schema mismatch: demand_days must include score_level, confidence, and air_arrivals",
          hint: schemaProbeError.message,
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const { data: previousRows, error: previousError } = await supabase
      .from("demand_days")
      .select("date, level, score_level")
      .gte("date", windowStart)
      .lte("date", windowEnd);

    if (previousError) {
      return new Response(
        JSON.stringify({
          error: "Failed to read existing demand_days",
          hint: previousError.message,
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const previousLevelByDate = new Map<string, ScoreLevel>();
    for (const row of previousRows ?? []) {
      const scoreLevel = row.score_level ? normalizeScoreLevel(row.score_level) : (normalizeLegacyLevel(row.level) === "high" ? "HIGH" : normalizeLegacyLevel(row.level) === "elevated" ? "MEDIUM" : "LOW");
      previousLevelByDate.set(String(row.date), scoreLevel);
    }

    const { data: flightRows, error: flightsError } = await supabase
      .from("flight_arrivals")
      .select("date, is_widebody")
      .gte("date", windowStart)
      .lte("date", windowEnd);

    if (flightsError) {
      return new Response(
        JSON.stringify({
          error: "Failed to read flight_arrivals",
          hint: flightsError.message,
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const flightsByDay = new Map<string, number>();
    const widebodiesByDay = new Map<string, number>();

    for (const row of flightRows ?? []) {
      const date = String(row.date);
      flightsByDay.set(date, (flightsByDay.get(date) ?? 0) + 1);

      if (Boolean(row.is_widebody)) {
        widebodiesByDay.set(date, (widebodiesByDay.get(date) ?? 0) + 1);
      }
    }

    const { data: cruiseRows, error: cruiseError } = await supabase
      .from("port_calls")
      .select("eta, pax_estimate, status")
      .gte("eta", windowStart + "T00:00:00Z")
      .lt("eta", afterWindowEndExclusive + "T00:00:00Z")
      .in("status", ["scheduled", "arrived"]);

    if (cruiseError) {
      return new Response(
        JSON.stringify({
          error: "Failed to read port_calls",
          hint: cruiseError.message,
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const cruisePaxByDay = new Map<string, number>();

    for (const row of cruiseRows ?? []) {
      const eta = row.eta ? new Date(String(row.eta)) : null;
      if (!eta || Number.isNaN(eta.getTime())) {
        continue;
      }

      const day = toUtcDateOnly(eta);
      const pax = Math.max(0, toInt(row.pax_estimate));
      cruisePaxByDay.set(day, (cruisePaxByDay.get(day) ?? 0) + pax);
    }

    const upsertRows: DemandUpsertRow[] = [];
    const newlyHigh: NewlyHighRow[] = [];
    const computedRows: DailyComputedRow[] = [];
    let highs = 0;
    let elevated = 0;
    let highestScore: number = -1;
    let highestScoreDay: NewlyHighRow | null = null;

    for (let i = 0; i < WINDOW_DAYS; i += 1) {
      const date = toUtcDateOnly(addUtcDays(startDateUtc, i));
      const cruisePax = cruisePaxByDay.get(date) ?? 0;
      const flights = flightsByDay.get(date) ?? 0;
      const widebodies = widebodiesByDay.get(date) ?? 0;
      const narrowbodies = Math.max(0, flights - widebodies);
      const realAir = (narrowbodies * NARROWBODY_PAX) + (widebodies * WIDEBODY_PAX);
      const month = Number(date.slice(5, 7));
      const baselineAir = baselineByMonth[month] ?? 9000;
      const airArrivals = Math.max(realAir, baselineAir);

      const { score, scoreLevel } = computeScore(cruisePax, airArrivals, date);
      const confidence = calculateConfidence(cruisePax, airArrivals);
      const level = toLegacyLevel(scoreLevel);

      if (scoreLevel === "HIGH") highs += 1;
      if (scoreLevel === "MEDIUM") elevated += 1;

      computedRows.push({
        date,
        cruise_pax: cruisePax,
        real_air_arrivals: realAir,
        baseline_air_arrivals: baselineAir,
        air_arrivals: airArrivals,
        flights,
        widebodies,
        score,
        score_level: scoreLevel,
        confidence,
      });

      if (score > highestScore) {
        highestScore = score;
        highestScoreDay = {
          date,
          score,
          cruise_pax: cruisePax,
          air_arrivals: airArrivals,
          flights,
          widebodies,
          confidence,
        };
      }

      const previousLevel = previousLevelByDate.get(date) ?? "LOW";
      if (previousLevel !== "HIGH" && scoreLevel === "HIGH") {
        newlyHigh.push({
          date,
          score,
          cruise_pax: cruisePax,
          air_arrivals: airArrivals,
          flights,
          widebodies,
          confidence,
        });
      }

      upsertRows.push({
        date,
        cruise_pax: cruisePax,
        air_arrivals: airArrivals,
        flights,
        widebodies,
        score,
        level,
        score_level: scoreLevel,
        confidence,
        explanation: "Cruise pax: " + String(cruisePax) + "; Flights: " + String(flights) + "; Widebodies: " + String(widebodies),
        updated_at: new Date().toISOString(),
      });
    }

    const { error: upsertError } = await supabase
      .from("demand_days")
      .upsert(upsertRows, { onConflict: "date" });

    if (upsertError) {
      return new Response(
        JSON.stringify({
          error: "Failed to upsert demand_days",
          hint: upsertError.message,
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    console.log("[compute-demand-score] processed_days=" + String(WINDOW_DAYS));
    console.log("[compute-demand-score] high_days_next_window=" + String(highs));
    if (highestScoreDay) {
      console.log(
        "[compute-demand-score] highest_score_day=" +
          highestScoreDay.date +
          " cruise_pax=" +
          String(highestScoreDay.cruise_pax) +
          " air_arrivals=" +
          String(highestScoreDay.air_arrivals) +
          " score=" +
          String(highestScoreDay.score) +
          " confidence=" +
          String(highestScoreDay.confidence)
      );
    }

    const todayKey = toUtcDateOnly(startDateUtc);
    const todayRow = computedRows.find((row) => row.date === todayKey) ?? null;
    const top5HighestScoreDays = [...computedRows]
      .sort((first, second) => {
        if (second.score !== first.score) {
          return second.score - first.score;
        }

        return first.date.localeCompare(second.date);
      })
      .slice(0, 5);

    return new Response(
      JSON.stringify({
        window_start: windowStart,
        window_end: windowEnd,
        computed: WINDOW_DAYS,
        highs,
        elevated,
        high_days_count: highs,
        today_row: todayRow,
        top_5_highest_score_days: top5HighestScoreDays,
        highest_score_day: highestScoreDay,
        newly_high: newlyHigh,
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        hint: "Unhandled error in compute-demand-score",
      }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
