import { NextResponse } from "next/server";

type Body = {
  messages?: Array<{ role?: string; content?: string }>;
  matter?: string | null;
};

const DEFAULT_MODEL = "gpt-4o-mini";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set", text: null },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawMessages = body.messages;
  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const messages = rawMessages
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "no valid messages" }, { status: 400 });
  }

  const matter = typeof body.matter === "string" ? body.matter.trim() : "";
  const systemParts = [
    "You are Lexee, a helpful legal-assistant style chat companion for a product demo.",
    matter ? `Current matter context: ${matter}.` : null,
  ].filter(Boolean);

  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemParts.join(" ") },
        ...messages,
      ],
      temperature: 0.7,
    }),
  });

  if (!openaiRes.ok) {
    const errText = await openaiRes.text();
    return NextResponse.json(
      { error: "Upstream LLM error", detail: errText.slice(0, 500) },
      { status: 502 },
    );
  }

  const completion = (await openaiRes.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = completion.choices?.[0]?.message?.content?.trim() ?? "";
  return NextResponse.json({ text: text || null });
}
