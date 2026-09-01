import type { TaskCardData } from "@/components/TaskCard";
import type { CaseChatMessage } from "@/lib/case-workspace";
import {
  TASK_ADDITIONAL_INSTRUCTIONS_RESPONSE,
  TASK_CREATION_DEMO_CONFIRMATION,
  TASK_CREATION_SKILL_ID,
  TASK_DEMO_PROMPT,
  buildDemoTask,
  isTaskCreationRequestPrompt,
  shouldShowTaskCreationDemo,
  type ComposerMode,
} from "@/lib/task-launches";

export type ScriptedDemoReply = {
  content: string;
  presentation?: string;
  generatedTask?: TaskCardData;
};

function findTaskSeedPrompt(messages: readonly CaseChatMessage[]): string {
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role !== "assistant" || msg.presentation !== "task_creation_additional_instructions") {
      continue;
    }
    for (let j = i - 1; j >= 0; j--) {
      if (messages[j]?.role === "user") {
        return messages[j].content.trim() || TASK_DEMO_PROMPT;
      }
    }
  }
  return TASK_DEMO_PROMPT;
}

export function resolveScriptedDemoReply({
  trimmed,
  messages,
  latestAssistantPresentation,
  matterName,
  composerMode,
  skillId,
}: {
  trimmed: string;
  messages: readonly CaseChatMessage[];
  latestAssistantPresentation?: string;
  matterName: string | null;
  composerMode?: ComposerMode | null;
  skillId?: string | null;
}): ScriptedDemoReply | null {
  if (!matterName) return null;

  const usedTaskTool =
    composerMode === "task" || skillId === TASK_CREATION_SKILL_ID;

  if (shouldShowTaskCreationDemo(trimmed, latestAssistantPresentation)) {
    const seedPrompt = findTaskSeedPrompt(messages);
    return {
      content: TASK_CREATION_DEMO_CONFIRMATION,
      presentation: "create_task_demo",
      generatedTask: buildDemoTask({ matterName, seedPrompt }),
    };
  }

  // Create task tool or Task creation skill: one-turn — use whatever the user typed.
  if (usedTaskTool && trimmed) {
    return {
      content: TASK_CREATION_DEMO_CONFIRMATION,
      presentation: "create_task_demo",
      generatedTask: buildDemoTask({ matterName, seedPrompt: trimmed }),
    };
  }

  if (isTaskCreationRequestPrompt(trimmed)) {
    return {
      content: TASK_ADDITIONAL_INSTRUCTIONS_RESPONSE,
      presentation: "task_creation_additional_instructions",
    };
  }

  return null;
}
