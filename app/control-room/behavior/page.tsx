/**
 * Control Room — Website Behavior
 *
 * Phase 3 (2026-08-25): surfaces what visitors actually ask Gunnbjörn, from
 * public.gunnbjorn_questions.
 *
 * SERVER COMPONENT ONLY. That table has RLS enabled with no policies, so it is
 * readable only through the service-role client, which bypasses RLS. There is
 * no "use client" here and no fetch from the browser — the service-role key
 * never leaves the server.
 *
 * The previous placeholder body is kept at the bottom of this file, commented
 * out rather than deleted.
 */

import { supabaseAdmin } from "@/lib/supabase-admin";

// Internal dashboard — always read fresh, never cache a build-time snapshot.
export const dynamic = "force-dynamic";

/** Latest questions shown in the recent feed. */
const RECENT_LIMIT = 50;

/** How many entries the top-questions list shows. */
const TOP_LIMIT = 15;

/**
 * Rows pulled for aggregation. Capped so a very chatty month cannot pull an
 * unbounded result set into the page.
 */
const AGGREGATE_LIMIT = 5000;

type QuestionRow = {
  id: string;
  created_at: string;
  question: string;
  lang: string | null;
};

type TopQuestion = {
  /** Normalised key used for grouping. */
  key: string;
  /** A real, original-case question from the group — nicer to read than the key. */
  example: string;
  count: number;
};

/**
 * Group questions that are the same apart from casing and whitespace.
 * Intentionally conservative: no stemming or fuzzy matching, so counts stay
 * explainable. "Opening hours?" and "opening  hours?" merge; "what are your
 * opening hours" stays separate.
 */
function normalise(question: string): string {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildTopQuestions(rows: QuestionRow[]): TopQuestion[] {
  const groups = new Map<string, TopQuestion>();

  for (const row of rows) {
    const key = normalise(row.question);
    if (!key) continue;

    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      groups.set(key, { key, example: row.question.trim(), count: 1 });
    }
  }

  return [...groups.values()]
    .sort((a, b) => b.count - a.count || a.example.localeCompare(b.example))
    .slice(0, TOP_LIMIT);
}

function formatTimestamp(iso: string): string {
  // Museum operates on Iceland time; keep the dashboard in that timezone.
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Atlantic/Reykjavik",
  }).format(new Date(iso));
}

/* ------------------------------------------------------------------ */
/*  Presentational pieces — match the existing Control Room cards      */
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-10 text-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function WebsiteBehaviorPage() {
  const { data, error } = await supabaseAdmin
    .from("gunnbjorn_questions")
    .select("id, created_at, question, lang")
    .order("created_at", { ascending: false })
    .limit(AGGREGATE_LIMIT);

  const rows: QuestionRow[] = (data as QuestionRow[] | null) ?? [];

  const now = Date.now();
  const since = (days: number) => now - days * 24 * 60 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const countSince = (from: number) =>
    rows.filter((r) => new Date(r.created_at).getTime() >= from).length;

  const total = rows.length;
  const today = countSince(startOfToday.getTime());
  const last7 = countSince(since(7));
  const last30 = countSince(since(30));

  const topQuestions = buildTopQuestions(rows);
  const recent = rows.slice(0, RECENT_LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Website Behavior</h2>
        <p className="mt-3 text-sm text-gray-400">
          What visitors ask Gunnbjörn. Questions are logged anonymously — no names,
          emails or IP addresses are stored.
        </p>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-6">
          <p className="text-sm text-red-300">Failed to load questions: {error.message}</p>
        </div>
      ) : null}

      {/* 1. Summary counts */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total"
          value={total.toLocaleString("en-GB")}
          subtitle={total >= AGGREGATE_LIMIT ? `Capped at ${AGGREGATE_LIMIT.toLocaleString("en-GB")}` : "All time"}
        />
        <SummaryCard title="Today" value={today.toLocaleString("en-GB")} subtitle="Since midnight" />
        <SummaryCard title="Last 7 days" value={last7.toLocaleString("en-GB")} />
        <SummaryCard title="Last 30 days" value={last30.toLocaleString("en-GB")} />
      </section>

      {/* 2. Top questions */}
      <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Top Questions</h3>
          <span className="text-xs uppercase tracking-[0.16em] text-gray-400">
            Grouped by wording, case-insensitive
          </span>
        </div>

        {topQuestions.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No questions logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-emerald-500/20 text-xs uppercase tracking-[0.15em] text-gray-400">
                  <th className="px-3 py-3 font-medium w-12">#</th>
                  <th className="px-3 py-3 font-medium">Question</th>
                  <th className="px-3 py-3 font-medium w-24 text-right">Asked</th>
                </tr>
              </thead>
              <tbody>
                {topQuestions.map((q, i) => (
                  <tr key={q.key} className="border-b border-emerald-500/10 last:border-0">
                    <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-3 py-3 text-gray-200">{q.example}</td>
                    <td className="px-3 py-3 text-right font-semibold text-emerald-200">
                      {q.count.toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. Most recent */}
      <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Most Recent</h3>
          <span className="text-xs uppercase tracking-[0.16em] text-gray-400">
            Latest {RECENT_LIMIT} · Iceland time
          </span>
        </div>

        {recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No questions logged yet.</p>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur">
                <tr className="border-b border-emerald-500/20 text-xs uppercase tracking-[0.15em] text-gray-400">
                  <th className="px-3 py-3 font-medium w-48">When</th>
                  <th className="px-3 py-3 font-medium">Question</th>
                  <th className="px-3 py-3 font-medium w-20">Lang</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id} className="border-b border-emerald-500/10 last:border-0">
                    <td className="px-3 py-3 whitespace-nowrap text-gray-400">
                      {formatTimestamp(row.created_at)}
                    </td>
                    <td className="px-3 py-3 text-gray-200">{row.question}</td>
                    <td className="px-3 py-3 text-gray-500">{row.lang ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Empty state for a table with no rows at all */}
      {!error && total === 0 ? (
        <EmptyState message="No questions logged yet. They will appear here once visitors start asking Gunnbjörn." />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------------
 * PREVIOUS PLACEHOLDER — replaced 2026-08-25, kept rather than deleted.
 *
 * export default function WebsiteBehaviorPage() {
 *   return (
 *     <section className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-gray-900/40 to-black/70 backdrop-blur-xl p-6 sm:p-8">
 *       <h2 className="text-xl sm:text-2xl font-semibold text-white">Website Behavior</h2>
 *       <p className="mt-3 text-sm text-gray-400">
 *         Visitor behavior analytics and engagement signals will be displayed here.
 *       </p>
 *     </section>
 *   );
 * }
 * --------------------------------------------------------------------- */
