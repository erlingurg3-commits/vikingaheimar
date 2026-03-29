import type {
  NextCriticalDay,
  TourismPressureIndex,
  TourismPressureSupport,
  TourismPressureSupportSignal,
  OpportunityItem,
} from "@/app/control-room-v2/types/intelligence";
import { loadLatestDemandIntelligenceRun } from "@/lib/demand-intelligence/storage";
import type { DailySummaryRow, DemandFile, DemandSignalRow as SignalRow } from "@/lib/demand-intelligence/types";

// ── Public API ─────────────────────────────────────────────────────────────────

export type DemandFilePayload = {
  generatedAt: string;
  sourceFileName: string;
  pressureIndex: TourismPressureIndex;
  pressureSupport: TourismPressureSupport;
  nextCriticalDay: NextCriticalDay;
  opportunities: OpportunityItem[];
};

export async function loadDemandIntelligence(): Promise<DemandFilePayload | null> {
  const stored = await loadLatestDemandIntelligenceRun();
  if (!stored) {
    return null;
  }

  return mapFile(stored.file, stored.fileName);
}

// ── Mapping ────────────────────────────────────────────────────────────────────

function mapFile(file: DemandFile, sourceFileName: string): DemandFilePayload {
  const todayISO = new Date().toISOString().slice(0, 10);

  const upcoming = file.daily_summary
    .filter((d) => d.date >= todayISO)
    .sort((a, b) => a.date.localeCompare(b.date));

  // When the entire file range is in the past, still surface pressure context
  // from the most recent available day (read-only; no opportunities surfaced)
  const pressureDays =
    upcoming.length > 0
      ? upcoming
      : [...file.daily_summary]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 1);

  const peakDay = pickPeakDay(pressureDays);

  return {
    generatedAt: file.generated_at,
    sourceFileName,
    pressureIndex: buildPressureIndex(pressureDays),
    pressureSupport: buildPressureSupport(file, sourceFileName, peakDay),
    nextCriticalDay: buildNextCriticalDay(file, upcoming),
    opportunities: buildOpportunities(upcoming),
  };
}

const ALERT_PRIORITY = { "high-alert": 3, watch: 2, normal: 1 } as const;

function pickPeakDay(days: DailySummaryRow[]): DailySummaryRow | null {
  if (days.length === 0) {
    return null;
  }

  return [...days].sort(
    (a, b) =>
      ALERT_PRIORITY[b.alert_level] - ALERT_PRIORITY[a.alert_level] ||
      b.confidence - a.confidence ||
      a.date.localeCompare(b.date)
  )[0];
}

function deriveScore(day: DailySummaryRow): {
  scoreValue: number;
  scoreFrom: "flight_pressure" | "cruise_pressure" | "event_pressure" | "none";
} {
  if (
    day.flight_pressure >= day.cruise_pressure &&
    day.flight_pressure >= day.event_pressure
  ) {
    return {
      scoreValue: day.flight_pressure,
      scoreFrom: "flight_pressure",
    };
  }

  if (day.cruise_pressure >= day.event_pressure) {
    return {
      scoreValue: day.cruise_pressure,
      scoreFrom: "cruise_pressure",
    };
  }

  if (day.event_pressure > 0) {
    return {
      scoreValue: day.event_pressure,
      scoreFrom: "event_pressure",
    };
  }

  return {
    scoreValue: 0,
    scoreFrom: "none",
  };
}

function matchesDateRange(signal: SignalRow, date: string): boolean {
  return signal.affected_date_range.start <= date && signal.affected_date_range.end >= date;
}

function mapSignal(signal: SignalRow): TourismPressureSupportSignal {
  return {
    date: signal.date,
    signalType: signal.signal_type,
    title: signal.title,
    summary: signal.summary,
    estimatedImpactScore: signal.estimated_impact_score,
    confidenceScore: signal.confidence_score,
    sourceName: signal.source_name,
    sourceUrl: signal.source_url,
    sourceReliability: signal.source_reliability,
    region: signal.region,
    affectedDateRange: {
      start: signal.affected_date_range.start,
      end: signal.affected_date_range.end,
    },
  };
}

