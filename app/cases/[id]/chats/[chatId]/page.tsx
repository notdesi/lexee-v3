import { CaseChatClient } from "@/components/CaseChatClient";
import { getAllStaticChatParams } from "@/lib/case-chats";

type PageProps = {
  params: Promise<{ id: string; chatId: string }>;
};

export default async function CaseChatPage({ params }: PageProps) {
  const { id, chatId } = await params;
  return <CaseChatClient caseId={id} chatId={chatId} />;
}

export function generateStaticParams() {
  return getAllStaticChatParams();
}
