"use client";

import { useState, useEffect, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type CalendarEvent = {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  description?: string;
};

type BokunBooking = {
  code: string;
  visitDate: string;
  pax: number;
  revenue: string;
  status: string;
  channel: string;
  rate: string;
};

type BokunAvailability = {
  date: string;   // localizedDate e.g. "Wed 20.May'26"
  booked: number;
};

type DemandDay = { date: string; score_level: string; cruise_pax: number };

type PeriodKey = "TODAY" | "THIS_WEEK" | "NEXT_14" | "THIS_MONTH" | "NEXT_30" | "CUSTOM";

type KpiData = {
  revenue: number;
  pax: number;
  bookings: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function icelandDate(d?: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Atlantic/Reykjavik" }).format(d ?? new Date());
}

function parsePax(title: string): number {
  if (!title) return 0;
  // "28+2 pax" or "28+2pax"
  const m1 = title.match(/(\d{1,4})\s*\+\s*(\d{1,4})\s*pax/i);
  if (m1) return parseInt(m1[1]) + parseInt(m1[2]);
  // "50 pax"
  const m2 = title.match(/(\d{1,4})\s*pax/i);
  if (m2) return parseInt(m2[1]);
  // Icelandic format: semicolon-delimited, pax is a standalone number 2–1999
  // e.g. "Entrance; 48; TTT 6a 7 V" → 48
  const parts = title.split(";");
  for (const pt of parts) {
    const m3 = pt.trim().match(/^(\d{1,4})$/);
    if (m3) {
      const n = parseInt(m3[1]);
      if (n >= 2 && n < 2000) return n;
    }
  }
  // "22+2" or "28+2" without pax word, inside semicolons
  for (const pt of parts) {
    const m4 = pt.trim().match(/^(\d{1,4})\s*\+\s*(\d{1,4})$/);
    if (m4) return parseInt(m4[1]) + parseInt(m4[2]);
  }
  return 0;
}

function classifyEvent(title: string): { label: string; emoji: string; pill: string } {
  const t = title.toLowerCase();
  if (/breakfast|morgunmat|morgunverð/.test(t)) return { label: "BREAKFAST", emoji: "🍳", pill: "bg-amber-500/20 text-amber-300" };
  if (/atlantik|cruise|ship/.test(t)) return { label: "CRUISE", emoji: "🚢", pill: "bg-blue-500/20 text-blue-300" };
  if (/entrance|ttt|admission|viðbót/.test(t)) return { label: "GROUP", emoji: "🎟", pill: "bg-slate-500/20 text-slate-300" };
  return { label: "EVENT", emoji: "📋", pill: "bg-zinc-700/20 text-zinc-400" };
}

function formatISK(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function lastDayOfMonth(dateStr: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  return new Date(y, m, 0).toISOString().slice(0, 10);
}

function datesInRange(from: string, to: string): string[] {
  const dates: string[] = [];
  let cur = from;
  while (cur <= to) {
    dates.push(cur);
    cur = addDays(cur, 1);
  }
  return dates;
}

function formatEventTime(ev: CalendarEvent): string {
  const raw = ev.start.dateTime;
  if (!raw) return "All day";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Atlantic/Reykjavik",
  }).format(new Date(raw));
}

function cleanTitle(title: string): string {
  return title.replace(/\s*[-–]\s*(atlantik|cruise|ship|entrance|ttt|admission|viðbót|breakfast|morgunmat|morgunverð)/gi, "").trim();
}

const DEMAND_BADGE: Record<string, string> = {
  LOW:    "bg-zinc-700/30 text-zinc-500 text-[9px] font-medium px-1.5 py-0.5 rounded uppercase",
  MEDIUM: "bg-amber-500/15 text-amber-400 text-[9px] font-medium px-1.5 py-0.5 rounded uppercase border border-amber-500/20",
  HIGH:   "bg-orange-500/15 text-orange-300 text-[9px] font-medium px-1.5 py-0.5 rounded uppercase border border-orange-500/20",
  PEAK:   "bg-red-500/15 text-red-300 text-[9px] font-medium px-1.5 py-0.5 rounded uppercase border border-red-500/20",
};

const TYPE_PILL: Record<string, string> = {
  CRUISE:    "bg-blue-500/15 text-blue-300 border border-blue-500/20",
  BREAKFAST: "bg-amber-500/15 text-amber-300 border border-amber-500/20",
  GROUP:     "bg-violet-500/15 text-violet-300 border border-violet-500/20",
  BOKUN:     "bg-zinc-500/15 text-zinc-400 border border-zinc-500/20",
  EVENT:     "bg-zinc-700/15 text-zinc-500 border border-zinc-700/20",
};

// ─── Period config ────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<PeriodKey, string> = {
  TODAY:      "Today",
  THIS_WEEK:  "This Week",
  NEXT_14:    "Next 14 Days",
  THIS_MONTH: "This Month",
  NEXT_30:    "Next 30 Days",
  CUSTOM:     "Custom",
};

