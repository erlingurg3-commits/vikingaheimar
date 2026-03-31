"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────
type CalendarEvent = {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  description?: string;
};

type BokunRecentBooking = {
  code: string;
  status: string;
  channel: string;
  customer: string;
  nationality: string | null;
  pax: number;
  revenue: string;
  visitDate: string;
  bookedAt: string;
  rate: string;
};

type ParsedBooking = {
  id: string;
  time: string;
  service: "breakfast" | "entrance" | "special" | "other";
  operator: string;
  pax: number;
};

type GroupDetail = {
  summary: string;
  pax: number;
  time: string;
};

type DaySummary = {
  date: Date;
  dateStr: string;
  label: string;
  bokunPax: number;
  bokunCount: number;
  groupPax: number;
  groupCount: number;
  groupDetails: GroupDetail[];
  pax: number;
  bookings: number;
  isToday: boolean;
};

type OpsTab = "today" | "week";

// ── Helpers ──────────────────────────────────────────────────

function icelandDate(d?: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Atlantic/Reykjavik" }).format(d ?? new Date());
}

function icelandTime(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Atlantic/Reykjavik",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function getNext7Days(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDayLabel(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Atlantic/Reykjavik",
  }).format(d);
}

function parseEvent(ev: CalendarEvent): ParsedBooking {
  const title = ev.summary || "";
  const tl = title.toLowerCase();

  // Service detection
  let service: ParsedBooking["service"] = "other";
  if (/breakfast|morgunmat/i.test(tl)) service = "breakfast";
  else if (/entrance|admission/i.test(tl) || /^ttt\s/i.test(title)) service = "entrance";
  else if (/refreshment|thor.*fish|soup|lunch|special/i.test(tl)) service = "special";

  // Pax
  let pax = 0;
  const pm1 = title.match(/(\d+)\s*\+\s*(\d+)\s*pax/i);
  if (pm1) {
    pax = parseInt(pm1[1]) + parseInt(pm1[2]);
  } else {
    const pm2 = title.match(/(\d+)\s*pax/i);
    if (pm2) pax = parseInt(pm2[1]);
  }
  if (!pax) {
    const parts = title.split(";");
    for (const pt of parts) {
      const m = pt.trim().match(/^(\d{1,4})$/);
      if (m && parseInt(m[1]) > 1 && parseInt(m[1]) < 2000) {
        pax = parseInt(m[1]);
        break;
      }
    }
  }

  // Operator
  const sparts = title.split(";").map((s) => s.trim());
  let operator = sparts.length >= 3 ? sparts[2] : sparts[0] || title;
  operator = operator
    .replace(/\b\d+\s*(?:\+\s*\d+)?\s*pax\b/gi, "")
    .replace(/\bATL\d{5,}\b/gi, "")
    .replace(/^\s*[-–—:;,()]\s*/, "")
    .replace(/\s*[-–—:;,()]\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!operator || operator.length < 2) operator = sparts[0] || title;
  if (operator.length > 50) operator = operator.slice(0, 50) + "…";

  const startDt = ev.start?.dateTime || ev.start?.date || "";

  return {
    id: ev.id || Math.random().toString(36),
    time: startDt ? icelandTime(startDt) : "All day",
    service,
    operator,
    pax,
  };
}

function parseBokunBooking(b: BokunRecentBooking): ParsedBooking {
  const rate = (b.rate ?? "").toLowerCase();
  let service: ParsedBooking["service"] = "entrance";
  if (rate.includes("breakfast") || rate.includes("morgunverð")) service = "breakfast";
  else if (rate.includes("special") || rate.includes("soup") || rate.includes("lunch")) service = "special";

  const bookedTime = b.bookedAt ? icelandTime(b.bookedAt) : "";

  return {
    id: `bokun-${b.code}`,
    time: bookedTime || "—",
    service,
    operator: `${b.customer}${b.nationality ? ` (${b.nationality})` : ""} · ${b.code}`,
    pax: b.pax,
  };
}

const SERVICE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  breakfast: { bg: "bg-amber-500/20", text: "text-amber-300", label: "BREAKFAST" },
  entrance: { bg: "bg-slate-500/20", text: "text-slate-300", label: "ENTRANCE" },
  special: { bg: "bg-teal-500/20", text: "text-teal-300", label: "SPECIAL" },
  other: { bg: "bg-zinc-700/20", text: "text-zinc-400", label: "OTHER" },
};

// ── Component ────────────────────────────────────────────────

