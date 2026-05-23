"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  CreditCard,
  Calendar,
  Upload,
  Download,
  X,
  RefreshCw,
  AlertCircle,
  Coffee,
  Ticket,
  ChevronRight,
} from "lucide-react";
import AdminNavBar from "@/app/components/admin/AdminNavBar";
import type { ForecastPayload, ForecastComparison } from "@/lib/forecast/types";
import { formatISK as fmtISKForecast } from "@/lib/forecast/types";
import {
  applyOverrides,
  clearOverrides,
  hasOverrides,
  loadOverrides,
  recomputeAnnualTotals,
  recomputeTopStrip,
  saveOverrides,
  type OverrideMap,
} from "@/lib/forecast/client-overrides";
import ForecastTopStrip from "@/app/components/forecast/ForecastTopStrip";
import ForecastMonthlyTable from "@/app/components/forecast/ForecastMonthlyTable";
import RevenueCompositionBar from "@/app/components/forecast/RevenueCompositionBar";
import ProfitabilityLayer from "@/app/components/forecast/ProfitabilityLayer";
import ForecastDisconnected from "@/app/components/forecast/ForecastDisconnected";

interface StreamData {
  gross: number;
  net: number;
  transactions: number;
  pax?: number;
  fees?: number;
  events?: number;
}

interface CalendarDetail {
  title: string;
  description: string;
  startTime: string | null;
  pax: number;
  amount: number;
}

interface BokunDetail {
  channel: string;
  product_type: string;
  pax: number;
  amount: number;
  booking_ref?: string | null;
}

interface DayBooking {
  confirmationCode: string;
  customer: { name: string | null; phone: string | null; email: string | null; nationality: string | null };
  startTime: string | null;
  product: string;
  channelTitle: string;
  agent: string | null;
  pax: number;
  paxBreakdown: { category: string; count: number }[];
  amount: number;
  currency: string;
}

interface SummaryResponse {
  period: { from: string; to: string };
  streams: {
    bokun: StreamData & { pax: number };
    teya: StreamData & { fees: number };
    calendar: { gross: number; pax: number; events: number };
  };
  total: { gross: number; net: number };
  daily: Array<{
    date: string;
    bokun: number;
    teya: number;
    calendar: number;
    total: number;
    bokun_detail: BokunDetail[];
    calendar_detail: CalendarDetail[];
  }>;
}

const CHANNEL_LABELS: Record<string, string> = {
  web: "Online",
  ota: "Travel Agent",
  cruise: "Cruise",
  group: "Group",
  school: "School",
  walkin: "Walk-in",
  unknown: "Other",
};

const PRODUCT_LABELS: Record<string, string> = {
  entrance: "Entrance",
  breakfast: "Breakfast",
  combo: "Entrance + Breakfast",
  shop: "Shop",
  unknown: "Other",
};

const CHANNEL_COLORS: Record<string, string> = {
  web: "bg-blue-900/60 text-blue-300",
  ota: "bg-indigo-900/60 text-indigo-300",
  cruise: "bg-cyan-900/60 text-cyan-300",
  group: "bg-emerald-900/60 text-emerald-300",
  school: "bg-yellow-900/60 text-yellow-300",
  walkin: "bg-neutral-800 text-neutral-400",
  unknown: "bg-neutral-800 text-neutral-500",
};

interface UploadResult {
  imported?: number;
  skipped?: number;
  errors?: string[];
  error?: string;
}

function formatISK(n: number): string {
  return n.toLocaleString("is-IS") + " kr";
}

function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysToIso(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isoWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function isoWeekEnd(): string {
  return addDaysToIso(isoWeekStart(), 6);
}

function isoNextWeekStart(): string {
  return addDaysToIso(isoWeekStart(), 7);
}

function isoNextWeekEnd(): string {
  return addDaysToIso(isoWeekStart(), 13);
}

function isoMonthStart(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

function isoMonthEnd(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return last.toISOString().slice(0, 10);
}

function isoNextMonthStart(): string {
  const d = new Date();
  const y = d.getMonth() === 11 ? d.getFullYear() + 1 : d.getFullYear();
  const m = (d.getMonth() + 2) > 12 ? 1 : d.getMonth() + 2;
  return `${y}-${String(m).padStart(2, "0")}-01`;
}

function isoNextMonthEnd(): string {
  const s = isoNextMonthStart();
  const [y, m] = s.split("-").map(Number);
  const last = new Date(y, m, 0);
  return last.toISOString().slice(0, 10);
}

function fmtRange(from: string, to: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso + "T12:00:00Z");
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  };
  return from === to ? fmt(from) : `${fmt(from)} – ${fmt(to)}`;
}

