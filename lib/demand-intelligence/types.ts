export type DemandSignalType =
  | "flights"
  | "cruise"
  | "weather"
  | "events"
  | "travel_tourism_news";

export type DailySummaryRow = {
  date: string;
  flight_pressure: number;
  cruise_pressure: number;
  weather_risk: number;
  event_pressure: number;
  alert_level: "normal" | "watch" | "high-alert";
  net_demand_signal:
    | "strong_negative"
    | "negative"
    | "neutral"
    | "positive"
    | "strong_positive";
  high_alert_day: boolean;
  confidence: number;
  reasons: string[];
};

export type DemandSignalRow = {
  date: string;
  signal_type: DemandSignalType;
  title: string;
  summary: string;
  estimated_impact_score: number;
  confidence_score: number;
  source_name: string;
  source_url: string;
  source_reliability: "official" | "official-partner" | "secondary";
  region: string;
  affected_date_range: {
    start: string;
    end: string;
  };
};

export type DemandFile = {
  generated_at: string;
  date_range: {
    start: string;
    end: string;
  };
  signals: DemandSignalRow[];
  daily_summary: DailySummaryRow[];
};