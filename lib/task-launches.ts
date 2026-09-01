import type { TaskCardData } from "@/components/TaskCard";
import { CURRENT_WORKSPACE_USER } from "@/lib/workspace";

/** Prototype skill id for task creation (see Skills catalog). */
export const TASK_CREATION_SKILL_ID = "wf-litigation";

/** Default prompt when Create task mode is selected with an empty composer. */
export const TASK_DEMO_PROMPT = "Create a task to follow up on discovery responses";

/** Scripted reply after user asks to create a task. */
export const TASK_ADDITIONAL_INSTRUCTIONS_RESPONSE =
  "I can create that task in CloudLex. What should it be called, who should it be assigned to, and when is it due?";

export const TASK_CREATION_DEMO_CONFIRMATION = "I've created the task for this matter.";

export type ComposerMode = "document-drafting" | "task" | "event" | "note";

function normalisePrompt(prompt: string): string {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?.!,]+$/g, "");
}

const TASK_REQUEST_PHRASES = [
  "create a task",
  "create task",
  normalisePrompt(TASK_DEMO_PROMPT),
] as const;

/** User typed intent to create a task — start the scripted demo. */
export function isTaskCreationRequestPrompt(prompt: string): boolean {
  const normalized = normalisePrompt(prompt);
  if (TASK_REQUEST_PHRASES.some((phrase) => phrase === normalized)) return true;
  return normalized.startsWith("create a task ") || normalized.startsWith("create task ");
}

export function isTaskCreationComposerTrigger({
  mode,
  skillId,
}: {
  mode?: ComposerMode | null;
  skillId?: string | null;
}): boolean {
  return mode === "task" || skillId === TASK_CREATION_SKILL_ID;
}

export function shouldShowTaskCreationDemo(
  prompt: string,
  latestAssistantPresentation?: string,
): boolean {
  if (latestAssistantPresentation !== "task_creation_additional_instructions") return false;
  return !isTaskCreationRequestPrompt(prompt);
}

export function buildDemoTask({
  matterName,
  seedPrompt,
}: {
  matterName: string;
  seedPrompt: string;
}): TaskCardData {
  let title = seedPrompt.trim();
  const lower = title.toLowerCase();

  if (lower.startsWith("create a task to ")) {
    title = title.slice("create a task to ".length);
  } else if (lower.startsWith("create a task for ")) {
    title = title.slice("create a task for ".length);
  } else if (lower.startsWith("create a task ")) {
    title = title.slice("create a task ".length);
  } else if (lower === "create a task" || lower === "create task") {
    title = "Follow up on matter";
  } else if (lower.startsWith("create task ")) {
    title = title.slice("create task ".length);
  }

  title = title.trim();
  if (!title) title = "Follow up on matter";
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    id: `demo-task-${Date.now()}`,
    title,
    matter: matterName,
    priority: "normal",
    status: "not-started",
    progress: 0,
    assignees: [CURRENT_WORKSPACE_USER],
  };
}
