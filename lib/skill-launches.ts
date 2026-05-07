/** Prototype skill id → chat launch routing (see `app/page.tsx`). */
export const MEDICAL_SUMMARY_SKILL_ID = "ck-med-summary";

/** User message shown when opening the Medical Summary skill from Skills. */
export const MEDICAL_SUMMARY_DEMO_PROMPT =
  "create a detailed medical sumary for Tyler Durden vs Narrator";

/** Matter forced on for Medical Summary prototype (skill launch + demo prompt). */
export const MEDICAL_SUMMARY_DEMO_MATTER = "Tyler Durden v. Narrator";

function normalisePrompt(prompt: string): string {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?.!,]+$/g, "");
}

export function shouldUseMedicalSummaryDemoResponse(prompt: string): boolean {
  return normalisePrompt(prompt) === normalisePrompt(MEDICAL_SUMMARY_DEMO_PROMPT);
}
