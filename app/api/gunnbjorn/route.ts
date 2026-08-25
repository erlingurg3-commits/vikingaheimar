import { NextRequest, NextResponse } from "next/server";
import { GUNNBJORN_SYSTEM_PROMPT } from "@/lib/gunnbjorn-prompt";
// Question logging (added 2026-08-25) — see logQuestion below.
import { supabaseAdmin } from "@/lib/supabase-admin";

/** Questions are logged truncated; nobody needs an essay in the log. */
const MAX_LOGGED_QUESTION_CHARS = 2000;

/**
 * Fire-and-forget log of what visitors ask Gunnbjörn.
 *
 * PRIVACY: stores the question text only. No IP (the rate limiter's `ip` is
 * deliberately NOT passed in here), no name, no email, no identifier. lang and
 * session_id are written only if the client volunteered them, and session_id
 * is an anonymous per-session token, never a user id.
 *
 * NEVER awaited by the request path and fully swallowed on error, so a
 * Supabase outage, a missing service-role key or a schema mismatch cannot
 * break or slow the chat.
 */
function logQuestion(question: string, lang?: unknown, sessionId?: unknown) {
  try {
    const row = {
      question: question.slice(0, MAX_LOGGED_QUESTION_CHARS),
      lang: typeof lang === "string" && lang.trim() ? lang.trim().slice(0, 16) : null,
      session_id:
        typeof sessionId === "string" && sessionId.trim()
          ? sessionId.trim().slice(0, 128)
          : null,
    };

    void supabaseAdmin
      .from("gunnbjorn_questions")
      .insert(row)
      .then(({ error }) => {
        if (error) console.error("[Gunnbjörn] question log failed:", error.message);
      });
  } catch (err) {
    // Includes the synchronous throw from supabase-admin when the service-role
    // key is absent. Logging must never surface to the visitor.
    console.error(
      "[Gunnbjörn] question log threw:",
      err instanceof Error ? err.message : String(err),
    );
  }
}

const requestCounts = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.reset) {
    requestCounts.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }

  if (record.count >= 10) return false;
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { answer: "Enough questions for now, traveller. The museum awaits." },
      { status: 429 },
    );
  }

  const { question, history, lang, sessionId } = await req.json();

  if (!question?.trim()) {
    return NextResponse.json({ error: "No question" }, { status: 400 });
  }

  // Not awaited — the chat must not wait on, or fail because of, logging.
  logQuestion(question, lang, sessionId);

  const messages = [
    ...(history || []),
    { role: "user", content: question },
  ];

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[Gunnbjörn] ANTHROPIC_API_KEY is not set");
      return NextResponse.json(
        { answer: "The fire burns low. Ask again." },
        { status: 200 },
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: GUNNBJORN_SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();

    if (data?.error) {
      console.error("[Gunnbjörn] API error:", data.error.type, data.error.message);
      return NextResponse.json(
        { answer: "The fire burns low. Ask again." },
        { status: 200 },
      );
    }

    const answer =
      data?.content?.[0]?.text ?? "The fire burns low. Ask again.";

    return NextResponse.json({ answer });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Gunnbjörn] Fetch failed:", msg);
    return NextResponse.json(
      { answer: "The fire burns low. Ask again." },
      { status: 200 },
    );
  }
}
