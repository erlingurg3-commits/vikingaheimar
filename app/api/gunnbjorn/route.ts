import { NextRequest, NextResponse } from "next/server";
import { GUNNBJORN_SYSTEM_PROMPT } from "@/lib/gunnbjorn-prompt";

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

  const { question, history } = await req.json();

  if (!question?.trim()) {
    return NextResponse.json({ error: "No question" }, { status: 400 });
  }

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
  } catch (err) {
    console.error("[Gunnbjörn] Fetch failed:", err);
    return NextResponse.json(
      { answer: "The fire burns low. Ask again." },
      { status: 200 },
    );
  }
}
