/** Temporary: all history nav items open this conversation. */
export const SHARED_HISTORY_CONVERSATION_ID = "medical-summary-demo";

export const HISTORY_CHAT_ENTRIES: { id: string; label: string }[] = [
  { id: "medical-summary-demo", label: "Create Medical summary" },
];

const HISTORY_NAV_IDS = new Set(HISTORY_CHAT_ENTRIES.map((entry) => entry.id));

export function isHistoryNavId(id: string): boolean {
  return HISTORY_NAV_IDS.has(id);
}
