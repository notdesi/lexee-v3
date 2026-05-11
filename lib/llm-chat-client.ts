export type LlmTurn = {
  role: "user" | "assistant";
  content: string;
};

type LlmChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function buildLlmTurns(
  prior: readonly LlmChatMessage[],
  latestUser: string,
): LlmTurn[] {
  const turns: LlmTurn[] = [];
  for (const m of prior) {
    if (!m.content.trim()) continue;
    turns.push({ role: m.role, content: m.content });
  }
  turns.push({ role: "user", content: latestUser });
  return turns;
}

export type FetchLlmChatReplyOptions = {
  matter: string | null;
  signal?: AbortSignal;
};

export async function fetchLlmChatReply(
  turns: readonly LlmTurn[],
  options: FetchLlmChatReplyOptions,
): Promise<string | null> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: options.signal,
    body: JSON.stringify({
      messages: turns,
      matter: options.matter,
    }),
  });

  if (!res.ok) {
    throw new Error(`LLM chat failed: ${res.status}`);
  }

  const data = (await res.json()) as { text?: string | null };
  const text = data.text;
  if (typeof text !== "string") return null;
  return text;
}
