import type { DocumentPreview } from "@/components/DocumentPreviewPanel";
import { getMergedCaseChatsForCase, getDummyChatMessages } from "@/lib/case-chats";
import { collectGeneratedDocuments } from "@/lib/chat-generated-documents";
import type { CaseChatSession } from "@/lib/case-workspace";

export function collectCaseGeneratedDocuments(
  caseId: string,
  sessionChats: readonly CaseChatSession[],
  matterName?: string | null,
): DocumentPreview[] {
  const chats = getMergedCaseChatsForCase(caseId, sessionChats);
  const documents: DocumentPreview[] = [];
  const seenTitles = new Set<string>();

  for (const chat of chats) {
    const session = sessionChats.find((entry) => entry.id === chat.id);
    const messages = session?.messages ?? getDummyChatMessages(chat.id);

    for (const document of collectGeneratedDocuments(messages, { matterName })) {
      if (seenTitles.has(document.title)) continue;
      seenTitles.add(document.title);
      documents.push(document);
    }
  }

  return documents;
}
