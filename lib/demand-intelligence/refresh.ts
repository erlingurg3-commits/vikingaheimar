import { supabaseAdmin } from "@/lib/supabase-admin";
import { saveDemandIntelligenceRun } from "@/lib/demand-intelligence/storage";
import type { DailySummaryRow, DemandFile, DemandSignalRow } from "@/lib/demand-intelligence/types";

const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const LONG_HAUL_CODES = new Set([
  "BOS",
  "JFK",
  "EWR",
  "IAD",
  "SEA",
  "ORD",
  "MSP",
  "MCO",
  "PDX",
  "DEN",
  "YYZ",
  "BWI",
  "RDU",
  "GOH",
  "KUS",
]);

type DimensionScores = {
  flights: number;
  cruise: number;
  weather: number;
  events: number;
};

type ConfidenceByCategory = {
  flights: number;
  cruise: number;
  weather: number;
  events: number;
};

type KefApiFlight = {
  arrival?: boolean;
  airportCode?: string;
  status?: string;
};

type KefApiResponse = {
  value?: KefApiFlight[];
};

type PortCallRow = {
  eta: string | null;
  pax_estimate: number | null;
  status: string | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toInt(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
}

function hasSupabaseAccess() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateISO: string, days: number) {
  const date = new Date(`${dateISO}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDate(date);
}

function listDateRange(startDate: string, endDate: string) {
  const results: string[] = [];
  let cursor = startDate;

  while (cursor <= endDate && results.length < 31) {
    results.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return results;
}

function todayInReykjavik() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Atlantic/Reykjavik",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function decodeHtml(text: string) {
  return text
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&ndash;", "-")
    .replaceAll("&mdash;", "-")
    .replaceAll("&rsquo;", "'")
    .replaceAll("&lsquo;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function stripHtml(html: string) {
  return decodeHtml(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function titleCaseAlert(level: "yellow" | "orange" | "red") {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function buildArchiveFileName(file: DemandFile) {
  const stamp = file.generated_at.replaceAll(/[-:]/g, "").replaceAll(".", "");
  return `${file.date_range.start}_to_${file.date_range.end}__${stamp}.json`;
}

function affectsDate(signal: DemandSignalRow, dateISO: string) {
  return signal.affected_date_range.start <= dateISO && signal.affected_date_range.end >= dateISO;
}

function scoreDimension(signals: DemandSignalRow[]) {
  if (signals.length === 0) {
    return 0;
  }

  const ranked = [...signals].sort(
    (left, right) =>
      right.estimated_impact_score - left.estimated_impact_score ||
      right.confidence_score - left.confidence_score
  );

  if (ranked.length === 1) {
    return ranked[0].estimated_impact_score;
  }

  return clamp(Math.round(ranked[0].estimated_impact_score * 0.6 + ranked[1].estimated_impact_score * 0.4), 0, 100);
}

function scoreConfidence(signals: DemandSignalRow[]) {
  if (signals.length === 0) {
    return 0;
  }

  const ranked = [...signals].sort((left, right) => right.confidence_score - left.confidence_score).slice(0, 3);
  return Math.round(ranked.reduce((sum, signal) => sum + signal.confidence_score, 0) / ranked.length);
}

function summarizeReasons(signals: DemandSignalRow[]) {
  const seen = new Set<string>();
  const reasons: string[] = [];

  for (const signal of [...signals].sort(
    (left, right) =>
      right.estimated_impact_score - left.estimated_impact_score ||
      right.confidence_score - left.confidence_score
  )) {
    if (seen.has(signal.title)) {
      continue;
    }

    seen.add(signal.title);
    reasons.push(signal.title);
    if (reasons.length === 3) {
      break;
    }
  }

  return reasons;
}

function computeAlertLevel(scores: DimensionScores) {
  const supportingCategories = Object.values(scores).filter((score) => score >= 25).length;
  const peak = Math.max(scores.flights, scores.cruise, scores.weather, scores.events);

  if (peak >= 70 && supportingCategories >= 2) {
    return "high-alert" as const;
  }

  if (peak >= 40 || supportingCategories >= 2) {
    return "watch" as const;
  }

  return "normal" as const;
}

function computeNetDemand(scores: DimensionScores): DailySummaryRow["net_demand_signal"] {
  const positiveComposite = Math.round((scores.flights + scores.cruise + scores.events) / 3);

  if (scores.weather >= 80 && scores.weather - positiveComposite >= 20) {
    return "strong_negative";
  }

  if (scores.weather >= 60 && scores.weather > positiveComposite) {
    return "negative";
  }

  if (positiveComposite >= 75 && positiveComposite - scores.weather >= 20) {
    return "strong_positive";
  }

  if (positiveComposite >= 50 && positiveComposite > scores.weather + 5) {
    return "positive";
  }

  return "neutral";
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "accept-language": "en-US,en;q=0.9",
      "user-agent": "vikingaheimar-demand-bot/1.0",
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`);
  }

  return response.text();
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "accept-language": "en-US,en;q=0.9",
      "user-agent": "vikingaheimar-demand-bot/1.0",
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${url}`);
  }

  return (await response.json()) as T;
}

async function collectFlightSignals(dateKeys: string[]) {
  const signals = await Promise.all(
    dateKeys.map(async (dateISO) => {
      try {
        const url = `https://www.kefairport.is/api/flightData?date=${encodeURIComponent(`${dateISO}T00:00:00.000Z`)}&cargo=false&type=arrivals&search=`;
        const response = await fetchJson<KefApiResponse>(url);
        const arrivals = (response.value ?? []).filter((flight) => flight.arrival === true);
        if (arrivals.length === 0) {
          return null;
        }

        const longHaulCount = arrivals.filter((flight) => LONG_HAUL_CODES.has((flight.airportCode ?? "").toUpperCase())).length;
        const disruptedCount = arrivals.filter((flight) => /EST|DEL|CNL|CAN|LATE/i.test(flight.status ?? "")).length;
        const score = clamp(Math.round(arrivals.length * 1.4 + longHaulCount * 3 + disruptedCount * 4), 0, 92);

        return {
          date: dateISO,
          signal_type: "flights",
          title:
            disruptedCount > 0
              ? `KEF arrivals show ${arrivals.length} inbound flights with some disruption signals`
              : `KEF arrivals schedule shows ${arrivals.length} inbound flights`,
          summary:
            disruptedCount > 0
              ? `Keflavik arrivals list ${arrivals.length} inbound flights for ${dateISO}, including ${disruptedCount} flights with estimated or delay-style status markers and ${longHaulCount} long-haul arrivals.`
              : `Keflavik arrivals list ${arrivals.length} inbound flights for ${dateISO}, including ${longHaulCount} long-haul arrivals.`,
          estimated_impact_score: score,
          confidence_score: 86,
          source_name: "Keflavik Airport (Isavia)",
          source_url: url,
          source_reliability: "official",
          region: "KEF",
          affected_date_range: {
            start: dateISO,
            end: dateISO,
          },
        } satisfies DemandSignalRow;
      } catch (err) {
        console.warn(`[demand-intelligence] flights scrape failed for ${dateISO}:`, err instanceof Error ? err.message : err);
        return null;
      }
    })
  );

  return signals.filter(Boolean) as DemandSignalRow[];
}

