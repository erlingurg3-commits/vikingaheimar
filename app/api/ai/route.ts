import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt, stats } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "No prompt provided" }),
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are the AI Revenue Intelligence Assistant for Vikingheimar.

You analyze booking data and provide:
- Revenue insights
- Risk analysis
- Trends
- Upsell opportunities
- Strategic recommendations

Be concise but insightful.
`,
        },
        {
          role: "user",
          content: `
Admin question:
${prompt}

Current stats:
${JSON.stringify(stats, null, 2)}
`,
        },
      ],
      temperature: 0.7,
    });

    const text =
      completion.choices?.[0]?.message?.content ||
      "No response from AI";

    return new Response(
      JSON.stringify({ response: text }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error("AI ERROR:", error);

    return new Response(
      JSON.stringify({
        error: error?.message || "AI error",
      }),
      { status: 500 }
    );
  }
}
