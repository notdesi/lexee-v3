import { getCaseById, type CaseScope } from "@/lib/cases";
import type { TaskCardData } from "@/components/TaskCard";
import type { ComposerMode } from "@/lib/task-launches";

export const MAX_PINNED_CASES = 5;
export const MAX_CHATS_PER_CASE = 10;
export const CASE_WORKSPACE_EVENT = "lexee:case-workspace-changed";

export type PinnedCaseEntry = {
  id: string;
  label: string;
  scope: CaseScope;
};

export type CaseChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  presentation?: string;
  generatedTask?: TaskCardData;
  cloudLexSynced?: boolean;
  /** Composer tool active when the user sent this message. */
  composerMode?: ComposerMode;
  skillId?: string;
};

export type CaseChatSession = {
  id: string;
  caseId: string;
  title: string;
  lastActivityAt: string;
  messages: CaseChatMessage[];
};

export type CaseWorkspaceState = {
  pinnedCases: PinnedCaseEntry[];
  chats: CaseChatSession[];
  expandedCaseIds: string[];
};

const emptyState = (): CaseWorkspaceState => ({
  pinnedCases: [],
  chats: [],
  expandedCaseIds: [],
});

function createDefaultWorkspaceState(): CaseWorkspaceState {
  const matter = getCaseById("matter-1");
  if (!matter) return emptyState();

  return {
    pinnedCases: [
      {
        id: matter.id,
        label: matter.name,
        scope: matter.scope,
      },
    ],
    chats: [],
    expandedCaseIds: [matter.id],
  };
}

let workspaceState: CaseWorkspaceState = createDefaultWorkspaceState();

function dispatchWorkspaceChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(CASE_WORKSPACE_EVENT, {
      detail: { state: getCaseWorkspaceState() },
    }),
  );
}

export function getCaseWorkspaceState(): CaseWorkspaceState {
  return workspaceState;
}

export function titleFromFirstMessage(prompt: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Untitled";
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 48).trim()}…`;
}


export function pinCase(
  entry: PinnedCaseEntry,
): { ok: true } | { ok: false; message: string } {
  if (workspaceState.pinnedCases.some((record) => record.id === entry.id)) {
    return { ok: true };
  }
  if (workspaceState.pinnedCases.length >= MAX_PINNED_CASES) {
    return { ok: false, message: "You can pin up to 5 cases." };
  }
  workspaceState = {
    ...workspaceState,
    pinnedCases: [...workspaceState.pinnedCases, entry],
  };
  dispatchWorkspaceChange();
  return { ok: true };
}

export function unpinCase(caseId: string) {
  workspaceState = {
    ...workspaceState,
    pinnedCases: workspaceState.pinnedCases.filter((record) => record.id !== caseId),
    expandedCaseIds: workspaceState.expandedCaseIds.filter((id) => id !== caseId),
  };
  dispatchWorkspaceChange();
}

export function toggleCaseExpanded(caseId: string) {
  const isExpanded = workspaceState.expandedCaseIds.includes(caseId);
  workspaceState = {
    ...workspaceState,
    expandedCaseIds: isExpanded
      ? workspaceState.expandedCaseIds.filter((id) => id !== caseId)
      : [...workspaceState.expandedCaseIds, caseId],
  };
  dispatchWorkspaceChange();
}

export function createCaseChat(
  caseId: string,
  _caseName: string,
  firstMessage: string,
  options?: {
    composerMode?: ComposerMode | null;
    skillId?: string | null;
  },
): { ok: true; chat: CaseChatSession } | { ok: false; message: string } {
  const trimmed = firstMessage.trim();
  if (!trimmed) {
    return { ok: false, message: "Enter a message to start a chat." };
  }

  const chatsForCase = workspaceState.chats.filter((chat) => chat.caseId === caseId);
  if (chatsForCase.length >= MAX_CHATS_PER_CASE) {
    return { ok: false, message: "Each case can have up to 10 chats." };
  }

  const now = new Date().toISOString();
  const chat: CaseChatSession = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    caseId,
    title: titleFromFirstMessage(trimmed),
    lastActivityAt: now,
    messages: [
      {
        id: `${Date.now()}-user`,
        role: "user",
        content: trimmed,
        ...(options?.composerMode ? { composerMode: options.composerMode } : {}),
        ...(options?.skillId ? { skillId: options.skillId } : {}),
      },
    ],
  };

  const expandedCaseIds = workspaceState.expandedCaseIds.includes(caseId)
    ? workspaceState.expandedCaseIds
    : [...workspaceState.expandedCaseIds, caseId];

  workspaceState = {
    ...workspaceState,
    chats: [chat, ...workspaceState.chats],
    expandedCaseIds,
  };
  dispatchWorkspaceChange();
  return { ok: true, chat };
}

export function updateCaseChat(
  chatId: string,
  patch: Partial<Pick<CaseChatSession, "messages" | "title" | "lastActivityAt">>,
) {
  workspaceState = {
    ...workspaceState,
    chats: workspaceState.chats.map((chat) =>
      chat.id === chatId ? { ...chat, ...patch } : chat,
    ),
  };
  dispatchWorkspaceChange();
}

export function getSessionChatById(chatId: string): CaseChatSession | undefined {
  return workspaceState.chats.find((chat) => chat.id === chatId);
}

export function getSessionChatsForCase(caseId: string): CaseChatSession[] {
  return workspaceState.chats
    .filter((chat) => chat.caseId === caseId)
    .sort(
      (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
    );
}
