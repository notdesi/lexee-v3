/** Session chats use a query param on the case page (static-export safe). */
export function isSessionCaseChatId(chatId: string): boolean {
  return chatId.startsWith("chat-");
}

export function getCaseChatHref(caseId: string, chatId: string): string {
  if (isSessionCaseChatId(chatId)) {
    return `/cases/${caseId}?chat=${encodeURIComponent(chatId)}`;
  }
  return `/cases/${caseId}/chats/${chatId}`;
}
