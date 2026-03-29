export type TourismPressureIndex = {
  score: number;
  level: "LOW" | "MED" | "HIGH";
  confidence: number;
  drivers: string[];
};

export type TourismPressureSupportSignal = {
  date: string;
  signalType: "flights" | "cruise" | "weather" | "events" | "travel_tourism_news";
  title: string;
  summary: string;
  estimatedImpactScore: number;
  confidenceScore: number;
  sourceName: string;
  sourceUrl: string;
  sourceReliability: "official" | "official-partner" | "secondary";
  region: string;
  affectedDateRange: {
    start: string;
    end: string;
  };
};

export type TourismPressureSupport = {
  sourceFileName: string;
  generatedAt: string;
  selectedDate: string;
  alertLevel: "normal" | "watch" | "high-alert";
  netDemandSignal: "strong_negative" | "negative" | "neutral" | "positive" | "strong_positive";
  highAlertDay: boolean;
  confidence: number;
  dimensions: {
    flightPressure: number;
    cruisePressure: number;
    weatherRisk: number;
    eventPressure: number;
    scoreValue: number;
    scoreFrom: "flight_pressure" | "cruise_pressure" | "event_pressure" | "none";
  };
  reasons: string[];
  signals: TourismPressureSupportSignal[];
};

export type ExternalSignals = {
  flights_est: number;
  flights_baseline: number;
  widebody_count: number;
  cruise_pax: number;
};

export type OpportunityItem = {
  dateISO: string;
  type: "FILL" | "PRICE";
  title: string;
  why: string[];
  actions: string[];
  confidence: number;
};

export type MarketShareSnapshot = {
  tourismPool: number;
  visitors: number;
  marketSharePct: number;
  targetPct: number;
};

export type NextCriticalDay = {
  dateISO: string;
  alertLevel: "high-alert" | "watch" | "normal" | "none";
  confidence: number;
  summary: string;
  reasons: string[];
  categoryMix: {
    flights: number;
    cruise: number;
    weather: number;
    events: number;
    tourism: number;
  };
  dayKind: "pressure-risk" | "opportunity";
  fallbackNotice?: string;
};

export type DemandRunSummary = {
  filename: string;
  path: string;
  isLatest: boolean;
  generatedAt: string | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  signalCount: number;
  highAlertDays: number;
  watchDays: number;
  normalDays: number;
};

export type DemandRunDiff = {
  newerFile: string;
  olderFile: string;
  newerGeneratedAt: string | null;
  olderGeneratedAt: string | null;
  signalCountDelta: number;
  highAlertDaysDelta: number;
  watchDaysDelta: number;
  normalDaysDelta: number;
  dateRangeChanged: boolean;
};

export type TourismIntelligencePayload = {
  dateISO: string;
  pressureIndex: TourismPressureIndex;
  pressureSupport?: TourismPressureSupport;
  nextCriticalDay?: NextCriticalDay;
  opportunities: OpportunityItem[];
  marketShare: MarketShareSnapshot;
  recentRuns?: DemandRunSummary[];
  latestRunDiff?: DemandRunDiff | null;
  /** ISO timestamp from the source demand file */
  generatedAt?: string;
  /** Where the pressure and opportunity data came from */
  dataSource?: "demand_file" | "live" | "disconnected";
  error?: "DATA_NOT_CONNECTED";
};
