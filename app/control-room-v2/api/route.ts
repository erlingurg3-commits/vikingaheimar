import type { TourismIntelligencePayload } from "@/app/control-room-v2/types/intelligence";
import { loadDemandIntelligence } from "@/app/control-room-v2/services/demandFileReader";
import { loadDemandRunIndex } from "@/app/control-room-v2/services/runIndexReader";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function todayUtcDateISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isSupabaseConnected(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const EMPTY_MARKET_SHARE = { tourismPool: 0, visitors: 0, marketSharePct: 0, targetPct: 3 };

export async function GET() {
  const dateISO = todayUtcDateISO();
  const runIndex = await loadDemandRunIndex();

  // ── 1. Demand intelligence file - primary source for external signals ─────
  const demandFile = await loadDemandIntelligence();
  const supabaseConnected = isSupabaseConnected();

  // ── 2. Neither source available ────────────────────────────────────────────
  if (!demandFile && !supabaseConnected) {
    const payload: TourismIntelligencePayload = {
      dateISO,
      dataSource: "disconnected",
      error: "DATA_NOT_CONNECTED",
      recentRuns: runIndex.recentRuns,
      latestRunDiff: runIndex.latestRunDiff,
      pressureIndex: {
        score: 0,
        level: "LOW",
        confidence: 0,
        drivers: ["No demand file found and Supabase is not configured."],
      },
      marketShare: EMPTY_MARKET_SHARE,
      opportunities: [],
    };
    return Response.json(payload, { status: 200 });
  }

  // ── 3. Demand file available, Supabase not configured ─────────────────────
  if (demandFile && !supabaseConnected) {
    const payload: TourismIntelligencePayload = {
      dateISO,
      dataSource: "demand_file",
      generatedAt: demandFile.generatedAt,
      pressureSupport: demandFile.pressureSupport,
      nextCriticalDay: demandFile.nextCriticalDay,
      recentRuns: runIndex.recentRuns,
      latestRunDiff: runIndex.latestRunDiff,
      pressureIndex: demandFile.pressureIndex,
      opportunities: demandFile.opportunities,
      marketShare: EMPTY_MARKET_SHARE,
    };
    return Response.json(payload, { status: 200 });
  }

  // ── 4. Supabase available - demand file overlays external signals ──────────
  try {
    const engine = await import("@/app/control-room-v2/services/intelligenceEngine");

    const [marketShare, liveOpportunities] = await Promise.all([
      engine.getMarketShare(dateISO),
      engine.getOpportunities(dateISO, 30),
    ]);

    // Demand file takes precedence for pressure index when available
    const pressureIndex =
      demandFile?.pressureIndex ?? (await engine.getTourismPressureIndex(dateISO));

    // Demand file opportunities lead; booking-based ones fill any uncovered dates
    const opportunities = demandFile
      ? [
          ...demandFile.opportunities,
          ...liveOpportunities.filter(
            (live) => !demandFile.opportunities.some((d) => d.dateISO === live.dateISO)
          ),
        ]
      : liveOpportunities;

    const payload: TourismIntelligencePayload = {
      dateISO,
      dataSource: demandFile ? "demand_file" : "live",
      generatedAt: demandFile?.generatedAt,
      pressureSupport: demandFile?.pressureSupport,
      nextCriticalDay: demandFile?.nextCriticalDay,
      recentRuns: runIndex.recentRuns,
      latestRunDiff: runIndex.latestRunDiff,
      pressureIndex,
      opportunities,
      marketShare,
    };

    return Response.json(payload, { status: 200 });
  } catch {
    // Supabase failed - fall back to demand file if available
    if (demandFile) {
      const payload: TourismIntelligencePayload = {
        dateISO,
        dataSource: "demand_file",
        generatedAt: demandFile.generatedAt,
        pressureSupport: demandFile.pressureSupport,
        nextCriticalDay: demandFile.nextCriticalDay,
        recentRuns: runIndex.recentRuns,
        latestRunDiff: runIndex.latestRunDiff,
        pressureIndex: demandFile.pressureIndex,
        opportunities: demandFile.opportunities,
        marketShare: EMPTY_MARKET_SHARE,
      };
      return Response.json(payload, { status: 200 });
    }

    const payload: TourismIntelligencePayload = {
      dateISO,
      dataSource: "disconnected",
      recentRuns: runIndex.recentRuns,
      latestRunDiff: runIndex.latestRunDiff,
      pressureIndex: {
        score: 0,
        level: "LOW",
        confidence: 0,
        drivers: ["Live signals are temporarily unavailable."],
      },
      marketShare: EMPTY_MARKET_SHARE,
      opportunities: [],
    };
    return Response.json(payload, { status: 200 });
  }
}