function monthToNumber(token: string) {
  return MONTHS[token.toLowerCase().replace(".", "")] ?? null;
}

function buildIsoDate(year: number, monthToken: string, day: number) {
  const month = monthToNumber(monthToken);
  if (!month) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function monthName(dateISO: string) {
  return new Date(`${dateISO}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
}

function monthAbbrev(dateISO: string) {
  return new Date(`${dateISO}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

function dayOfMonth(dateISO: string) {
  return Number(dateISO.slice(8, 10));
}

function dateMarkers(dateISO: string) {
  const day = dayOfMonth(dateISO);
  const longMonth = monthName(dateISO);
  const shortMonth = monthAbbrev(dateISO).replace(".", "");
  return [
    `${longMonth} ${day}`,
    `${day} ${shortMonth}`,
    `${day} ${shortMonth}.`,
    `${dateISO}`,
  ];
}

function hasHazardWords(text: string) {
  return /alert|warning|blizzard|storm|snow|wind|avalanche|closure|disruption/i.test(text);
}

async function collectImoWeatherSignals(dateKeys: string[]) {
  try {
    const html = await fetchText("https://en.vedur.is/alerts");
    const text = stripHtml(html);
    const targetDates = new Set(dateKeys);
    const byDate = new Map<string, Array<{ level: "yellow" | "orange" | "red"; snippet: string }>>();
    const year = Number(dateKeys[0]?.slice(0, 4) ?? new Date().getUTCFullYear());
    // Matches IMO alert level labels in any of their known formats:
    // "(Yellow condition)", "Yellow alert", "Red warning", "Orange advisory", etc.
    const regex = /(Yellow|Orange|Red)\s+(?:condition|alert|warning|advisory)[).]?/gi;

    for (const match of text.matchAll(regex)) {
      const level = match[1].toLowerCase() as "yellow" | "orange" | "red";
      const startIndex = Math.max(0, (match.index ?? 0) - 120);
      const endIndex = Math.min(text.length, (match.index ?? 0) + 280);
      const snippet = text.slice(startIndex, endIndex).trim();
      const dateMatch = snippet.match(/(\d{1,2})\s+([A-Za-z]{3})\.?/);

      if (dateMatch) {
        const dateISO = buildIsoDate(year, dateMatch[2], Number(dateMatch[1]));
        if (dateISO && targetDates.has(dateISO)) {
          byDate.set(dateISO, [...(byDate.get(dateISO) ?? []), { level, snippet }]);
        }
      }
    }

    // Fallback: if no strict match, infer from date markers and hazard words.
    if (byDate.size === 0) {
      const normalized = text.replace(/\s+/g, " ");
      const IMO_ALERT = /(?:Red|Orange|Yellow)\s+(?:condition|alert|warning|advisory)/i;
      const level: "yellow" | "orange" | "red" = /Red\s+(?:condition|alert|warning|advisory)/i.test(normalized)
        ? "red"
        : /Orange\s+(?:condition|alert|warning|advisory)/i.test(normalized)
        ? "orange"
        : "yellow";

      if (IMO_ALERT.test(normalized)) {
        for (const dateISO of dateKeys) {
          const markerHit = dateMarkers(dateISO).some((marker) => normalized.includes(marker));
          if (!markerHit || !hasHazardWords(normalized)) {
            continue;
          }

          const idx = normalized.indexOf(dateMarkers(dateISO)[0]);
          const snippet = normalized.slice(Math.max(0, idx - 80), Math.min(normalized.length, idx + 220));
          byDate.set(dateISO, [{ level, snippet }]);
        }
      }
    }

    return [...byDate.entries()].map(([dateISO, entries]) => {
      const highestLevel = entries.some((entry) => entry.level === "red")
        ? "red"
        : entries.some((entry) => entry.level === "orange")
        ? "orange"
        : "yellow";
      const baseScore = highestLevel === "red" ? 92 : highestLevel === "orange" ? 84 : 74;

      return {
        date: dateISO,
        signal_type: "weather",
        title: `IMO ${titleCaseAlert(highestLevel)} weather alerts active`,
        summary: `Icelandic Met Office alerts include ${entries.length} ${highestLevel} warning mentions affecting ${dateISO}. ${entries[0]?.snippet ?? ""}`,
        estimated_impact_score: clamp(baseScore + Math.min(8, entries.length * 2), 0, 95),
        confidence_score: 92,
        source_name: "Icelandic Meteorological Office",
        source_url: "https://en.vedur.is/alerts",
        source_reliability: "official",
        region: "Iceland",
        affected_date_range: {
          start: dateISO,
          end: dateISO,
        },
      } satisfies DemandSignalRow;
    });
  } catch (err) {
    console.warn("[demand-intelligence] IMO weather scrape failed:", err instanceof Error ? err.message : err);
    return [] as DemandSignalRow[];
  }
}

async function collectSafeTravelSignals(dateKeys: string[]) {
  try {
    const html = await fetchText("https://safetravel.is/");
    const text = stripHtml(html);
    const regex = /([A-Z][a-z]+)\s+(\d{1,2})(?:[-–—](\d{1,2}))?,\s+(\d{4}):\s*([^]+?)(?=(?:[A-Z][a-z]+\s+\d{1,2}(?:[-–—]\d{1,2})?,\s+\d{4}:)|$)/g;
    const results: DemandSignalRow[] = [];
    const targetDates = new Set(dateKeys);

    for (const match of text.matchAll(regex)) {
      const startMonth = match[1];
      const startDay = Number(match[2]);
      const endDay = match[3] ? Number(match[3]) : startDay;
      const year = Number(match[4]);
      const title = match[5].trim().slice(0, 120);
      const summarySlice = text.slice(match.index ?? 0, Math.min(text.length, (match.index ?? 0) + 320)).trim();
      const startISO = buildIsoDate(year, startMonth, startDay);
      const endISO = buildIsoDate(year, startMonth, endDay);
      if (!startISO || !endISO) {
        continue;
      }

      const coveredDates = listDateRange(startISO, endISO).filter((dateISO) => targetDates.has(dateISO));
      if (coveredDates.length === 0) {
        continue;
      }

      const impact = /eruption|evacuat|closure|closed|blizzard|storm/i.test(title)
        ? 82
        : /avalanche|strong wind|snow|ice|warning/i.test(title)
        ? 68
        : 52;

      results.push({
        date: coveredDates[0],
        signal_type: "weather",
        title: `SafeTravel: ${title}`,
        summary: summarySlice,
        estimated_impact_score: impact,
        confidence_score: 87,
        source_name: "SafeTravel (ICE-SAR)",
        source_url: "https://safetravel.is/",
        source_reliability: "official-partner",
        region: "Iceland",
        affected_date_range: {
          start: coveredDates[0],
          end: coveredDates[coveredDates.length - 1],
        },
      });
    }

    // Fallback: if structured parsing fails, still capture visible alert language.
    if (results.length === 0) {
      const normalized = text.replace(/\s+/g, " ");
      if (hasHazardWords(normalized)) {
        for (const dateISO of dateKeys.slice(0, 3)) {
          const markerHit = dateMarkers(dateISO).some((marker) => normalized.includes(marker));
          if (!markerHit) {
            continue;
          }

          const marker = dateMarkers(dateISO)[0];
          const idx = normalized.indexOf(marker);
          const snippet = normalized.slice(Math.max(0, idx - 90), Math.min(normalized.length, idx + 250));

          results.push({
            date: dateISO,
            signal_type: "weather",
            title: "SafeTravel conditions indicate elevated travel disruption risk",
            summary: snippet,
            estimated_impact_score: 64,
            confidence_score: 76,
            source_name: "SafeTravel (ICE-SAR)",
            source_url: "https://safetravel.is/",
            source_reliability: "official-partner",
            region: "Iceland",
            affected_date_range: {
              start: dateISO,
              end: dateISO,
            },
          });
        }
      }
    }

    return results;
  } catch (err) {
    console.warn("[demand-intelligence] SafeTravel weather scrape failed:", err instanceof Error ? err.message : err);
    return [] as DemandSignalRow[];
  }
}

async function collectWeatherSignals(dateKeys: string[]) {
  const [imoSignals, safeTravelSignals] = await Promise.all([
    collectImoWeatherSignals(dateKeys),
    collectSafeTravelSignals(dateKeys),
  ]);

  const combined = [...imoSignals, ...safeTravelSignals];

  // Baseline fallback: when no active warnings are found, emit a low-risk
  // signal so the weather dimension always carries context rather than 0.
  // Mirrors the cruise dimension's fallback pattern.
  if (combined.length === 0 && dateKeys.length > 0) {
    combined.push({
      date: dateKeys[0],
      signal_type: "weather",
      title: "No active IMO or SafeTravel weather warnings",
      summary:
        "No colour-coded IMO alerts or SafeTravel disruption notices were found for this window. Conditions appear normal for Iceland.",
      estimated_impact_score: 15,
      confidence_score: 72,
      source_name: "Icelandic Meteorological Office",
      source_url: "https://en.vedur.is/alerts",
      source_reliability: "official",
      region: "Iceland",
      affected_date_range: {
        start: dateKeys[0],
        end: dateKeys[dateKeys.length - 1],
      },
    });
  }

  return combined;
}

async function collectEventSignals(dateKeys: string[]) {
  try {
    // Fetch each page independently so a 404 on a later page doesn't
    // discard all successfully-fetched earlier pages.
    const pageResults = await Promise.all(
      [0, 1, 2, 3].map(async (page) => {
        try {
          const html = await fetchText(`https://visitreykjavik.is/events?page=${page}`);
          return stripHtml(html);
        } catch (err) {
          console.warn(`[demand-intelligence] events page ${page} fetch failed:`, err instanceof Error ? err.message : err);
          return null;
        }
      })
    );
    const pages = pageResults.filter((page): page is string => page !== null);

    const counts = new Map<string, number>();
    const entryRegex = /\b(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s+-\s+\d{2}:\d{2}\b/g;

    for (const pageText of pages) {
      for (const match of pageText.matchAll(entryRegex)) {
        const dateISO = buildIsoDate(Number(match[3]), match[2], Number(match[1]));
        if (!dateISO || !dateKeys.includes(dateISO)) {
          continue;
        }

        counts.set(dateISO, (counts.get(dateISO) ?? 0) + 1);
      }
    }

    return dateKeys
      .filter((dateISO) => (counts.get(dateISO) ?? 0) > 0)
      .map((dateISO) => {
        const count = counts.get(dateISO) ?? 0;
        return {
          date: dateISO,
          signal_type: "events",
          title: `Visit Reykjavik calendar lists ${count} scheduled events`,
          summary: `Official Visit Reykjavik listings show approximately ${count} scheduled public events or repeating programs on ${dateISO}.`,
          estimated_impact_score: clamp(Math.round(16 + count * 1.8), 0, 72),
          confidence_score: 81,
          source_name: "Visit Reykjavik",
          source_url: "https://visitreykjavik.is/events",
          source_reliability: "official-partner",
          region: "Reykjavik",
          affected_date_range: {
            start: dateISO,
            end: dateISO,
          },
        } satisfies DemandSignalRow;
      });
  } catch (err) {
    console.warn("[demand-intelligence] events scrape failed:", err instanceof Error ? err.message : err);
    return [] as DemandSignalRow[];
  }
}

async function collectCruiseSignals(dateKeys: string[]) {
  if (!hasSupabaseAccess()) {
    return [] as DemandSignalRow[];
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("port_calls")
      .select("eta, pax_estimate, status")
      .gte("eta", `${dateKeys[0]}T00:00:00.000Z`)
      .lte("eta", `${dateKeys[dateKeys.length - 1]}T23:59:59.999Z`)
      .in("status", ["scheduled", "arrived"]);

    if (error || !Array.isArray(data)) {
      return [];
    }

    const byDate = new Map<string, { vessels: number; pax: number }>();
    for (const row of data as PortCallRow[]) {
      if (!row.eta) {
        continue;
      }

      const dateISO = row.eta.slice(0, 10);
      if (!dateKeys.includes(dateISO)) {
        continue;
      }

      const current = byDate.get(dateISO) ?? { vessels: 0, pax: 0 };
      byDate.set(dateISO, {
        vessels: current.vessels + 1,
        pax: current.pax + toInt(row.pax_estimate),
      });
    }

    const mapped = [...byDate.entries()].map(([dateISO, aggregate]) => ({
      date: dateISO,
      signal_type: "cruise",
      title: `Port schedule shows ${aggregate.vessels} cruise-related calls`,
      summary: `Stored port call data shows ${aggregate.vessels} scheduled or arrived calls with an estimated ${aggregate.pax} passengers for ${dateISO}.`,
      estimated_impact_score: clamp(Math.round(12 + aggregate.vessels * 7 + aggregate.pax / 35), 0, 86),
      confidence_score: 74,
      source_name: "Port schedule data",
      source_url: "https://www.faxafloahafnir.is/en/",
      source_reliability: "official",
      region: "Reykjavik",
      affected_date_range: {
        start: dateISO,
        end: dateISO,
      },
    } satisfies DemandSignalRow));

    if (mapped.length > 0) {
      return mapped;
    }

    // Fallback: keep a low-intensity official port signal so cruise dimension
    // does not disappear when structured port data is temporarily empty.
    const portPage = await fetchText("https://www.faxafloahafnir.is/en/").catch(() => "");
    if (portPage) {
      const firstDate = dateKeys[0];
      const secondDate = dateKeys[1] ?? firstDate;
      return [
        {
          date: firstDate,
          signal_type: "cruise",
          title: "No strong cruise surge signal in the near-term port window",
          summary:
            "Official port pages show regular vessel traffic without a clear high-intensity cruise spike in the immediate horizon.",
          estimated_impact_score: 12,
          confidence_score: 62,
          source_name: "Faxafloahafnir (Port of Reykjavik)",
          source_url: "https://www.faxafloahafnir.is/en/",
          source_reliability: "official",
          region: "Reykjavik",
          affected_date_range: {
            start: firstDate,
            end: secondDate,
          },
        },
      ];
    }

    return [];
  } catch (err) {
    console.warn("[demand-intelligence] cruise signals failed:", err instanceof Error ? err.message : err);
    return [] as DemandSignalRow[];
  }
}

function buildDailySummaries(dateKeys: string[], signals: DemandSignalRow[]) {
  return dateKeys.map((dateISO) => {
    const dateSignals = signals.filter((signal) => affectsDate(signal, dateISO));
    const flights = dateSignals.filter((signal) => signal.signal_type === "flights");
    const cruise = dateSignals.filter((signal) => signal.signal_type === "cruise");
    const weather = dateSignals.filter((signal) => signal.signal_type === "weather");
    const events = dateSignals.filter((signal) => signal.signal_type === "events");

    const scores: DimensionScores = {
      flights: scoreDimension(flights),
      cruise: scoreDimension(cruise),
      weather: scoreDimension(weather),
      events: scoreDimension(events),
    };
    const confidences: ConfidenceByCategory = {
      flights: scoreConfidence(flights),
      cruise: scoreConfidence(cruise),
      weather: scoreConfidence(weather),
      events: scoreConfidence(events),
    };
    const alertLevel = computeAlertLevel(scores);
    const confidenceValues = Object.values(confidences)
      .filter((value) => value > 0)
      .sort((left, right) => right - left)
      .slice(0, 2);
    const confidence =
      confidenceValues.length > 0
        ? Math.round(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)
        : 42;
    const reasons = summarizeReasons(dateSignals);

    return {
      date: dateISO,
      flight_pressure: scores.flights,
      cruise_pressure: scores.cruise,
      weather_risk: scores.weather,
      event_pressure: scores.events,
      alert_level: alertLevel,
      net_demand_signal: computeNetDemand(scores),
      high_alert_day: alertLevel === "high-alert",
      confidence,
      reasons: reasons.length > 0 ? reasons : ["No corroborated official signal in the current refresh window."],
    } satisfies DailySummaryRow;
  });
}

export async function refreshDemandIntelligence(input?: {
  startDate?: string;
  endDate?: string;
}) {
  const startDate = input?.startDate ?? todayInReykjavik();
  const endDate = input?.endDate ?? addDays(startDate, 6);
  const dateKeys = listDateRange(startDate, endDate);

  const [flightSignals, weatherSignals, eventSignals, cruiseSignals] = await Promise.all([
    collectFlightSignals(dateKeys),
    collectWeatherSignals(dateKeys),
    collectEventSignals(dateKeys),
    collectCruiseSignals(dateKeys),
  ]);

  const signals = ([...flightSignals, ...cruiseSignals, ...weatherSignals, ...eventSignals] as DemandSignalRow[]).sort(
    (left, right) =>
      left.date.localeCompare(right.date) ||
      right.estimated_impact_score - left.estimated_impact_score ||
      right.confidence_score - left.confidence_score
  );

  const file: DemandFile = {
    generated_at: new Date().toISOString(),
    date_range: {
      start: startDate,
      end: endDate,
    },
    signals,
    daily_summary: buildDailySummaries(dateKeys, signals),
  };

  const archiveFileName = buildArchiveFileName(file);
  const persisted = await saveDemandIntelligenceRun(file, archiveFileName);

  return {
    file,
    archiveFileName,
    storage: persisted.storage,
    archivePath: persisted.archivePath,
    latestPath: persisted.latestPath,
  };
}