function fmtShort(dateStr: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", timeZone: "Atlantic/Reykjavik",
  }).format(new Date(`${dateStr}T12:00:00Z`));
}

function periodSubLabel(
  key: PeriodKey,
  today: string,
  customFrom: string,
  customTo: string
): string {
  switch (key) {
    case "TODAY":      return fmtShort(today);
    case "THIS_WEEK":  return `${fmtShort(today)} – ${fmtShort(addDays(today, 6))}`;
    case "NEXT_14":    return `${fmtShort(today)} – ${fmtShort(addDays(today, 13))}`;
    case "THIS_MONTH": return `${fmtShort(today)} – ${fmtShort(lastDayOfMonth(today))}`;
    case "NEXT_30":    return `${fmtShort(today)} – ${fmtShort(addDays(today, 29))}`;
    case "CUSTOM":
      return customFrom && customTo
        ? `${fmtShort(customFrom)} – ${fmtShort(customTo)}`
        : "pick dates";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MorningBriefing() {
  const [period, setPeriod] = useState<PeriodKey>("NEXT_14");
  const [customFrom, setCustomFrom] = useState<string>(() => icelandDate());
  const [customTo, setCustomTo] = useState<string>(() => addDays(icelandDate(), 13));
  const [kpi, setKpi] = useState<KpiData | null>(null);
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>([]);
  const [recentBookings, setRecentBookings] = useState<BokunBooking[]>([]);
  const [upcomingAvailability, setUpcomingAvailability] = useState<BokunAvailability[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [demandDays, setDemandDays] = useState<DemandDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [calError, setCalError] = useState<string | null>(null);

  const today = icelandDate();

  const { periodFrom, periodTo } = useMemo(() => {
    switch (period) {
      case "TODAY":
        return { periodFrom: today, periodTo: today };
      case "THIS_WEEK":
        return { periodFrom: today, periodTo: addDays(today, 6) };
      case "NEXT_14":
        return { periodFrom: today, periodTo: addDays(today, 13) };
      case "THIS_MONTH":
        return { periodFrom: today, periodTo: lastDayOfMonth(today) };
      case "NEXT_30":
        return { periodFrom: today, periodTo: addDays(today, 29) };
      case "CUSTOM":
        return { periodFrom: customFrom, periodTo: customTo > customFrom ? customTo : customFrom };
    }
  }, [period, today, customFrom, customTo]);

  useEffect(() => {
    setLoading(true);
    const kpiUrl = `/api/control-room/period-kpi?from=${periodFrom}&to=${periodTo}`;
    const calUrl = `/api/calendar?timeMin=${periodFrom}T00:00:00Z&timeMax=${periodTo}T23:59:59Z`;
    const bokUrl = `/api/bokun/test`;
    const demUrl = `/api/control-room/demand-calendar?from=${periodFrom}&to=${periodTo}`;

    const safeFetch = (url: string) =>
      fetch(url)
        .then((r) => r.json())
        .catch(() => null);

    Promise.all([
      safeFetch(kpiUrl),
      safeFetch(calUrl),
      safeFetch(bokUrl),
      safeFetch(demUrl),
    ])
      .then(([kpiData, calData, bokData, demData]) => {
        if (kpiData && !kpiData.error) setKpi(kpiData);
        const eventsRaw = Array.isArray(calData) ? calData : (calData?.items ?? []);
        if (!Array.isArray(calData)) {
          setCalError(calData?.error ?? calData?.message ?? "Calendar returned non-array response");
        } else {
          setCalError(null);
        }
        setCalEvents(eventsRaw);
        // bokun/test returns { recentBookings, upcomingAvailability }
        setRecentBookings(bokData?.recentBookings ?? []);
        setUpcomingAvailability(bokData?.upcomingAvailability ?? []);
        setLastSync(bokData?.lastSync ?? null);
        setDemandDays(Array.isArray(demData) ? demData : []);
      })
      .finally(() => setLoading(false));
  }, [periodFrom, periodTo]);

  const demandByDate = useMemo(() => {
    const m = new Map<string, DemandDay>();
    for (const d of demandDays) m.set(d.date, d);
    return m;
  }, [demandDays]);

  const dates = useMemo(() => datesInRange(periodFrom, periodTo), [periodFrom, periodTo]);

  const calendarPax = useMemo(() =>
    calEvents.reduce((s, ev) => s + parsePax(ev.summary ?? ""), 0),
    [calEvents]
  );

  // Bokun pax from upcomingAvailability — booked participants per day
  const bokunPaxByDate = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of upcomingAvailability) {
      // localizedDate looks like "Wed 20.May'26" — match against YYYY-MM-DD dates in range
      for (const date of datesInRange(periodFrom, periodTo)) {
        const d = new Date(`${date}T12:00:00Z`);
        const day = d.getUTCDate();
        const mon = d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" });
        if (a.date.includes(`${day}.${mon}`) || a.date.includes(`${day}.${mon.slice(0,3)}`)) {
          m.set(date, (m.get(date) ?? 0) + a.booked);
        }
      }
    }
    return m;
  }, [upcomingAvailability, periodFrom, periodTo]);

  const bokunPax = useMemo(() => {
    let total = 0;
    for (const v of bokunPaxByDate.values()) total += v;
    return total;
  }, [bokunPaxByDate]);

  const formatLastSync = (raw: string | null) => {
    if (!raw) return "—";
    try {
      return new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Atlantic/Reykjavik",
      }).format(new Date(raw));
    } catch {
      return raw;
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }} className="space-y-5 text-zinc-100">

      {/* A. Period tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pb-5 border-b border-white/10">
        {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            style={{ fontFamily: "inherit" }}
            className={`flex flex-col items-start px-4 py-4 rounded-xl text-left transition-all border ${
              period === key
                ? "bg-white/10 border-white/25"
                : "bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.05] hover:border-white/15"
            }`}
          >
            <span className={`block text-[13px] font-semibold leading-tight ${period === key ? "text-white" : "text-zinc-400"}`}>
              {PERIOD_LABELS[key]}
            </span>
            <span className={`block text-[11px] leading-tight mt-2 ${period === key ? "text-cyan-400" : "text-zinc-600"}`}>
              {periodSubLabel(key, today, customFrom, customTo)}
            </span>
          </button>
        ))}

        {period === "CUSTOM" && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              style={{ fontFamily: "inherit", colorScheme: "dark" }}
              className="bg-white/[0.05] border border-white/10 rounded px-2 py-1 text-[12px] text-zinc-300 outline-none focus:border-cyan-500/50"
            />
            <span className="text-zinc-600 text-[12px]">→</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              style={{ fontFamily: "inherit", colorScheme: "dark" }}
              className="bg-white/[0.05] border border-white/10 rounded px-2 py-1 text-[12px] text-zinc-300 outline-none focus:border-cyan-500/50"
            />
          </div>
        )}
      </div>

      {/* B. KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
        {[
          { label: "Total PAX",  value: loading ? "—" : (calendarPax + bokunPax).toLocaleString(), sub: `${periodFrom} – ${periodTo}` },
          { label: "Group PAX",  value: loading ? "—" : calendarPax.toLocaleString(),              sub: "from calendar" },
          { label: "Bokun PAX",  value: loading ? "—" : bokunPax.toLocaleString(),                 sub: "online tickets" },
          { label: "Revenue",    value: loading || !kpi ? "—" : `${formatISK(kpi.revenue)} ISK`,   sub: "Bokun · period" },
          { label: "Last sync",  value: formatLastSync(lastSync),                                   sub: "Bokun data" },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1.5">{card.label}</p>
            <p className={`text-[22px] font-medium tabular-nums ${loading ? "text-zinc-600 animate-pulse" : "text-zinc-100"}`}>{card.value}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Calendar error */}
      {calError && (
        <div className="rounded-md border border-red-500/30 bg-red-950/20 px-4 py-2.5 text-[12px] text-red-400">
          <span className="font-medium">Calendar error:</span> {calError}
        </div>
      )}

      {/* C. Daily schedule */}
      <div>
        <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-3">Schedule</p>

        {loading && (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-10 rounded-md bg-white/[0.04] animate-pulse" />)}
          </div>
        )}

        {!loading && (
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-widest w-32">Date</th>
                <th className="text-left py-2 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-widest w-20">Time</th>
                <th className="text-left py-2 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-widest w-24">Type</th>
                <th className="text-left py-2 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">Booking</th>
                <th className="text-right py-2 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-widest w-20">Pax</th>
              </tr>
            </thead>
            <tbody>
              {dates.flatMap((date) => {
                const dayCalEvents = calEvents.filter((ev) => {
                  const d = ev.start.dateTime?.slice(0, 10) ?? ev.start.date?.slice(0, 10);
                  return d === date;
                });
                const dayBokunPax = bokunPaxByDate.get(date) ?? 0;
                const demand = demandByDate.get(date);

                if (dayCalEvents.length === 0 && dayBokunPax === 0) return [];

                const isToday = date === today;
                const dateLabel = new Intl.DateTimeFormat("en-GB", {
                  weekday: "short", day: "numeric", month: "short",
                  timeZone: "Atlantic/Reykjavik",
                }).format(new Date(`${date}T12:00:00Z`)).toUpperCase();

                const rows = [];

                // Calendar event rows
                dayCalEvents.forEach((ev, i) => {
                  const { label } = classifyEvent(ev.summary ?? "");
                  const pax = parsePax(ev.summary ?? "");
                  const time = formatEventTime(ev);
                  rows.push(
                    <tr
                      key={`${date}-cal-${i}`}
                      className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${isToday ? "bg-white/[0.03]" : ""}`}
                    >
                      {i === 0 ? (
                        <td className={`py-2.5 px-3 align-top ${isToday ? "border-l-2 border-l-emerald-400" : ""}`}>
                          <span className="font-medium text-zinc-200">{dateLabel}</span>
                          {demand?.score_level && (
                            <span className={`ml-2 ${DEMAND_BADGE[demand.score_level] ?? DEMAND_BADGE.LOW}`}>{demand.score_level}</span>
                          )}
                        </td>
                      ) : (
                        <td className={`py-2.5 px-3 ${isToday ? "border-l-2 border-l-emerald-400" : ""}`} />
                      )}
                      <td className="py-2.5 px-3 text-zinc-500 tabular-nums">{time}</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded ${TYPE_PILL[label] ?? TYPE_PILL.EVENT}`}>{label}</span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300">{ev.summary}</td>
                      <td className="py-2.5 px-3 text-right font-medium tabular-nums text-zinc-200">
                        {pax > 0 ? pax : "—"}
                      </td>
                    </tr>
                  );
                });

                // Bokun row
                if (dayBokunPax > 0) {
                  rows.push(
                    <tr
                      key={`${date}-bokun`}
                      className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${isToday ? "bg-white/[0.03]" : ""}`}
                    >
                      {dayCalEvents.length === 0 ? (
                        <td className={`py-2.5 px-3 ${isToday ? "border-l-2 border-l-emerald-400" : ""}`}>
                          <span className="font-medium text-zinc-200">{dateLabel}</span>
                        </td>
                      ) : (
                        <td className={`py-2.5 px-3 ${isToday ? "border-l-2 border-l-emerald-400" : ""}`} />
                      )}
                      <td className="py-2.5 px-3 text-zinc-500">—</td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded ${TYPE_PILL.BOKUN}`}>Bokun</span>
                      </td>
                      <td className="py-2.5 px-3 text-zinc-500">Online tickets</td>
                      <td className="py-2.5 px-3 text-right font-medium tabular-nums text-zinc-200">{dayBokunPax}</td>
                    </tr>
                  );
                }

                return rows;
              })}
            </tbody>
          </table>
        )}

        {!loading && dates.every((date) => {
          const evs = calEvents.filter(ev => (ev.start.dateTime?.slice(0,10) ?? ev.start.date?.slice(0,10)) === date);
          return evs.length === 0 && (bokunPaxByDate.get(date) ?? 0) === 0;
        }) && (
          <p className="text-[13px] text-zinc-600 text-center py-8">No bookings in this period</p>
        )}
      </div>
    </div>
  );
}
