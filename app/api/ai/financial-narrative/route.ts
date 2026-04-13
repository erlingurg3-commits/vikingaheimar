import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const { prompt, systemPrompt } = await req.json();

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const narrative = (message.content[0] as { type: string; text: string })
      .text;
    return Response.json({ narrative });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[financial-narrative]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
