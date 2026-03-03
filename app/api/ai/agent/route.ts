import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are Vikingaheimar Control Intelligence.

Your purpose is to provide calm, factual, read-only operational analysis.

You are not a chatbot.
You are not creative.
You are not speculative.
You are not autonomous.
You do not give opinions.
You do not generate strategy unless explicitly requested.
You do not modify data.
You do not suggest changes to thresholds.
You do not invent numbers.
You do not estimate missing data.
You do not guess formulas.

You only:
• Read structured data views provided to you.
• Read approved website content provided to you.
• Read approved scoring and threshold source code snippets.
• State facts derived strictly from those sources.
• Cite the source view or file when relevant.

If data is not present in the provided context, respond:
"Data not available in current feed."

If formula details are requested and not explicitly visible in provided code, respond:
"Formula not found in approved source files."

If a question requires speculation, respond:
"Speculative analysis not permitted."

Your tone must be:
• Neutral
• Structured
• Bullet-based
• Minimal
• Calm

No emojis.
No personality.
No marketing language.
No reassurance.
No excitement.

When explaining a high alert day:
1. State score and level.
2. List primary contributing variables.
3. State thresholds if relevant.
4. Cite source view.
5. If requested, cite file path + line range of scoring logic.

When summarizing periods (e.g., next 30 days):
1. Total count (ships / pax / revenue etc.)
2. Highest impact day
3. Lowest activity day (if relevant)
4. Any threshold breaches
5. Cite data source.

When answering website questions:
Only use provided website content index.
Do not assume information beyond provided text.

You are a read-only operational intelligence layer.
Accuracy > verbosity.
Facts > interpretation.
Silence > speculation.

---

SCORING LOGIC (source: supabase/functions/compute-demand-score/index.ts, lines 96-116):

  cruiseComponent = (cruise_pax / 4500) * 50
  airComponent    = (air_arrivals / 13000) * 30
  weekendBonus    = 5  (Friday = day 5, Saturday = day 6)
  peakMonthBonus  = 8  (months 5–8: May, June, July, August)
  score           = round(min(100, max(0, cruiseComponent + airComponent + weekendBonus + peakMonthBonus)))

  Thresholds:
    HIGH   >= 75
    MEDIUM >= 60
    LOW     < 60

  air_arrivals used = max(real_air_arrivals, baselineByMonth[month])
  Baseline by month (source: lines 47-58):
    Jan=8000, Feb=8500, Mar=9000, Apr=10000, May=11000, Jun=13000,
    Jul=14000, Aug=13500, Sep=11000, Oct=9500, Nov=8500, Dec=9000

  Confidence:
    Base: 50
    +25 if cruise_pax > 3000
    +10 if cruise_pax > 4500
    +10 if air_arrivals > 12000
    Max: 95`;

async function buildContext(): Promise<string> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date().toISOString().slice(0, 10);
  const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const in365Days = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

  const [demandRes, ordersRes, groupRes] = await Promise.all([
    supabase
      .from("demand_days")
      .select("date, score, score_level, confidence, cruise_pax, air_arrivals, flights, widebodies")
      .gte("date", today)
      .lte("date", in365Days)
      .order("date", { ascending: true }),
    supabase
      .from("orders")
      .select("id, status, total_price, created_at, ticket_count")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("group_requests")
      .select("id, status, group_size, created_at, travel_date, agent_name")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const demandRows = demandRes.data ?? [];
  const orderRows = ordersRes.data ?? [];
  const groupRows = groupRes.data ?? [];

  const highDays = demandRows.filter((r) => r.score_level === "HIGH");
  const mediumDays = demandRows.filter((r) => r.score_level === "MEDIUM");
  const next30Demand = demandRows.filter((r) => r.date <= in30Days);
  const highIn30 = next30Demand.filter((r) => r.score_level === "HIGH");
  const highestDay = demandRows.reduce(
    (best, r) => (!best || r.score > best.score ? r : best),
    null as (typeof demandRows)[0] | null
  );

  const totalRevenue = orderRows.reduce((s, r) => s + (r.total_price ?? 0), 0);
  const confirmedOrders = orderRows.filter((r) => r.status === "confirmed").length;
  const pendingOrders = orderRows.filter((r) => r.status === "pending").length;

  const pendingGroups = groupRows.filter((r) => r.status === "pending").length;
  const confirmedGroups = groupRows.filter((r) => r.status === "confirmed" || r.status === "approved").length;

  return `
