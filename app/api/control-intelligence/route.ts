import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Mode = "summary" | "high_alert" | "formula";

interface RequestBody {
  mode: Mode;
  systemPrompt: string;
  userPrompt: string;
  dataBlocks: string;
}

const VALID_MODES: Mode[] = ["summary", "high_alert", "formula"];

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET() {
  return json({ success: false, message: "Method not allowed." }, 405);
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("[control-intelligence] OPENAI_API_KEY not set.");
    return json({ success: false, message: "Service unavailable." }, 503);
  }

  const secret = process.env.INTERNAL_SECRET;
  if (secret) {
    const provided = req.headers.get("x-internal-secret");
    if (provided !== secret) {
      return json({ success: false, message: "Unauthorized." }, 401);
    }
  }

  const raw = await req.text();
  if (raw.length > 20_000) {
    return json({ success: false, message: "Request body exceeds 20,000 character limit." }, 413);
  }

  let body: Partial<RequestBody>;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ success: false, message: "Invalid JSON." }, 400);
  }

  const { mode, systemPrompt, userPrompt, dataBlocks } = body;

  if (!mode || !VALID_MODES.includes(mode)) {
    return json({ success: false, message: `Invalid mode. Must be one of: ${VALID_MODES.join(", ")}.` }, 400);
  }
  if (!systemPrompt) {
    return json({ success: false, message: "systemPrompt is required." }, 400);
  }
  if (!userPrompt) {
    return json({ success: false, message: "userPrompt is required." }, 400);
  }
  if (dataBlocks === undefined || dataBlocks === null) {
    return json({ success: false, message: "dataBlocks is required." }, 400);
  }

  const userMessage = `${userPrompt}\n\n---\n\n${dataBlocks}`.trim();
  const maxTokens = mode === "formula" ? 1200 : 800;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        max_tokens: maxTokens,
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      },
      { signal: controller.signal }
    );

    const text = response.choices[0]?.message?.content ?? "";

    console.log(`[control-intelligence] mode=${mode} tokens=${response.usage?.completion_tokens ?? "?"}`);

    return json({ success: true, response: text, usage: response.usage });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[control-intelligence] Request timed out.");
      return json({ success: false, message: "Request timed out." }, 504);
    }
    const msg = err instanceof Error ? err.message : "Unknown error.";
    console.error("[control-intelligence] Error:", msg);
    return json({ success: false, message: "Internal server error." }, 500);
  } finally {
    clearTimeout(timeout);
  }
}
