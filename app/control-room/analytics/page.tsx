/**
 * Control Room — Website Analytics
 *
 * Phase 3 (2026-08-27): reads public.web_events and reports visitors, page
 * views, average time on site, top pages, referrers and the engagement funnel.
 *
 * SERVER COMPONENT ONLY. web_events has RLS enabled with no policies, so the
 * service-role client is the only way in and the key never reaches the client.
 * The range toggle is plain links, so the page needs no client JS at all.
 *
 * No PII is displayed because none is stored — the ingestion route keeps IPs
 * for rate limiting only and never writes them.
 */

import { supabaseAdmin } from "@/lib/supabase-admin";

// Internal dashboard — always read fresh.
export const dynamic = "force-dynamic";

/** Cap the read so a busy month cannot pull an unbounded set into the page. */
const ROW_LIMIT = 50000;

/** Entries shown in the top-pages and referrer lists. */
const LIST_LIMIT = 10;

type Range = "today" | "7d" | "30d";

type EventRow = {
  type: string;
  path: string | null;
  referrer_host: string | null;
  source: string | null;
  session_id: string | null;
  created_at: string;
};

const RANGE_LABELS: { value: Range; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

/** Funnel steps, in the order they are displayed. */
const FUNNEL: { type: string; label: string }[] = [
  { type: "book_tickets_click", label: "Book Tickets clicks" },
  { type: "gjaldskra_open", label: "Rate card opens" },
  { type: "gunnbjorn_open", label: "Gunnbjörn chats started" },
  { type: "groups_enquiry_submit", label: "Group enquiries sent" },
  { type: "groups_inquiry_click", label: "Group enquiry clicks" },
];

/**
 * Reykjavík runs on UTC+0 year-round (no DST), so "today" is simply today's
 * calendar date at 00:00Z. The formatter is still used to get that date in
 * museum-local terms rather than the server's timezone.
 */
function cutoffFor(range: Range): Date {
  const now = new Date();
  if (range === "7d") return new Date(now.getTime() - 7 * 864e5);
  if (range === "30d") return new Date(now.getTime() - 30 * 864e5);
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Atlantic/Reykjavik",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const g = (t: string) => p.find((x) => x.type === t)!.value;
  return new Date(`${g("year")}-${g("month")}-${g("day")}T00:00:00Z`);
}

/** m:ss, e.g. 2:14. */
function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function countBy<T>(rows: T[], key: (row: T) => string | null): [string, number][] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const k = key(row);
    if (k === null) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/* ------------------------------------------------------------------ */
/*  Presentational pieces — copied from the Website Behavior page      */
/* ------------------------------------------------------------------ */

function SummaryCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-gray-400">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-emerald-200">{value}</p>
      {subtitle ? <p className="mt-1 text-sm text-gray-400">{subtitle}</p> : null}
    </div>
  );
}