export default function OpsWindow() {
  const [tab, setTab] = useState<OpsTab>("today");
  const [todayBookings, setTodayBookings] = useState<ParsedBooking[]>([]);
  const [weekDays, setWeekDays] = useState<DaySummary[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "stale" | "error">("loading");
  const refreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const staleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setStatus("loading");

      const days = getNext7Days();
      const todayStr = icelandDate();
      const rangeEnd = new Date(days[6]);
      rangeEnd.setHours(23, 59, 59);

      const params = new URLSearchParams({
        timeMin: days[0].toISOString(),
        timeMax: rangeEnd.toISOString(),
      });

      // Fetch calendar events and Bókun data in parallel
      const [calRes, bokunRes] = await Promise.all([
        fetch(`/api/calendar?${params}`).catch(() => null),
        fetch("/api/bokun/test").catch(() => null),
      ]);

      const events: CalendarEvent[] =
        calRes?.ok ? await calRes.json().catch(() => []) : [];
      const validEvents = Array.isArray(events) ? events : [];

      // Parse all Bókun bookings keyed by visit date
      let bokunByDate = new Map<string, BokunRecentBooking[]>();
      let bokunAvailByDate = new Map<string, number>();
      if (bokunRes?.ok) {
        try {
          const bokunData = await bokunRes.json();
          // Recent bookings (individual details)
          for (const b of (bokunData.recentBookings ?? []) as BokunRecentBooking[]) {
            if (b.status !== "CONFIRMED" && b.status !== "ARRIVED") continue;
            const existing = bokunByDate.get(b.visitDate) ?? [];
            existing.push(b);
            bokunByDate.set(b.visitDate, existing);
          }
          // Upcoming availability (aggregated booked counts per day)
          for (const a of bokunData.upcomingAvailability ?? []) {
            // Parse date like "Sun 29.Mar'26" → match against our dateStr
            if (a.booked > 0) {
              // Match by finding the day in our range
              for (const d of days) {
                const ds = icelandDate(d);
                // The availability date string varies, so match on the booked count
                // We'll use it as a fallback pax count
                const dayLabel = formatDayLabel(d);
                if (a.date.includes(dayLabel.split(" ")[1]?.replace(",", "") ?? "__none__")) {
                  bokunAvailByDate.set(ds, a.booked);
                }
              }
            }
          }
        } catch {
          /* ignore */
        }
      }

      // Build today's detailed bookings (merged)
      const calToday = validEvents
        .filter((ev) => {
          const dt = ev.start?.dateTime || ev.start?.date || "";
          return dt.slice(0, 10) === todayStr;
        })
        .map(parseEvent)
        .sort((a, b) => a.time.localeCompare(b.time));

      const bokunTodayRaw = bokunByDate.get(todayStr) ?? [];
      const bokunTodayParsed = bokunTodayRaw.map(parseBokunBooking);

      const calIds = new Set(calToday.map((b) => b.operator.toLowerCase()));
      const uniqueBokunToday = bokunTodayParsed.filter(
        (b) => !calIds.has(b.operator.toLowerCase())
      );
      const merged = [...calToday, ...uniqueBokunToday].sort((a, b) =>
        a.time.localeCompare(b.time)
      );
      setTodayBookings(merged);

      // Build 7-day summaries with both sources tracked separately
      const daySummaries: DaySummary[] = days.map((d) => {
        const ds = icelandDate(d);

        // Calendar (group) bookings for this day
        const dayCalEvents = validEvents.filter((ev) => {
          const dt = ev.start?.dateTime || ev.start?.date || "";
          return dt.slice(0, 10) === ds;
        });
        const groupParsed = dayCalEvents.map(parseEvent);
        const groupPax = groupParsed.reduce((s, e) => s + e.pax, 0);

        // Build group detail lines for the week view
        const groupDetails: GroupDetail[] = dayCalEvents.map((ev) => {
          const parsed = parseEvent(ev);
          const summary = ev.summary ?? "";
          const paxStr = parsed.pax > 0 ? `${parsed.pax} pax` : "";
          const label = [summary.replace(/\s*;\s*/g, " · ").trim(), paxStr]
            .filter(Boolean)
            .join(" ");
          return {
            summary: label || summary,
            pax: parsed.pax,
            time: parsed.time,
          };
        });

        // Bókun bookings for this day
        const dayBokun = bokunByDate.get(ds) ?? [];
        const bknPax = dayBokun.reduce((s, b) => s + b.pax, 0);
        // Fall back to availability aggregated count if no individual bookings
        const bokunPaxFinal = bknPax || (bokunAvailByDate.get(ds) ?? 0);

        return {
          date: d,
          dateStr: ds,
          label: formatDayLabel(d),
          bokunPax: bokunPaxFinal,
          bokunCount: dayBokun.length || (bokunAvailByDate.has(ds) ? 1 : 0),
          groupPax,
          groupCount: dayCalEvents.length,
          groupDetails,
          pax: bokunPaxFinal + groupPax,
          bookings: dayBokun.length + dayCalEvents.length,
          isToday: ds === todayStr,
        };
      });
      setWeekDays(daySummaries);
      setStatus("live");

      if (staleRef.current) clearTimeout(staleRef.current);
      staleRef.current = setTimeout(() => setStatus("stale"), 90_000);
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchData();
    refreshRef.current = setInterval(fetchData, 60_000);
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current);
      if (staleRef.current) clearTimeout(staleRef.current);
    };
  }, [fetchData]);

  const todayTotal = todayBookings.reduce((s, b) => s + b.pax, 0);
  const weekTotal = weekDays.reduce((s, d) => s + d.pax, 0);
  const weekBookings = weekDays.reduce((s, d) => s + d.bookings, 0);
  const maxDayPax = Math.max(...weekDays.map((d) => d.pax), 1);

  const dotColor =
    status === "live"
      ? "bg-emerald-400"
      : status === "stale"
      ? "bg-amber-400"
      : status === "loading"
      ? "bg-amber-400 animate-pulse"
      : "bg-red-400";

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-500/10">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
            Operations
          </h3>
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 rounded-md border border-emerald-500/15 bg-black/30 p-0.5">
          <button
            type="button"
            onClick={() => setTab("today")}
            className={`rounded px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              tab === "today"
                ? "bg-emerald-500/20 text-emerald-200"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setTab("week")}
            className={`rounded px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              tab === "week"
                ? "bg-emerald-500/20 text-emerald-200"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Next 7 Days
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-3 max-h-[400px] overflow-y-auto">
        {tab === "today" && (
          <div className="space-y-1">
            {status === "loading" && todayBookings.length === 0 && (
              <p className="text-xs text-gray-500 py-6 text-center">Loading...</p>
            )}

            {status !== "loading" && todayBookings.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-xl opacity-30 mb-2">⛵</p>
                <p className="text-xs text-gray-500 italic">No group bookings today</p>
              </div>
            )}

            {todayBookings.map((b) => {
              const svc = SERVICE_STYLES[b.service] ?? SERVICE_STYLES.other;
              return (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-[11px] text-gray-400 tabular-nums w-10 flex-shrink-0">
                    {b.time}
                  </span>
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${svc.bg} ${svc.text} flex-shrink-0 w-16 text-center`}
                  >
                    {svc.label}
                  </span>
                  <span className="text-xs text-gray-200 flex-1 truncate">
                    {b.operator}
                  </span>
                  <span className="text-xs font-semibold text-emerald-300 tabular-nums flex-shrink-0">
                    {b.pax > 0 ? `${b.pax} pax` : ""}
                  </span>
                </div>
              );
            })}

            {todayBookings.length > 0 && (
              <div className="pt-2 mt-2 border-t border-white/5 text-[10px] text-gray-500">
                Today total: <span className="text-gray-300 font-medium">{todayTotal} pax</span> ·{" "}
                {todayBookings.length} {todayBookings.length === 1 ? "booking" : "bookings"}
              </div>
            )}
          </div>
        )}

        {tab === "week" && (
          <div className="space-y-1.5">
            {weekDays.map((d) => (
              <div
                key={d.dateStr}
                className={`rounded-lg px-2 py-1.5 ${
                  d.isToday ? "border-l-2 border-l-emerald-400 bg-emerald-500/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-gray-400 w-[90px] flex-shrink-0">
                    {d.label}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.03] overflow-hidden">
                    {d.pax > 0 && (
                      <div
                        className="h-full rounded-full bg-emerald-500/40 transition-all"
                        style={{ width: `${(d.pax / maxDayPax) * 100}%` }}
                      />
                    )}
                  </div>
                  <span className="text-xs text-gray-300 tabular-nums w-14 text-right flex-shrink-0">
                    {d.pax > 0 ? `${d.pax} pax` : "—"}
                  </span>
                </div>
                {/* Source breakdown */}
                {(d.bokunCount > 0 || d.groupCount > 0) && (
                  <div className="mt-1 ml-[102px] space-y-0.5">
                    {d.bokunCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-amber-400/90 bg-amber-500/10 px-1 py-px rounded">
                          BÓKUN
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {d.bokunPax} pax · {d.bokunCount}{" "}
                          {d.bokunCount === 1 ? "booking" : "bookings"}
                        </span>
                      </div>
                    )}
                    {d.groupDetails.map((g, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-gray-500 bg-gray-700/30 px-1 py-px rounded">
                          GROUP
                        </span>
                        <span className="text-[9px] text-gray-400 truncate">
                          {g.summary}{g.time && g.time !== "All day" ? ` ${g.time}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="pt-2 mt-2 border-t border-white/5 text-[10px] text-gray-500">
              7-day total: <span className="text-gray-300 font-medium">{weekTotal} pax</span> ·{" "}
              {weekBookings} {weekBookings === 1 ? "booking" : "bookings"}
            </div>
          </div>
        )}
      </div>

      {/* Footer — Feature 3: link to Revenue Forecast */}
      <div className="px-5 py-2.5 border-t border-emerald-500/10 flex justify-end">
        <Link
          href="/control-room"
          className="text-[11px] text-emerald-400/70 hover:text-emerald-300 transition-colors hover:underline"
        >
          View Revenue Forecast →
        </Link>
      </div>
    </div>
  );
}
