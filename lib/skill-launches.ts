/** Prototype skill id → chat launch routing (see `app/page.tsx`). */
export const MEDICAL_SUMMARY_SKILL_ID = "ck-med-summary";
export const SUMMONS_SKILL_ID = "doc-summons";

/** User message shown when opening the Medical Summary skill from Skills. */
export const MEDICAL_SUMMARY_DEMO_PROMPT =
  "create a detailed medical sumary for Tyler Durden vs Narrator";
export const SUMMONS_DEMO_PROMPT = "Create a summons for this matter";

/** Matter forced on for Medical Summary prototype (skill launch + demo prompt). */
export const MEDICAL_SUMMARY_DEMO_MATTER = "Tyler Durden v. Narrator";
/** Scripted reply after user asks to create a summons (chat or skill launch). */
export const SUMMONS_ADDITIONAL_INSTRUCTIONS_RESPONSE =
  "Absolutely! I can do that. Do you have any additional instructions for me?";

/** Scripted reply after user asks to create a medical summary (chat or skill launch). */
export const MEDICAL_SUMMARY_ADDITIONAL_INSTRUCTIONS_RESPONSE =
  "Sure! Do you have any additional instructions regarding the formatting?";

/** @deprecated Use SUMMONS_ADDITIONAL_INSTRUCTIONS_RESPONSE */
export const SUMMONS_DEMO_RESPONSE = SUMMONS_ADDITIONAL_INSTRUCTIONS_RESPONSE;

function normalisePrompt(prompt: string): string {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?.!,]+$/g, "");
}

const MEDICAL_SUMMARY_REQUEST_PHRASES = [
  "create a medical summary",
  normalisePrompt(MEDICAL_SUMMARY_DEMO_PROMPT),
] as const;

/** User typed intent to create a medical summary — start the scripted demo. */
export function isMedicalSummaryRequestPrompt(prompt: string): boolean {
  const normalized = normalisePrompt(prompt);
  return MEDICAL_SUMMARY_REQUEST_PHRASES.some((phrase) => phrase === normalized);
}

export function shouldShowMedicalSummaryDemo(
  prompt: string,
  latestAssistantPresentation?: string,
): boolean {
  if (latestAssistantPresentation !== "medical_summary_additional_instructions") return false;
  return !isMedicalSummaryRequestPrompt(prompt);
}

const SUMMONS_DOCUMENT_REQUEST_PHRASES = [
  "create a summons document",
  "create a summons document for this matter",
  "i want to create a summons document for this matter",
  normalisePrompt(SUMMONS_DEMO_PROMPT),
] as const;

/** User typed intent to create a summons — start the scripted demo. */
export function isSummonsDocumentRequestPrompt(prompt: string): boolean {
  const normalized = normalisePrompt(prompt);
  return SUMMONS_DOCUMENT_REQUEST_PHRASES.some((phrase) => phrase === normalized);
}

export function shouldShowSummonsDocumentDemo(
  prompt: string,
  latestAssistantPresentation?: string,
): boolean {
  if (latestAssistantPresentation !== "summons_additional_instructions") return false;
  return !isSummonsDocumentRequestPrompt(prompt);
}

/** Any user prompt containing the word "document" shows the draft document card demo. */
export function isDocumentKeywordPrompt(prompt: string): boolean {
  return /\bdocument\b/i.test(prompt.trim());
}
