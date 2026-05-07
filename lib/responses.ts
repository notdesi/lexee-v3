/**
 * Hardcoded prompt → response map used by the prototype to simulate an
 * AI chat backend. Lookups are case-insensitive and whitespace-tolerant.
 */
export const responses: Record<string, string> = {
  hello:
    "Hi there — I'm Lexee. Ask me anything, or pick one of the suggested prompts to see how I respond.",
  hi: "Hey! What can I help you explore today?",
  "what can you do":
    "I can draft copy, summarise documents, brainstorm ideas, and walk through tricky problems with you. Try asking me to summarise something or to outline a plan.",
  "tell me a joke":
    "Why did the developer go broke? Because they used up all their cache.",
  "write a poem":
    "Quiet pixels hum at dawn,\nIdeas stretch and sip the light,\nA cursor blinks — the page moves on,\nAnd thought becomes a shape in flight.",
  "summarise this":
    "Sure — paste in the text you'd like summarised and let me know whether you want a short TL;DR, key bullet points, or an executive summary.",
  "give me ideas":
    "Here are three quick angles to explore:\n1. A surprising contrast or counter-intuitive insight.\n2. A specific, real-world example that grounds the concept.\n3. A question that reframes the problem from the audience's view.",
};

const DEFAULT_RESPONSE =
  "I don't have a canned answer for that yet — but in the real product I'd reason through it and reply. Try one of the suggested prompts.";

/**
 * Normalises a prompt for lookup: trims, lowercases, collapses whitespace,
 * and strips trailing punctuation that often differs between users.
 */
function normalisePrompt(prompt: string): string {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?.!,]+$/g, "");
}

/**
 * Returns the canned response for a given prompt, falling back to a generic
 * reply when no match is found.
 */
export function getResponse(prompt: string): string {
  if (!prompt) return DEFAULT_RESPONSE;

  const key = normalisePrompt(prompt);
  if (key in responses) return responses[key];

  const partial = Object.keys(responses).find(
    (k) => key.includes(k) || k.includes(key),
  );
  if (partial) return responses[partial];

  return DEFAULT_RESPONSE;
}
