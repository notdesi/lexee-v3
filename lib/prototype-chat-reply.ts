import { buildLlmTurns, fetchLlmChatReply } from "@/lib/llm-chat-client";
import { getGeneralChatFirstResponse, getResponse } from "@/lib/responses";
import type { CaseChatMessage } from "@/lib/case-workspace";

function normalisePrompt(prompt: string): string {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?.!,]+$/g, "");
}

export async function resolvePrototypeAssistantReply({
  messages,
  trimmed,
  matterName,
  signal,
}: {
  messages: CaseChatMessage[];
  trimmed: string;
  matterName: string | null;
  signal?: AbortSignal;
}): Promise<string> {
  const normalized = normalisePrompt(trimmed);
  const isFirstTurn = messages.length === 0;
  const hasCaseContext = matterName !== null;

  const cannedCaseHi =
    isFirstTurn && hasCaseContext && normalized === "hi"
      ? `We are in the context of ${matterName}. How can I help you?`
      : null;
  const cannedGeneralFirst =
    isFirstTurn && !hasCaseContext ? getGeneralChatFirstResponse(trimmed) : null;
  const fallbackReply = cannedCaseHi ?? cannedGeneralFirst ?? getResponse(trimmed);

  if (process.env.NEXT_PUBLIC_USE_LLM_CHAT !== "true") {
    return fallbackReply;
  }

  try {
    const turns = buildLlmTurns(messages, trimmed);
    const llmText = await fetchLlmChatReply(turns, {
      matter: matterName,
      signal,
    });
    return llmText ?? fallbackReply;
  } catch {
    if (signal?.aborted) throw new Error("aborted");
    return fallbackReply;
  }
}