function buildPressureSupport(
  file: DemandFile,
  sourceFileName: string,
  peakDay: DailySummaryRow | null
): TourismPressureSupport {
  if (!peakDay) {
    return {
      sourceFileName,
      generatedAt: file.generated_at,
      selectedDate: "",
      alertLevel: "normal",
      netDemandSignal: "neutral",
      highAlertDay: false,
      confidence: 0,
      dimensions: {
        flightPressure: 0,
        cruisePressure: 0,
        weatherRisk: 0,
        eventPressure: 0,
        scoreValue: 0,
        scoreFrom: "none",
      },
      reasons: ["No supporting demand rows found."],
      signals: [],
    };
  }

  const score = deriveScore(peakDay);
  const signals = file.signals
    .filter((signal) => matchesDateRange(signal, peakDay.date))
    .sort(
      (a, b) =>
        b.confidence_score - a.confidence_score ||
        b.estimated_impact_score - a.estimated_impact_score
    )
    .map(mapSignal);

  return {
    sourceFileName,
    generatedAt: file.generated_at,
    selectedDate: peakDay.date,
    alertLevel: peakDay.alert_level,
    netDemandSignal: peakDay.net_demand_signal,
    highAlertDay: peakDay.high_alert_day,
    confidence: peakDay.confidence,
    dimensions: {
      flightPressure: peakDay.flight_pressure,
      cruisePressure: peakDay.cruise_pressure,
      weatherRisk: peakDay.weather_risk,
      eventPressure: peakDay.event_pressure,
      scoreValue: score.scoreValue,
      scoreFrom: score.scoreFrom,
    },
    reasons: peakDay.reasons,
    signals,
  };
}

function buildPressureIndex(days: DailySummaryRow[]): TourismPressureIndex {
  const peak = pickPeakDay(days);
  if (!peak) {
    return {
      score: 0,
      level: "LOW",
      confidence: 0,
      drivers: ["No upcoming demand signals in current file range."],
    };
  }

  // Demand pressure score uses positive signals only.
  // weather_risk is a disruption signal, not a demand driver - excluded here.
  const score = deriveScore(peak).scoreValue;

  const level: "LOW" | "MED" | "HIGH" =
    score >= 70 ? "HIGH" : score >= 40 ? "MED" : "LOW";

  return {
    score,
    level,
    confidence: peak.confidence,
    drivers: peak.reasons.slice(0, 3),
  };
}

function buildOpportunities(upcoming: DailySummaryRow[]): OpportunityItem[] {
  const items: OpportunityItem[] = [];

  for (const day of upcoming) {
    if (day.alert_level === "normal") continue;

    const isPositive =
      day.net_demand_signal === "positive" ||
      day.net_demand_signal === "strong_positive";
    const isNegative =
      day.net_demand_signal === "negative" ||
      day.net_demand_signal === "strong_negative";

    let type: "FILL" | "PRICE";
    let title: string;
    let actions: string[];

    if (day.high_alert_day && isPositive) {
      type = "PRICE";
      title = "High-demand window";
      actions = [
        "Protect prime-time slot inventory for this date.",
        "Shift sales toward higher-yield ticket mixes.",
      ];
    } else if (isNegative) {
      type = "FILL";
      title = "Disruption risk - demand may soften";
      actions = [
        "Monitor conditions and adjust capacity expectations.",
        "Prepare flexible rebooking options for affected guests.",
      ];
    } else {
      type = "FILL";
      title = "Moderate demand building";
      actions = [
        "Open additional inventory to capture demand uplift.",
        "Highlight this date in direct booking channels.",
      ];
    }

    items.push({
      dateISO: day.date,
      type,
      title,
      why: day.reasons,
      actions,
      confidence: day.confidence,
    });
  }

  // Surface high-alert days first, then watch; chronological within each level
  return items.sort((a, b) => {
    const aDay = upcoming.find((d) => d.date === a.dateISO)!;
    const bDay = upcoming.find((d) => d.date === b.dateISO)!;
    return (
      ALERT_PRIORITY[bDay.alert_level] - ALERT_PRIORITY[aDay.alert_level] ||
      a.dateISO.localeCompare(b.dateISO)
    );
  });
}