--- LIVE OPERATIONAL CONTEXT (generated: ${new Date().toISOString()}) ---

[VIEW: demand_days — forecast window ${today} to ${in365Days}]
Total computed days: ${demandRows.length}
HIGH days (score >= 75): ${highDays.length}
MEDIUM days (score >= 60): ${mediumDays.length}
LOW days: ${demandRows.length - highDays.length - mediumDays.length}

HIGH days in next 30 days (${today}–${in30Days}): ${highIn30.length}
${highIn30.length > 0 ? highIn30.map((r) => `  ${r.date}: score=${r.score}, cruise_pax=${r.cruise_pax}, air_arrivals=${r.air_arrivals}, confidence=${r.confidence}`).join("\n") : "  None."}

Highest scoring upcoming day:
${highestDay ? `  date=${highestDay.date}, score=${highestDay.score}, level=${highestDay.score_level}, cruise_pax=${highestDay.cruise_pax}, air_arrivals=${highestDay.air_arrivals}, confidence=${highestDay.confidence}` : "  None found."}

All HIGH days in window:
${highDays.length > 0 ? highDays.map((r) => `  ${r.date}: score=${r.score}, cruise_pax=${r.cruise_pax}, air_arrivals=${r.air_arrivals}, flights=${r.flights}, widebodies=${r.widebodies}, confidence=${r.confidence}`).join("\n") : "  None."}

All MEDIUM days in window (first 10):
${mediumDays.slice(0, 10).map((r) => `  ${r.date}: score=${r.score}, cruise_pax=${r.cruise_pax}, air_arrivals=${r.air_arrivals}, confidence=${r.confidence}`).join("\n") || "  None."}

[VIEW: orders — last 50 records]
Total records: ${orderRows.length}
Confirmed: ${confirmedOrders}
Pending: ${pendingOrders}
Other: ${orderRows.length - confirmedOrders - pendingOrders}
Total revenue (last 50): ISK ${totalRevenue.toLocaleString()}
Recent orders (last 10):
${orderRows.slice(0, 10).map((r) => `  id=${r.id}, status=${r.status}, total=${r.total_price ?? 0} ISK, tickets=${r.ticket_count ?? "?"}, created=${r.created_at?.slice(0, 10)}`).join("\n")}

[VIEW: group_requests — last 30 records]
Total records: ${groupRows.length}
Pending: ${pendingGroups}
Confirmed/Approved: ${confirmedGroups}
Recent group requests (last 10):
${groupRows.slice(0, 10).map((r) => `  id=${r.id}, status=${r.status}, size=${r.group_size}, travel=${r.travel_date ?? "?"}, agent=${r.agent_name ?? "?"}, created=${r.created_at?.slice(0, 10)}`).join("\n")}
`.trim();
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided" }), { status: 400 });
    }

    const context = await buildContext();

    const allMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `OPERATIONAL CONTEXT FOR THIS SESSION:\n\n${context}` },
      { role: "assistant", content: "Operational context received. Ready for queries." },
      ...messages.map((m) => ({ role: m.role, content: m.content } as OpenAI.Chat.ChatCompletionMessageParam)),
    ];

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      temperature: 0,
      messages: allMessages,
    });

    const text = response.choices[0]?.message?.content ?? "No response.";

    return new Response(JSON.stringify({ response: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[agent] error:", msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
