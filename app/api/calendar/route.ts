import { NextRequest, NextResponse } from "next/server";
import { listCalendarEvents } from "@/lib/google-calendar";

const CALENDAR_ID = "info@vikingworld.is";
const MCP_URL = "https://gcal.mcp.claude.com/mcp";

// ── In-memory cache for MCP results (avoid repeat API calls) ──
let mcpCache: { key: string; data: unknown[]; ts: number } | null = null;
const MCP_CACHE_TTL = 5 * 60_000; // 5 minutes

// ── MCP fallback: Anthropic API + Google Calendar MCP ─────────
async function fetchViaMcp(timeMin: string, timeMax: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY not configured. Add it to .env.local or complete Google OAuth at /api/calendar/auth"
    );
  }

  // Check cache
  const cacheKey = `${timeMin}|${timeMax}`;
  if (mcpCache && mcpCache.key === cacheKey && Date.now() - mcpCache.ts < MCP_CACHE_TTL) {
    console.log("[/api/calendar] MCP cache hit");
    return mcpCache.data;
  }

  console.log("[/api/calendar] Calling Anthropic MCP for calendar events");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "mcp-client-2025-04-04",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      mcp_servers: [
        {
          type: "url",
          url: MCP_URL,
          name: "google-calendar",
        },
      ],
      messages: [
        {
          role: "user",
          content: `Use the Google Calendar tools to list all events for the calendar "${CALENDAR_ID}" between ${timeMin} and ${timeMax} in the Atlantic/Reykjavik timezone. Return ONLY a raw JSON array (no markdown fences, no explanation) where each element has exactly these fields:
{
  "id": "event_id",
  "summary": "event title",
  "start": { "dateTime": "ISO8601", "timeZone": "Atlantic/Reykjavik" },
  "end": { "dateTime": "ISO8601", "timeZone": "Atlantic/Reykjavik" },
  "description": "event description or empty string",
  "status": "confirmed"
}
Return [] if no events found.`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();

  // Extract text content from Claude's response
  const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
  if (!textBlock?.text) {
    throw new Error("No text content in MCP response");
  }

  // Parse JSON array from response text
  const text: string = textBlock.text;
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    // If Claude says there are no events
    if (/no events|empty|none found/i.test(text)) {
      mcpCache = { key: cacheKey, data: [], ts: Date.now() };
      return [];
    }
    throw new Error("Could not parse event array from MCP response");
  }

  const events = JSON.parse(jsonMatch[0]) as unknown[];

  // Cache the result
  mcpCache = { key: cacheKey, data: events, ts: Date.now() };
  console.log(`[/api/calendar] MCP returned ${events.length} events (cached)`);
  return events;
}

// ── Route handler ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timeMin = searchParams.get("timeMin");
  const timeMax = searchParams.get("timeMax");

  if (!timeMin || !timeMax) {
    return NextResponse.json(
      { error: "Missing timeMin or timeMax query parameters" },
      { status: 400 },
    );
  }

  // Strategy 1: Direct Google Calendar API (fast, free — needs GOOGLE_REFRESH_TOKEN)
  const hasRefreshToken = Boolean(process.env.GOOGLE_REFRESH_TOKEN);
  if (hasRefreshToken) {
    try {
      const events = await listCalendarEvents(CALENDAR_ID, timeMin, timeMax);
      return NextResponse.json(events);
    } catch (err) {
      console.warn(
        "[/api/calendar] Direct Google API failed:",
        err instanceof Error ? err.message : err,
      );
      // Fall through to MCP
    }
  }

  // Strategy 2: Anthropic API + Google Calendar MCP (needs ANTHROPIC_API_KEY)
  try {
    const events = await fetchViaMcp(timeMin, timeMax);
    return NextResponse.json(events);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/calendar] MCP fallback also failed:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
