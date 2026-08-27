/**
 * POST /api/track — first-party analytics ingestion (Phase 1, 2026-08-27).
 *
 * Writes to public.web_events through the service-role client. That table has
 * RLS enabled with no policies, so the service role is the only way in and the
 * key never leaves the server.
 *
 * PRIVACY: no PII is ever stored. The caller's IP is used for rate limiting
 * only and is deliberately never written to the row. referrer_host must be a
 * bare hostname, never a full URL with a query string. session_id is an
 * anonymous per-session token.
 *
 * Robustness: every failure path returns HTTP 200. Analytics must never break
 * or block a page, and the client has nothing useful to do with an error.
 * Note this route never returns 204 — Next 16.2.5's Response constructor
 * rejects that status (learned the hard way on /api/reviews).
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/** Events we accept. Anything else is dropped without an insert. */
const ALLOWED_TYPES = [
  "pageview",
  "ping",
  "book_tickets_click",
  "gjaldskra_open",
  "gunnbjorn_open",
  "groups_enquiry_submit",
  "groups_inquiry_click",
] as const;

/** Per-IP budget. Pings are periodic, so this is looser than the chat route. */
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

/** Column caps, applied before insert so a hostile payload cannot bloat rows. */
const MAX_PATH = 512;
const MAX_REFERRER_HOST = 255;
const MAX_SOURCE = 64;
const MAX_SESSION_ID = 128;

/**
 * In-memory rate limit, same approach as app/api/gunnbjorn/route.ts.
 * Per-instance rather than global — good enough to blunt a runaway client,
 * not a security control.
 */
const requestCounts = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.reset) {
    requestCounts.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

/** Trim, cap, and collapse empty strings to null. */
function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

const ok = () => NextResponse.json({ ok: true }, { status: 200 });
const notOk = () => NextResponse.json({ ok: false }, { status: 200 });

export async function POST(req: NextRequest) {
  // Rate-limit key only. Never stored.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) return notOk();

  // The client may use navigator.sendBeacon, which posts text/plain — so read
  // the raw body and parse it ourselves rather than trusting req.json().
  let payload: Record<string, unknown>;
  try {
    const raw = await req.text();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return notOk();
    payload = parsed as Record<string, unknown>;
  } catch {
    return notOk();
  }

  const type = payload.type;
  if (typeof type !== "string" || !ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
    return notOk();
  }

  const row = {
    type,
    path: typeof payload.path === "string" ? payload.path.slice(0, MAX_PATH) : null,
    referrer_host: cleanText(payload.referrer_host, MAX_REFERRER_HOST),
    source: cleanText(payload.source, MAX_SOURCE),
    session_id: cleanText(payload.session_id, MAX_SESSION_ID),
  };

  // Fire-and-forget: not awaited, and fully swallowed. A Supabase outage, a
  // missing service-role key or a schema mismatch must never reach the client.
  try {
    void supabaseAdmin
      .from("web_events")
      .insert(row)
      .then(({ error }) => {
        if (error) console.error("[track] insert failed:", error.message);
      });
  } catch (err) {
    // Covers the synchronous throw from supabase-admin when the env is absent.
    console.error(
      "[track] insert failed:",
      err instanceof Error ? err.message : String(err),
    );
  }

  return ok();
}