function summarizeCategoryMix(signals: SignalRow[]) {
  return {
    flights: signals.filter((signal) => signal.signal_type === "flights").length,
    cruise: signals.filter((signal) => signal.signal_type === "cruise").length,
    weather: signals.filter((signal) => signal.signal_type === "weather").length,
    events: signals.filter((signal) => signal.signal_type === "events").length,
    tourism: signals.filter((signal) => signal.signal_type === "travel_tourism_news").length,
  };
}

function riskScore(day: DailySummaryRow): number {
  return Math.max(day.flight_pressure, day.cruise_pressure, day.weather_risk, day.event_pressure);
}

function moderatePressureScore(day: DailySummaryRow): number {
  return Math.max(day.flight_pressure, day.cruise_pressure, day.event_pressure);
}

function headroomScore(day: DailySummaryRow): number {
  return 100 - riskScore(day);
}

function buildNextCriticalDay(file: DemandFile, upcoming: DailySummaryRow[]): NextCriticalDay {
  if (upcoming.length === 0) {
    return {
      dateISO: "",
      alertLevel: "none",
      confidence: 0,
      summary: "No upcoming demand window is available in the current data file.",
      reasons: ["No demand rows found for future dates."],
      categoryMix: {
        flights: 0,
        cruise: 0,
        weather: 0,
        events: 0,
        tourism: 0,
      },
      dayKind: "opportunity",
      fallbackNotice: "No alerted day in the next window",
    };
  }

  const highAlertDays = upcoming.filter((day) => day.alert_level === "high-alert");
  const watchDays = upcoming.filter((day) => day.alert_level === "watch");
  const moderateDays = upcoming.filter(
    (day) => day.alert_level === "normal" && moderatePressureScore(day) >= 35
  );

  const selectEarliestBest = (
    days: DailySummaryRow[],
    scoreFn: (day: DailySummaryRow) => number
  ): DailySummaryRow => {
    return [...days].sort(
      (left, right) =>
        scoreFn(right) - scoreFn(left) ||
        right.confidence - left.confidence ||
        left.date.localeCompare(right.date)
    )[0];
  };

  let selected: DailySummaryRow;
  let dayKind: NextCriticalDay["dayKind"] = "pressure-risk";
  let summary = "";
  let fallbackNotice: string | undefined;

  if (highAlertDays.length > 0) {
    selected = selectEarliestBest(highAlertDays, riskScore);
    summary = "Most consequential upcoming pressure day. Keep staffing, capacity, and transport contingencies aligned.";
  } else if (watchDays.length > 0) {
    selected = selectEarliestBest(watchDays, riskScore);
    summary = "Most important watch-level day in the next window. Plan with measured operational flexibility.";
  } else if (moderateDays.length > 0) {
    selected = selectEarliestBest(moderateDays, moderatePressureScore);
    summary = "No formal alert, but this is the strongest moderate-pressure day to plan around.";
  } else {
    dayKind = "opportunity";
    fallbackNotice = "No alerted day in the next window";
    selected = selectEarliestBest(upcoming, headroomScore);
    summary = "Highest headroom day in the current window. Useful for proactive fill activity and capacity-efficient promotions.";
  }

  const daySignals = file.signals.filter((signal) => matchesDateRange(signal, selected.date));

  return {
    dateISO: selected.date,
    alertLevel: selected.alert_level,
    confidence: selected.confidence,
    summary,
    reasons: selected.reasons.slice(0, 4),
    categoryMix: summarizeCategoryMix(daySignals),
    dayKind,
    fallbackNotice,
  };
}