type Preset = "today" | "week" | "next-week" | "month" | "next-month" | "custom";

const PRESET_COLORS: Record<Preset, { accent: string; glow: string }> = {
  "today":      { accent: "#0ea5e9", glow: "rgba(14,165,233,0.12)"  },
  "week":       { accent: "#10b981", glow: "rgba(16,185,129,0.12)"  },
  "next-week":  { accent: "#06b6d4", glow: "rgba(6,182,212,0.12)"   },
  "month":      { accent: "#8b5cf6", glow: "rgba(139,92,246,0.12)"  },
  "next-month": { accent: "#ec4899", glow: "rgba(236,72,153,0.12)"  },
  "custom":     { accent: "#f59e0b", glow: "rgba(245,158,11,0.12)"  },
};

const PRESETS: { label: string; key: Preset }[] = [
  { label: "Today",      key: "today"      },
  { label: "This Week",  key: "week"       },
  { label: "Next Week",  key: "next-week"  },
  { label: "This Month", key: "month"      },
  { label: "Next Month", key: "next-month" },
  { label: "Custom",     key: "custom"     },
];

function presetRange(preset: Preset, customFrom: string, customTo: string): { from: string; to: string } {
  const t = isoToday();
  if (preset === "today")      return { from: t, to: t };
  if (preset === "week")       return { from: isoWeekStart(), to: isoWeekEnd() };
  if (preset === "next-week")  return { from: isoNextWeekStart(), to: isoNextWeekEnd() };
  if (preset === "month")      return { from: isoMonthStart(), to: isoMonthEnd() };
  if (preset === "next-month") return { from: isoNextMonthStart(), to: isoNextMonthEnd() };
  return { from: customFrom, to: customTo };
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  loading,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400 font-medium">{label}</span>
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-32 rounded-lg bg-white/10 animate-pulse" />
      ) : (
        <span className="text-2xl font-semibold text-off-white tabular-nums">{value}</span>
      )}
      <span className="text-xs text-neutral-500">{sub}</span>
    </div>
  );
}

function UploadModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/teya/upload", { method: "POST", body: fd });
      const json: UploadResult = await res.json();
      setResult(json);
      if (!json.error && (json.imported ?? 0) > 0) {
        setTimeout(() => { onSuccess(); onClose(); }, 1800);
      }
    } catch {
      setResult({ error: "Network error — please try again." });
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
        <h2 className="text-lg font-semibold text-off-white mb-1">Upload Teya CSV</h2>
        <p className="text-sm text-neutral-400 mb-5">
          Drag and drop your Teya settlement CSV or click to browse.
        </p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={[
            "rounded-xl border-2 border-dashed p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors",
            dragging
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-white/20 hover:border-white/40 bg-white/5",
          ].join(" ")}
        >
          <Upload size={28} className="text-neutral-400" />
          <span className="text-sm text-neutral-400">
            {uploading ? "Uploading..." : "Drop CSV here or click to select"}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
        {result && (
          <div
            className={[
              "mt-4 rounded-xl p-4 text-sm",
              result.error ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400",
            ].join(" ")}
          >
            {result.error ? (
              <span>{result.error}</span>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{result.imported} rows imported</span>
                {(result.skipped ?? 0) > 0 && (
                  <span className="text-neutral-400">{result.skipped} rows skipped</span>
                )}
                {(result.errors?.length ?? 0) > 0 && (
                  <ul className="mt-1 space-y-0.5 text-xs text-red-400">
                    {result.errors!.slice(0, 5).map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                    {result.errors!.length > 5 && (
                      <li>...and {result.errors!.length - 5} more</li>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0);
  return (
    <div className="rounded-xl border border-white/10 bg-gray-900/95 p-3 text-xs shadow-xl">
      <div className="font-medium text-off-white mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-neutral-300 tabular-nums">{formatISK(p.value)}</span>
        </div>
      ))}
      <div className="mt-2 border-t border-white/10 pt-2 flex justify-between">
        <span className="text-neutral-400">Total</span>
        <span className="text-off-white font-semibold tabular-nums">{formatISK(total)}</span>
      </div>
    </div>
  );
}

const INDIVIDUAL_CHANNELS = new Set(["group", "cruise", "school", "ota"]);

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, "\t")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\t+/g, " · ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function CalendarEventModal({ event, onClose }: { event: CalendarDetail; onClose: () => void }) {
  const hasBreakfast = /breakfast|morgunverð/i.test(event.title + " " + event.description);
  const cleanNotes = event.description ? stripHtml(event.description) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 shadow-2xl">
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/10">
          <div className="flex-1 pr-4">
            <p className="text-base font-semibold text-off-white leading-snug" style={{ fontFamily: "var(--font-text)" }}>
              {event.title}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {event.startTime && (
                <span className="text-emerald-400 font-semibold text-sm tabular-nums">{event.startTime}</span>
              )}
              {event.pax > 0 && (
                <span className="text-neutral-400 text-sm">{event.pax} pax</span>
              )}
              <span className={[
                "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                hasBreakfast ? "bg-amber-500/20 text-amber-400" : "bg-neutral-700/60 text-neutral-400",
              ].join(" ")}>
                {hasBreakfast ? <><Coffee size={10} /> Breakfast included</> : <><Ticket size={10} /> Entrance only</>}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {cleanNotes ? (
            <div>
              <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wide font-medium">Notes</p>
              <p className="text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "var(--font-text)" }}>
                {cleanNotes}
              </p>
            </div>
          ) : (
            <p className="text-sm text-neutral-600">No notes on this calendar event.</p>
          )}

          {event.amount > 0 && (
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-neutral-500">Estimated revenue</span>
              <span className="text-amber-400 font-semibold tabular-nums">{formatISK(event.amount)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingDetailModal({
  date,
  bookingRef,
  channel,
  onClose,
}: {
  date: string;
  bookingRef: string | null;
  channel: string;
  onClose: () => void;
}) {
  const [bookings, setBookings] = useState<DayBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bokun/day-bookings?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        const all: DayBooking[] = d.bookings ?? [];
        if (bookingRef) {
          // Specific booking clicked — show just that one
          setBookings(all.filter((b) => b.confirmationCode === bookingRef));
        } else {
          // Aggregated row clicked — show all bookings for that day (user can scan the list)
          setBookings(all);
        }
      })
      .catch(() => setError("Failed to load booking details"))
      .finally(() => setLoading(false));
  }, [date, bookingRef]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-gray-900 shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-off-white">
              {bookingRef ? "Booking Details" : "All Bookings"}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">{date}</p>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-neutral-600 text-sm">
              Loading...
            </div>
          ) : error ? (
            <div className="text-red-400 text-sm py-4">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="text-neutral-600 text-sm py-4 text-center">No booking details found</div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.confirmationCode}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
                >
                  {/* Top row: ref + time + amount */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-neutral-500 font-mono">{b.confirmationCode}</span>
                      <span className="text-sm font-medium text-off-white">
                        {b.agent ?? b.channelTitle ?? "—"}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      {b.startTime && (
                        <div className="text-lg font-semibold text-emerald-400">{b.startTime}</div>
                      )}
                      <div className="text-xs text-neutral-400 tabular-nums">{formatISK(b.amount)}</div>
                    </div>
                  </div>

                  {/* Product + pax */}
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded-lg bg-blue-900/40 text-blue-300 text-xs font-medium">
                      {b.product}
                    </span>
                    <span className="text-neutral-400">{b.pax} pax total</span>
                    {b.paxBreakdown.filter((p) => p.count > 0).map((p) => (
                      <span key={p.category} className="text-xs text-neutral-600">
                        {p.count}× {p.category}
                      </span>
                    ))}
                  </div>

                  {/* Customer details */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <Detail label="Name" value={b.customer.name} />
                    <Detail label="Phone" value={b.customer.phone} highlight />
                    <Detail label="Email" value={b.customer.email} />
                    <Detail label="Nationality" value={b.customer.nationality} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 2026 projected group pax (calendar bookings) ────────────────────────────
const PROJECTED_2026: Record<string, { bf: number; ent: number }> = {
  Jan: { bf: 81,  ent: 33    },
  Feb: { bf: 178, ent: 103   },
  Mar: { bf: 396, ent: 97    },
  Apr: { bf: 260, ent: 374   },
  May: { bf: 451, ent: 1725  },
  Jun: { bf: 736, ent: 3297  },
  Jul: { bf: 558, ent: 3579  },
  Aug: { bf: 371, ent: 2747  },
  Sep: { bf: 183, ent: 12173 },
  Oct: { bf: 266, ent: 366   },
  Nov: { bf: 35,  ent: 0     },
  Dec: { bf: 0,   ent: 0     },
};

const MONTHS_2026 = [
  { key: "2026-01", label: "Jan" }, { key: "2026-02", label: "Feb" },
  { key: "2026-03", label: "Mar" }, { key: "2026-04", label: "Apr" },
  { key: "2026-05", label: "May" }, { key: "2026-06", label: "Jun" },
  { key: "2026-07", label: "Jul" }, { key: "2026-08", label: "Aug" },
  { key: "2026-09", label: "Sep" }, { key: "2026-10", label: "Oct" },
  { key: "2026-11", label: "Nov" }, { key: "2026-12", label: "Dec" },
];

interface MonthlyActual {
  calBf: number;
  calEnt: number;
  bokunPax: number;
}

function paxDelta(actual: number, projected: number) {
  if (projected === 0 && actual === 0) return null;
  const diff = actual - projected;
  if (diff === 0) return null;
  const pct = projected > 0 ? Math.round((diff / projected) * 100) : null;
  return { diff, pct, over: diff > 0 };
}

function Detail({ label, value, highlight }: { label: string; value: string | null; highlight?: boolean }) {
  if (!value) return <div className="text-xs text-neutral-700">{label}: —</div>;
  return (
    <div className="text-xs">
      <span className="text-neutral-500">{label}: </span>
      <span className={highlight ? "text-emerald-300 font-medium" : "text-neutral-300"}>{value}</span>
    </div>
  );
}

// ── Forecast helpers (mirrored from control-room/forecasts) ─────────────────
function AnnualSummary({
  payload,
  annualOverride,
}: {
  payload: ForecastPayload;
  annualOverride: { revenue_booked: number | null; revenue_forecast: number | null; visitors_forecast: number | null; profit_loss_forecast: number | null };
}) {
  const at = annualOverride;
  const bookedSharePct =
    at.revenue_booked && at.revenue_forecast
      ? ((at.revenue_booked / at.revenue_forecast) * 100).toFixed(0)
      : null;
  const items: { label: string; value: React.ReactNode }[] = [
    { label: "Annual Revenue Plan",    value: fmtISKForecast(at.revenue_forecast, true) },
    { label: "Annual Revenue Booked",  value: fmtISKForecast(at.revenue_booked, true) },
    { label: "Booked Share",           value: bookedSharePct ? `${bookedSharePct}%` : "—" },
    { label: "Annual Guests Plan",     value: at.visitors_forecast?.toLocaleString() ?? "—" },
    {
      label: "Annual Operating Result",
      value: (
        <span className={at.profit_loss_forecast !== null && at.profit_loss_forecast < 0 ? "text-amber-400" : "text-emerald-300"}>
          {fmtISKForecast(at.profit_loss_forecast, true)}
        </span>
      ),
    },
    { label: "Version", value: <span className="text-[11px] text-zinc-400">{payload.version.name}</span> },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-zinc-800/50 bg-[#0b1623]/60 px-3 py-2.5">
          <p className="text-[9px] uppercase tracking-widest text-zinc-600 mb-0.5">{item.label}</p>
          <div className="text-sm font-semibold text-zinc-100 tabular-nums">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

export default function RevenuePage() {
  const [preset, setPreset] = useState<Preset>("month");
  const [customFrom, setCustomFrom] = useState(isoMonthStart());
  const [customTo, setCustomTo] = useState(isoToday());
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [bookingModal, setBookingModal] = useState<{ date: string; bookingRef: string | null; channel: string } | null>(null);
  const [calModal, setCalModal] = useState<CalendarDetail | null>(null);
  const [monthlyActual, setMonthlyActual] = useState<Record<string, MonthlyActual>>({});
  const [monthlyLoading, setMonthlyLoading] = useState(true);

  const { from, to } = presetRange(preset, customFrom, customTo);

  // Fetch full-year data once on mount for the monthly overview
  useEffect(() => {
    fetch("/api/revenue/summary?from=2026-01-01&to=2026-12-31")
      .then((r) => r.json())
      .then((d: SummaryResponse) => {
        const agg: Record<string, MonthlyActual> = {};
        for (const day of d.daily ?? []) {
          const mk = day.date.slice(0, 7);
          if (!agg[mk]) agg[mk] = { calBf: 0, calEnt: 0, bokunPax: 0 };
          for (const ev of day.calendar_detail ?? []) {
            const isBf = /breakfast|morgunverð|morgunmat/i.test(ev.title + " " + ev.description);
            if (isBf) agg[mk].calBf += ev.pax;
            else agg[mk].calEnt += ev.pax;
          }
          for (const b of day.bokun_detail ?? []) {
            agg[mk].bokunPax += b.pax;
          }
        }
        setMonthlyActual(agg);
      })
      .catch(() => {})
      .finally(() => setMonthlyLoading(false));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/revenue/summary?from=${from}&to=${to}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/revenue/export?from=${from}&to=${to}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vikingworld-revenue-${isoToday()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setExporting(false);
    }
  }

  const streams = data?.streams;
  const total = data?.total;
  const daily = data?.daily ?? [];

  const chartData = daily.map((d) => ({
    date: shortDate(d.date),
    Bokun: d.bokun,
    Teya: d.teya,
    Calendar: d.calendar,
  }));

  return (
    <div className="min-h-screen bg-base-charcoal text-off-white">
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        <AdminNavBar />

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-off-white">Revenue Intelligence</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {from === to ? from : `${from} → ${to}`}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50 shrink-0"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Period selector */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {PRESETS.map((p) => {
            const c = PRESET_COLORS[p.key];
            const isActive = preset === p.key;
            const { from: pFrom, to: pTo } = presetRange(p.key, customFrom, customTo);
            const dateLabel = p.key === "custom" && !isActive
              ? "pick dates"
              : fmtRange(pFrom, pTo);
            return (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                style={{
                  borderTop: `3px solid ${isActive ? c.accent : "rgba(255,255,255,0.07)"}`,
                  background: isActive ? c.glow : "rgba(255,255,255,0.02)",
                  borderLeft: "1px solid rgba(255,255,255,0.07)",
                  borderRight: "1px solid rgba(255,255,255,0.07)",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                }}
                className="rounded-b-xl rounded-t-sm pt-4 pb-3 px-4 text-left transition-all hover:bg-white/5"
              >
                <p className="text-[12px] font-semibold leading-tight" style={{ color: isActive ? c.accent : "rgba(255,255,255,0.45)" }}>
                  {p.label}
                </p>
                <p className="text-[11px] mt-1.5 leading-tight font-mono" style={{ color: isActive ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.18)" }}>
                  {dateLabel}
                </p>
              </button>
            );
          })}
        </div>

        {/* Custom date pickers — shown inline below when custom is active */}
        {preset === "custom" && (
          <div className="flex items-center gap-3 -mt-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-off-white outline-none focus:border-amber-400/50"
            />
            <span className="text-neutral-600">→</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              style={{ colorScheme: "dark" }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-off-white outline-none focus:border-amber-400/50"
            />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Revenue"
            value={total ? formatISK(total.gross) : "..."}
            sub={total ? `Net: ${formatISK(total.net)}` : ""}
            icon={TrendingUp}
            color="bg-emerald-600/80"
            loading={loading}
          />
          <KpiCard
            label="Bokun Revenue"
            value={streams ? formatISK(streams.bokun.gross) : "..."}
            sub={streams ? `${streams.bokun.pax} pax - ${streams.bokun.transactions} bookings` : ""}
            icon={CreditCard}
            color="bg-blue-600/80"
            loading={loading}
          />
          <KpiCard
            label="Teya Revenue"
            value={streams ? formatISK(streams.teya.gross) : "..."}
            sub={streams ? `Net: ${formatISK(streams.teya.net)} - Fees: ${formatISK(streams.teya.fees)}` : ""}
            icon={CreditCard}
            color="bg-violet-600/80"
            loading={loading}
          />
          <KpiCard
            label="Calendar (Groups)"
            value={streams ? formatISK(streams.calendar.gross) : "..."}
            sub={streams ? `${streams.calendar.pax} pax - ${streams.calendar.events} events` : ""}
            icon={Calendar}
            color="bg-amber-600/80"
            loading={loading}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl p-6">
          <h2 className="text-sm font-medium text-neutral-400 mb-5">Daily Revenue by Stream</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-neutral-600 text-sm">
              Loading chart...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-neutral-600 text-sm">
              No data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "#9ca3af" }}
                  iconType="square"
                  iconSize={10}
                />
                <Bar dataKey="Bokun" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Teya" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="Calendar" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Monthly Overview ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-off-white">Monthly Overview — 2026</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Actual vs projected · groups + Bokun</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-neutral-600">
              <span><span className="text-emerald-400">▲</span> above target</span>
              <span><span className="text-red-400">▼</span> below target</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-neutral-500 font-medium text-xs uppercase tracking-wider">Month</th>
                  <th className="text-right px-4 py-3 text-amber-400 font-medium text-xs uppercase tracking-wider">BF Actual</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium text-xs uppercase tracking-wider">BF Target</th>
                  <th className="text-right px-4 py-3 text-sky-400 font-medium text-xs uppercase tracking-wider">ENT Actual</th>
                  <th className="text-right px-4 py-3 text-neutral-500 font-medium text-xs uppercase tracking-wider">ENT Target</th>
                  <th className="text-right px-4 py-3 text-blue-400 font-medium text-xs uppercase tracking-wider">Bokun</th>
                  <th className="text-right px-6 py-3 text-neutral-300 font-medium text-xs uppercase tracking-wider">Total Pax</th>
                </tr>
              </thead>
              <tbody>
                {monthlyLoading ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded bg-white/5 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <>
                    {MONTHS_2026.map(({ key, label }) => {
                      const act = monthlyActual[key] ?? { calBf: 0, calEnt: 0, bokunPax: 0 };
                      const proj = PROJECTED_2026[label];
                      const bfDelta = paxDelta(act.calBf, proj.bf);
                      const entDelta = paxDelta(act.calEnt, proj.ent);
                      const total = act.calBf + act.calEnt + act.bokunPax;
                      const isEmpty = total === 0 && proj.bf === 0 && proj.ent === 0;
                      return (
                        <tr key={key} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3 font-medium text-neutral-300">{label} 2026</td>

                          {/* BF actual + delta */}
                          <td className="px-4 py-3 text-right tabular-nums">
                            <span className={act.calBf > 0 ? "text-amber-300" : "text-neutral-700"}>
                              {act.calBf > 0 ? act.calBf.toLocaleString() : "—"}
                            </span>
                            {bfDelta && (
                              <span className={`ml-2 text-[10px] font-medium ${bfDelta.over ? "text-emerald-400" : "text-red-400"}`}>
                                {bfDelta.over ? "▲" : "▼"}{bfDelta.pct != null ? `${Math.abs(bfDelta.pct)}%` : ""}
                              </span>
                            )}
                          </td>

                          {/* BF projected */}
                          <td className="px-4 py-3 text-right tabular-nums text-neutral-600">
                            {proj.bf > 0 ? proj.bf.toLocaleString() : "—"}
                          </td>

                          {/* ENT actual + delta */}
                          <td className="px-4 py-3 text-right tabular-nums">
                            <span className={act.calEnt > 0 ? "text-sky-300" : "text-neutral-700"}>
                              {act.calEnt > 0 ? act.calEnt.toLocaleString() : "—"}
                            </span>
                            {entDelta && (
                              <span className={`ml-2 text-[10px] font-medium ${entDelta.over ? "text-emerald-400" : "text-red-400"}`}>
                                {entDelta.over ? "▲" : "▼"}{entDelta.pct != null ? `${Math.abs(entDelta.pct)}%` : ""}
                              </span>
                            )}
                          </td>

                          {/* ENT projected */}
                          <td className="px-4 py-3 text-right tabular-nums text-neutral-600">
                            {proj.ent > 0 ? proj.ent.toLocaleString() : "—"}
                          </td>

                          {/* Bokun */}
                          <td className="px-4 py-3 text-right tabular-nums text-blue-300">
                            {act.bokunPax > 0 ? act.bokunPax.toLocaleString() : <span className="text-neutral-700">—</span>}
                          </td>

                          {/* Total */}
                          <td className="px-6 py-3 text-right tabular-nums font-medium">
                            {isEmpty ? <span className="text-neutral-700">—</span> : <span className="text-off-white">{total.toLocaleString()}</span>}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Totals row */}
                    {(() => {
                      const totAct = { calBf: 0, calEnt: 0, bokunPax: 0 };
                      const totProj = { bf: 0, ent: 0 };
                      for (const { key, label } of MONTHS_2026) {
                        const a = monthlyActual[key] ?? { calBf: 0, calEnt: 0, bokunPax: 0 };
                        const p = PROJECTED_2026[label];
                        totAct.calBf += a.calBf; totAct.calEnt += a.calEnt; totAct.bokunPax += a.bokunPax;
                        totProj.bf += p.bf; totProj.ent += p.ent;
                      }
                      const grandTotal = totAct.calBf + totAct.calEnt + totAct.bokunPax;
                      return (
                        <tr className="border-t border-white/10 bg-white/[0.02]">
                          <td className="px-6 py-3 font-semibold text-neutral-300">Total</td>
                          <td className="px-4 py-3 text-right tabular-nums font-semibold text-amber-300">{totAct.calBf.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-neutral-500">{totProj.bf.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-semibold text-sky-300">{totAct.calEnt.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right tabular-nums text-neutral-500">{totProj.ent.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right tabular-nums font-semibold text-blue-300">{totAct.bokunPax.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right tabular-nums font-bold text-off-white">{grandTotal.toLocaleString()}</td>
                        </tr>
                      );
                    })()}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Daily Breakdown ───────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-sm font-medium text-neutral-400">Daily Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-neutral-500 font-medium">Day</th>
                  <th className="text-right px-4 py-3 text-blue-400 font-medium">Bokun</th>
                  <th className="text-right px-4 py-3 text-violet-400 font-medium">Teya</th>
                  <th className="text-right px-4 py-3 text-amber-400 font-medium">Calendar</th>
                  <th className="text-right px-6 py-3 text-neutral-300 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-3">
                          <div className="h-4 rounded bg-white/10 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : daily.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-600">
                      No data for selected period
                    </td>
                  </tr>
                ) : (
                  daily.map((row) => (
                    <React.Fragment key={row.date}>
                      {/* Main date row */}
                      <tr
                        key={row.date}
                        className={[
                          "transition-colors",
                          row.bokun_detail.length > 0 ? "border-b border-white/[0.03]" : "border-b border-white/5",
                        ].join(" ")}
                      >
                        <td className="px-6 py-2.5">
                          <span className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">
                            {new Date(row.date + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })}
                          </span>
                          <span className="block text-xs font-mono text-neutral-600 mt-0.5">{row.date}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-blue-300">
                          {row.bokun > 0 ? formatISK(row.bokun) : <span className="text-neutral-700">-</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-violet-300">
                          {row.teya > 0 ? formatISK(row.teya) : <span className="text-neutral-700">-</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-amber-300">
                          {row.calendar > 0 ? formatISK(row.calendar) : <span className="text-neutral-700">-</span>}
                        </td>
                        <td className="px-6 py-2.5 text-right tabular-nums text-off-white font-medium">
                          {row.total > 0 ? formatISK(row.total) : <span className="text-neutral-700">-</span>}
                        </td>
                      </tr>
                      {/* Bokun breakdown sub-rows */}
                      {row.bokun_detail.map((detail, i) => {
                        const isClickable = INDIVIDUAL_CHANNELS.has(detail.channel);
                        const hasBreakfast = detail.product_type === "breakfast" || detail.product_type === "combo";
                        const productLabel = PRODUCT_LABELS[detail.product_type] ?? detail.product_type;
                        return (
                          <tr
                            key={`${row.date}-${i}`}
                            onClick={isClickable
                              ? () => setBookingModal({ date: row.date, bookingRef: detail.booking_ref ?? null, channel: detail.channel })
                              : undefined}
                            className={[
                              "transition-colors",
                              i === row.bokun_detail.length - 1 ? "border-b border-white/5" : "border-b border-white/[0.02]",
                              isClickable
                                ? "bg-blue-950/30 cursor-pointer hover:bg-blue-900/40 group"
                                : "bg-blue-950/10",
                            ].join(" ")}
                          >
                            <td className="pl-10 pr-4 py-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-800">└</span>

                                {/* Channel badge */}
                                <span className={[
                                  "px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0",
                                  CHANNEL_COLORS[detail.channel] ?? CHANNEL_COLORS.unknown,
                                ].join(" ")}>
                                  {CHANNEL_LABELS[detail.channel] ?? detail.channel}
                                </span>

                                {/* Product type — breakfast highlighted in amber */}
                                <span className={[
                                  "flex items-center gap-1 font-medium",
                                  hasBreakfast ? "text-amber-400" : "text-neutral-300",
                                ].join(" ")}>
                                  {hasBreakfast
                                    ? <Coffee size={11} className="shrink-0" />
                                    : <Ticket size={11} className="shrink-0 text-neutral-500" />}
                                  {productLabel}
                                </span>

                                <span className="text-neutral-600">·</span>
                                <span className="text-neutral-500">{detail.pax} pax</span>

                                {/* Click affordance — visible button on clickable rows */}
                                {isClickable && (
                                  <span className="ml-auto flex items-center gap-1 text-[10px] text-blue-400 group-hover:text-blue-300 transition-colors shrink-0">
                                    who's coming
                                    <ChevronRight size={11} />
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right tabular-nums text-blue-300/70 text-xs">
                              {formatISK(detail.amount)}
                            </td>
                            <td colSpan={3} />
                          </tr>
                        );
                      })}
                      {/* Calendar event sub-rows */}
                      {row.calendar_detail.map((ev, i) => {
                        const hasBreakfast = /breakfast|morgunverð/i.test(ev.title + " " + ev.description);
                        return (
                          <tr
                            key={`cal-${row.date}-${i}`}
                            onClick={() => setCalModal(ev)}
                            className={[
                              "transition-colors cursor-pointer group",
                              i === row.calendar_detail.length - 1 ? "border-b border-white/5" : "border-b border-white/[0.02]",
                              "bg-amber-950/20 hover:bg-amber-900/30",
                            ].join(" ")}
                          >
                            <td className="pl-10 pr-4 py-2 text-xs" colSpan={3}>
                              <div className="flex items-center gap-2">
                                <span className="text-amber-800">└</span>
                                {ev.startTime && (
                                  <span className="text-emerald-400 font-semibold tabular-nums shrink-0">{ev.startTime}</span>
                                )}
                                <span className={hasBreakfast ? "text-amber-400 font-medium flex items-center gap-1" : "text-neutral-300 font-medium"}>
                                  {hasBreakfast && <Coffee size={11} className="shrink-0" />}
                                  {ev.title}
                                </span>
                                {ev.pax > 0 && <span className="text-neutral-600">· {ev.pax} pax</span>}
                                <span className="ml-auto flex items-center gap-1 text-[10px] text-amber-500 group-hover:text-amber-300 transition-colors shrink-0">
                                  details <ChevronRight size={11} />
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right tabular-nums text-amber-300/70 text-xs">
                              {ev.amount > 0 ? formatISK(ev.amount) : ""}
                            </td>
                            <td />
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))
                )}
              </tbody>
              {!loading && daily.length > 0 && total && (
                <tfoot>
                  <tr className="border-t border-white/10 bg-white/[0.02]">
                    <td className="px-6 py-3 text-neutral-400 font-medium">Total</td>
                    <td className="px-4 py-3 text-right tabular-nums text-blue-300 font-medium">
                      {formatISK(streams?.bokun.gross ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-violet-300 font-medium">
                      {formatISK(streams?.teya.gross ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-amber-300 font-medium">
                      {formatISK(streams?.calendar.gross ?? 0)}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums text-off-white font-semibold">
                      {formatISK(total.gross)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pb-6">
          <button
            onClick={async () => {
              setSyncing(true);
              setSyncMsg(null);
              try {
                const res = await fetch("/api/bokun/sync", { method: "POST" });
                const d = await res.json();
                setSyncMsg(d.status === "ok" ? `Synced — ${d.upserted ?? 0} bookings updated` : (d.message ?? "Sync failed"));
                if (d.status === "ok") fetchData();
              } catch {
                setSyncMsg("Sync request failed");
              } finally {
                setSyncing(false);
              }
            }}
            disabled={syncing}
            className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing Bokun..." : "Sync Bokun"}
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors"
          >
            <Upload size={15} />
            Upload Teya CSV
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-sm font-medium text-neutral-300 transition-colors disabled:opacity-50"
          >
            <Download size={15} />
            {exporting ? "Exporting..." : "Export Excel"}
          </button>
          {syncMsg && (
            <span className="text-xs text-neutral-400">{syncMsg}</span>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={fetchData}
        />
      )}

      {bookingModal && (
        <BookingDetailModal
          date={bookingModal.date}
          bookingRef={bookingModal.bookingRef}
          channel={bookingModal.channel}
          onClose={() => setBookingModal(null)}
        />
      )}

      {calModal && (
        <CalendarEventModal event={calModal} onClose={() => setCalModal(null)} />
      )}
    </div>
  );
}
