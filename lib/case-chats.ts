import type { CaseChatMessage } from "@/lib/case-workspace";

export type CaseChatEntry = {
  id: string;
  caseId: string;
  title: string;
  lastActivityAt: string;
};

export const CASE_CHATS: CaseChatEntry[] = [
  {
    id: "matter-1-chat-1",
    caseId: "matter-1",
    title: "Summarize operative complaint",
    lastActivityAt: "2026-08-31T10:52:00Z",
  },
  {
    id: "matter-1-chat-2",
    caseId: "matter-1",
    title: "Discovery deadline checklist",
    lastActivityAt: "2026-08-31T08:40:00Z",
  },
  {
    id: "matter-1-chat-3",
    caseId: "matter-1",
    title: "Medical records chronology",
    lastActivityAt: "2026-08-30T15:20:00Z",
  },
  {
    id: "matter-2-chat-1",
    caseId: "matter-2",
    title: "Draft demand letter outline",
    lastActivityAt: "2026-08-27T13:10:00Z",
  },
  {
    id: "matter-2-chat-2",
    caseId: "matter-2",
    title: "Compare prior settlement offers",
    lastActivityAt: "2026-08-26T09:05:00Z",
  },
  {
    id: "intake-1-chat-1",
    caseId: "intake-1",
    title: "Client interview follow-ups",
    lastActivityAt: "2026-08-30T16:00:00Z",
  },
  {
    id: "intake-1-chat-2",
    caseId: "intake-1",
    title: "Incident timeline draft",
    lastActivityAt: "2026-08-29T11:30:00Z",
  },
  {
    id: "lead-1-chat-1",
    caseId: "lead-1",
    title: "Initial liability screening",
    lastActivityAt: "2026-08-31T10:00:00Z",
  },
  {
    id: "lead-2-chat-1",
    caseId: "lead-2",
    title: "Referral intake questions",
    lastActivityAt: "2026-08-29T14:00:00Z",
  },
];

const DUMMY_CHAT_MESSAGES: Record<string, CaseChatMessage[]> = {
  "matter-1-chat-1": [
    {
      id: "m1-u1",
      role: "user",
      content: "Summarize the operative complaint for Murdock v. Metro Health.",
    },
    {
      id: "m1-a1",
      role: "assistant",
      content:
        "Here is your Summons document for Murdock v. Metro Health.",
      presentation: "summons_document_demo",
    },
  ],
  "matter-1-chat-2": [
    {
      id: "m2-u1",
      role: "user",
      content: "What discovery deadlines are coming up?",
    },
    {
      id: "m2-a1",
      role: "assistant",
      content:
        "The next tracked deadlines are initial disclosures and expert designations. I can draft a checklist mapped to the current scheduling order.",
    },
  ],
  "matter-1-chat-3": [
    {
      id: "m3-u1",
      role: "user",
      content: "Build a medical records chronology.",
    },
    {
      id: "m3-a1",
      role: "assistant",
      content:
        "Here is the medical summary organized from the records indexed for this matter.",
      presentation: "medical_summary_demo",
    },
  ],
  "matter-2-chat-1": [
    {
      id: "m4-u1",
      role: "user",
      content: "Outline a demand letter for Geramita vs Ayal.",
    },
    {
      id: "m4-a1",
      role: "assistant",
      content:
        "Here is a first-pass demand letter draft based on the intake notes and billing summary.",
      presentation: "demand_letter_demo",
    },
  ],
  "matter-2-chat-2": [
    {
      id: "m5-u1",
      role: "user",
      content: "Compare prior settlement offers.",
    },
    {
      id: "m5-a1",
      role: "assistant",
      content:
        "There are two prior offers on file. I can compare amount, coverage limits, and release scope side by side.",
    },
  ],
  "intake-1-chat-1": [
    {
      id: "i1-u1",
      role: "user",
      content: "What follow-ups do we need from the client interview?",
    },
    {
      id: "i1-a1",
      role: "assistant",
      content:
        "We still need clarified timeline details, witness contact info, and authorization for additional medical records.",
    },
  ],
  "intake-1-chat-2": [
    {
      id: "i2-u1",
      role: "user",
      content: "Draft an incident timeline from intake notes.",
    },
    {
      id: "i2-a1",
      role: "assistant",
      content:
        "I’ll map the incident, transport, first treatment, and follow-up visits in chronological order from the intake packet.",
    },
  ],
  "lead-1-chat-1": [
    {
      id: "l1-u1",
      role: "user",
      content: "Screen this Metro Health inquiry for liability.",
    },
    {
      id: "l1-a1",
      role: "assistant",
      content:
        "Initial screening suggests potential negligence theories around delayed response. I can list missing facts needed before intake conversion.",
    },
  ],
  "lead-2-chat-1": [
    {
      id: "l2-u1",
      role: "user",
      content: "What intake questions should we ask Acme Insurance referral?",
    },
    {
      id: "l2-a1",
      role: "assistant",
      content:
        "Start with policy limits, date of loss, prior counsel, and whether treatment is ongoing. I can turn this into an intake checklist.",
    },
  ],
};

export function getCaseChats(caseId: string): CaseChatEntry[] {
  return CASE_CHATS.filter((entry) => entry.caseId === caseId).sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
  );
}

export function getMergedCaseChatsForCase(
  caseId: string,
  sessionChats: ReadonlyArray<{
    id: string;
    caseId: string;
    title: string;
    lastActivityAt: string;
  }>,
): CaseChatEntry[] {
  const staticChats = getCaseChats(caseId);
  const sessionEntries: CaseChatEntry[] = sessionChats
    .filter((chat) => chat.caseId === caseId)
    .map((chat) => ({
      id: chat.id,
      caseId: chat.caseId,
      title: chat.title,
      lastActivityAt: chat.lastActivityAt,
    }));
  const merged = new Map<string, CaseChatEntry>();
  [...sessionEntries, ...staticChats].forEach((chat) => merged.set(chat.id, chat));
  return [...merged.values()].sort(
    (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime(),
  );
}

export function getStaticCaseChat(chatId: string): CaseChatEntry | undefined {
  return CASE_CHATS.find((entry) => entry.id === chatId);
}

export function getDummyChatMessages(chatId: string): CaseChatMessage[] {
  return DUMMY_CHAT_MESSAGES[chatId] ?? [];
}

export function getAllStaticChatParams() {
  return CASE_CHATS.map((chat) => ({
    id: chat.caseId,
    chatId: chat.id,
  }));
}