function ListCard({
  title,
  hint,
  rows,
  emptyLabel,
  footer,
}: {
  title: string;
  hint?: string;
  rows: [string, number][];
  emptyLabel: string;
  footer?: { label: string; count: number };
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {hint ? (
          <span className="text-xs uppercase tracking-[0.16em] text-gray-400">{hint}</span>
        ) : null}
      </div>

      {rows.length === 0 && !footer ? (
        <p className="py-8 text-center text-sm text-gray-400">{emptyLabel}</p>
      ) : (
        <table className="min-w-full text-left text-sm">
          <tbody>
            {rows.map(([label, count]) => (
              <tr key={label} className="border-b border-emerald-500/10 last:border-0">
                <td className="px-1 py-3 text-gray-200 break-all">{label}</td>
                <td className="px-1 py-3 text-right font-semibold text-emerald-200 w-20">
                  {count.toLocaleString("en-GB")}
                </td>
              </tr>
            ))}
            {footer ? (
              <tr className="border-t border-emerald-500/20">
                <td className="px-1 py-3 text-gray-400">{footer.label}</td>
                <td className="px-1 py-3 text-right font-semibold text-gray-400 w-20">
                  {footer.count.toLocaleString("en-GB")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rawRange } = await searchParams;
  const range: Range = rawRange === "today" || rawRange === "30d" ? rawRange : "7d";

  const cutoff = cutoffFor(range);
  const { data, error } = await supabaseAdmin
    .from("web_events")
    .select("type,path,referrer_host,source,session_id,created_at")
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: true })
    .limit(ROW_LIMIT);

  const rows = (data as EventRow[] | null) ?? [];

  // Visitors — distinct anonymous sessions.
  const visitors = new Set(rows.filter((r) => r.session_id).map((r) => r.session_id)).size;

  const pageviews = rows.filter((r) => r.type === "pageview");

  // Average time on site: first to last activity per session. Sessions with a
  // single timestamp have no measurable duration and are excluded rather than
  // counted as zero, which would drag the average down.
  const spans = new Map<string, { min: number; max: number }>();
  for (const row of rows) {
    if (!row.session_id) continue;
    const t = new Date(row.created_at).getTime();
    const span = spans.get(row.session_id);
    if (!span) spans.set(row.session_id, { min: t, max: t });
    else {
      if (t < span.min) span.min = t;
      if (t > span.max) span.max = t;
    }
  }
  const durations = [...spans.values()].map((s) => s.max - s.min).filter((d) => d > 0);
  const measuredSessions = durations.length;
  const avgMs = measuredSessions
    ? durations.reduce((a, b) => a + b, 0) / measuredSessions
    : 0;

  const topPages = countBy(pageviews, (r) => r.path).slice(0, LIST_LIMIT);
  const referrers = countBy(pageviews, (r) => r.referrer_host).slice(0, LIST_LIMIT);
  const directCount = pageviews.filter((r) => !r.referrer_host).length;

  const funnel = FUNNEL.map((step) => ({
    ...step,
    count: rows.filter((r) => r.type === step.type).length,
  }));

  return (
    <div className="space-y-6">
      {/* Header + range toggle */}
      <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Website Analytics</h2>
        <p className="mt-3 text-sm text-gray-400">
          First-party and fully anonymous — no names, emails or IP addresses are stored.
        </p>

        <div className="mt-5 flex gap-1 rounded-lg border border-emerald-500/20 bg-black/30 p-1 w-fit">
          {RANGE_LABELS.map((option) => {
            const active = option.value === range;
            return (
              <a
                key={option.value}
                href={`?range=${option.value}`}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {option.label}
              </a>
            );
          })}
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-6">
          <p className="text-sm text-gray-400">Could not load analytics.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard title="Visitors" value={visitors.toLocaleString("en-GB")} subtitle="Distinct sessions" />
            <SummaryCard title="Page Views" value={pageviews.length.toLocaleString("en-GB")} />
            <SummaryCard
              title="Avg. time on site"
              value={measuredSessions ? formatDuration(avgMs) : "—"}
              subtitle={
                measuredSessions
                  ? `across ${measuredSessions.toLocaleString("en-GB")} session${measuredSessions === 1 ? "" : "s"}`
                  : "not enough data"
              }
            />
          </section>

          {/* Top pages + referrers */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ListCard
              title="Top Pages"
              hint={`Top ${LIST_LIMIT}`}
              rows={topPages}
              emptyLabel="No page views in this range."
            />
            <ListCard
              title="Referrers"
              hint={`Top ${LIST_LIMIT}`}
              rows={referrers}
              emptyLabel="No referrers in this range."
              footer={{ label: "Direct / none", count: directCount }}
            />
          </section>

          {/* Engagement funnel */}
          <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Engagement</h3>
            <table className="min-w-full text-left text-sm">
              <tbody>
                {funnel.map((step) => (
                  <tr key={step.type} className="border-b border-emerald-500/10 last:border-0">
                    <td className="px-1 py-3 text-gray-200">{step.label}</td>
                    <td className="px-1 py-3 text-right font-semibold text-emerald-200 w-20">
                      {step.count.toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <p className="px-1 text-xs text-gray-500">
            Average time on site is an estimate — measured from each visit&apos;s first
            pageview to its last activity ping; single-page visits that never trigger a
            ping aren&apos;t counted.
          </p>
        </>
      )}
    </div>
  );
}
