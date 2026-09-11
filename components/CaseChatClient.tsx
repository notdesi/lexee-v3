"use client";

import Image from "next/image";
import { Copy, Pencil, RotateCcw, Share2 } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { FormEvent, KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatedPanel } from "@/components/AnimatedPanel";
import { CaseChatBreadcrumb } from "@/components/CaseChatBreadcrumb";
import { ChatComposerInput } from "@/components/ChatComposerInput";
import { ChatDocumentsButton } from "@/components/ChatDocumentsButton";
import { ChatJobsButton } from "@/components/ChatJobsButton";
import { ChatGeneratedDocumentCard } from "@/components/ChatGeneratedDocumentCard";
import { ChatTaskDemoCard } from "@/components/ChatTaskDemoCard";
import { JobsPanel } from "@/components/JobsPanel";
import { DocumentPreviewPanel, type DocumentPreview } from "@/components/DocumentPreviewPanel";
import { LexeeResponseEndSymbol } from "@/components/LexeeResponseEndSymbol";
import { useCaseWorkspace } from "@/hooks/useCaseWorkspace";
import { useChatJobs } from "@/hooks/useChatJobs";
import { getDummyChatMessages, getStaticCaseChat } from "@/lib/case-chats";
import {
  collectGeneratedDocuments,
  createDraftPetitionGeneratedDocument,
  DRAFT_PETITION_FILE_NAME,
} from "@/lib/chat-generated-documents";
import { getCaseById } from "@/lib/cases";
import {
  getSessionChatById,
  updateCaseChat,
  type CaseChatMessage,
} from "@/lib/case-workspace";
import { GENERATION_PHASES, type GenerationProgress, runGenerationPhases } from "@/lib/generation-phases";
import { caseRefFromCaseRecord, jobTitleFromPrompt } from "@/lib/jobs";
import { resolvePrototypeAssistantReply } from "@/lib/prototype-chat-reply";
import { resolveScriptedDemoReply } from "@/lib/scripted-chat-demo";
import { isDocumentKeywordPrompt } from "@/lib/skill-launches";
import {
  isTaskCreationComposerTrigger,
  TASK_DEMO_PROMPT,
  type ComposerMode,
} from "@/lib/task-launches";
import type { Skill } from "@/app/skills/skills-data";
import { uiMotionTransition } from "@/lib/ui-motion";

const HOME_CHAT_COMPOSER_CLASS =
  "flex min-h-[120px] w-full max-w-[620px] flex-col rounded-[20px] border border-[color:var(--chat-outline)] bg-[var(--chatbox-bg)] px-5 py-4 shadow-[var(--shadow-chatbox)] ui-t-layout";

type CaseChatClientProps = {
  caseId: string;
  chatId: string;
};

export function CaseChatClient({ caseId, chatId }: CaseChatClientProps) {
  const reduceMotion = useReducedMotion();
  const workspace = useCaseWorkspace();
  const caseRecord = useMemo(() => getCaseById(caseId), [caseId]);
  const sessionChat = useMemo(
    () => getSessionChatById(chatId),
    [chatId, workspace.chats],
  );
  const staticChat = useMemo(() => getStaticCaseChat(chatId), [chatId]);
  const chatMeta = sessionChat ?? staticChat;
  const isSessionChat = Boolean(sessionChat);

  const [staticMessages, setStaticMessages] = useState<CaseChatMessage[]>(() =>
    getDummyChatMessages(chatId),
  );
  const messages = sessionChat?.messages ?? staticMessages;

  const [message, setMessage] = useState("");
  const [composerMode, setComposerMode] = useState<ComposerMode | null>(null);
  const [composerSkill, setComposerSkill] = useState<Skill | null>(null);
  const [chatTitle, setChatTitle] = useState(chatMeta?.title ?? "Untitled");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [showThinkingGif, setShowThinkingGif] = useState(true);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [documentCollection, setDocumentCollection] = useState<DocumentPreview[]>([]);
  const [documentActiveIndex, setDocumentActiveIndex] = useState(0);
  const [documentCollectionTitle, setDocumentCollectionTitle] = useState<string | undefined>(
    undefined,
  );
  const [documentCollectionSubtitle, setDocumentCollectionSubtitle] = useState<
    string | undefined
  >(undefined);
  const [documentPreviewInitialView, setDocumentPreviewInitialView] = useState<
    "list" | "preview" | undefined
  >(undefined);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const generationAbortRef = useRef<AbortController | null>(null);
  const repliedForChatRef = useRef<string | null>(null);
  const chatJobs = useChatJobs();

  useEffect(() => {
    repliedForChatRef.current = null;
    chatJobs.resetJobs();
  }, [chatId, chatJobs.resetJobs]);

  useEffect(() => {
    if (chatMeta?.title) setChatTitle(chatMeta.title);
  }, [chatMeta?.title]);

  useEffect(() => {
    if (!documentPreviewOpen) return;
    window.dispatchEvent(new CustomEvent("lexee:right-panel-opened"));
  }, [documentPreviewOpen]);

  const lastAssistantMessageIndex = useMemo(
    () => messages.reduce((latest, msg, idx) => (msg.role === "assistant" ? idx : latest), -1),
    [messages],
  );

  const generatedDocuments = useMemo(() => collectGeneratedDocuments(messages), [messages]);
  const isGeneratedDocumentsPanelOpen =
    documentPreviewOpen && documentCollectionTitle === "Generated documents";

  const isLexeeEndSymbolVisible = (messageIndex: number) =>
    !isGenerating && messageIndex === lastAssistantMessageIndex;

  useEffect(() => {
    if (messages.length === 0) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messages.length, isGenerating, reduceMotion]);

  const persistMessages = useCallback(
    (nextMessages: CaseChatMessage[]) => {
      if (isSessionChat) {
        updateCaseChat(chatId, {
          messages: nextMessages,
          lastActivityAt: new Date().toISOString(),
        });
      } else {
        setStaticMessages(nextMessages);
      }
    },
    [chatId, isSessionChat],
  );

  const openDocumentPreview = useCallback(
    (
      docs: DocumentPreview[],
      title: string,
      subtitle?: string,
      options?: { activeIndex?: number; initialView?: "list" | "preview" },
    ) => {
      if (!docs.length) return;
      chatJobs.closeJobsPanel();
      setDocumentCollection(docs);
      setDocumentActiveIndex(options?.activeIndex ?? 0);
      setDocumentCollectionTitle(title);
      setDocumentCollectionSubtitle(subtitle);
      setDocumentPreviewInitialView(options?.initialView);
      setDocumentPreviewOpen(true);
    },
    [chatJobs.closeJobsPanel],
  );

  const openJobsPanel = useCallback(() => {
    setDocumentPreviewOpen(false);
    chatJobs.openJobsPanel();
  }, [chatJobs.openJobsPanel]);

  const openGeneratedDocumentsPanel = useCallback(() => {
    if (!generatedDocuments.length) return;
    openDocumentPreview(
      generatedDocuments,
      "Generated documents",
      `${generatedDocuments.length} document${generatedDocuments.length === 1 ? "" : "s"} in this chat`,
      { initialView: "list" },
    );
  }, [generatedDocuments, openDocumentPreview]);

  const runAssistantTurn = useCallback(
    async (
      messagesIncludingLatestUser: CaseChatMessage[],
      composerContext?: { mode: ComposerMode | null; skillId: string | null },
    ) => {
      if (!caseRecord) return;
      const trimmed =
        messagesIncludingLatestUser[messagesIncludingLatestUser.length - 1]?.content ?? "";
      if (!trimmed) return;

      const contextMessages = messagesIncludingLatestUser.slice(0, -1);

      generationAbortRef.current?.abort();
      const ac = new AbortController();
      generationAbortRef.current = ac;

      setIsGenerating(true);
      const jobId = chatJobs.startJob({
        title: jobTitleFromPrompt(trimmed),
        caseRef: caseRefFromCaseRecord(caseRecord),
      });
      const onProgress = chatJobs.bindGenerationProgress(jobId, setGenerationProgress);
      onProgress({
        headline: GENERATION_PHASES[0]?.label ?? "Lexee is thinking…",
        step: 0,
      });

      try {
        await runGenerationPhases(onProgress, ac.signal);
      } catch {
        if (ac.signal.aborted) {
          chatJobs.cancelJob(jobId);
        } else {
          chatJobs.failJob(jobId);
        }
        setIsGenerating(false);
        setGenerationProgress(null);
        generationAbortRef.current = null;
        return;
      }

      let assistantReply: string;
      let presentation: string | undefined;
      let generatedTask: CaseChatMessage["generatedTask"];
      let generatedDocument: CaseChatMessage["generatedDocument"];

      const latestAssistantMessage = [...messagesIncludingLatestUser]
        .slice(0, -1)
        .reverse()
        .find((msg) => msg.role === "assistant");

      const latestUser = messagesIncludingLatestUser[messagesIncludingLatestUser.length - 1];
      const resolvedComposerMode =
        composerContext?.mode ?? latestUser?.composerMode ?? composerMode ?? null;
      const resolvedSkillId =
        composerContext?.skillId ?? latestUser?.skillId ?? composerSkill?.id ?? null;

      const demoReply = resolveScriptedDemoReply({
        trimmed,
        messages: messagesIncludingLatestUser.slice(0, -1),
        latestAssistantPresentation: latestAssistantMessage?.presentation,
        matterName: caseRecord.name,
        composerMode: resolvedComposerMode,
        skillId: resolvedSkillId,
      });

      if (demoReply) {
        assistantReply = demoReply.content;
        presentation = demoReply.presentation;
        generatedTask = demoReply.generatedTask;
      } else if (isDocumentKeywordPrompt(trimmed)) {
        assistantReply = "Drafting successfully completed.";
        presentation = "draft_document_demo";
        generatedDocument = createDraftPetitionGeneratedDocument();
      } else {
        try {
          assistantReply = await resolvePrototypeAssistantReply({
            messages: contextMessages,
            trimmed,
            matterName: caseRecord.name,
            signal: ac.signal,
          });
        } catch {
          if (ac.signal.aborted) {
            chatJobs.cancelJob(jobId);
            setIsGenerating(false);
            setGenerationProgress(null);
            generationAbortRef.current = null;
            return;
          }
          assistantReply = "Something went wrong while generating a reply. Please try again.";
        }
      }

      persistMessages([
        ...messagesIncludingLatestUser,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: assistantReply,
          ...(presentation ? { presentation } : {}),
          ...(generatedDocument ? { generatedDocument } : {}),
          ...(generatedTask ? { generatedTask } : {}),
        },
      ]);
      chatJobs.completeJob(jobId);
      setIsGenerating(false);
      setGenerationProgress(null);
      generationAbortRef.current = null;
    },
    [caseRecord, persistMessages, chatJobs, composerMode, composerSkill],
  );

  useEffect(() => {
    if (!isSessionChat || !sessionChat) return;
    if (sessionChat.messages.some((entry) => entry.role === "assistant")) return;
    const lastMessage = sessionChat.messages[sessionChat.messages.length - 1];
    if (lastMessage?.role !== "user") return;
    if (repliedForChatRef.current === chatId) return;

    repliedForChatRef.current = chatId;
    void runAssistantTurn(sessionChat.messages);
  }, [chatId, isSessionChat, sessionChat, runAssistantTurn]);

  const markTaskSynced = useCallback(
    (messageId: string) => {
      persistMessages(
        messages.map((entry) =>
          entry.id === messageId ? { ...entry, cloudLexSynced: true } : entry,
        ),
      );
    },
    [messages, persistMessages],
  );

  if (!caseRecord || !chatMeta) {
    return (
      <div className="flex h-[100dvh] min-h-0 flex-1 flex-col overflow-hidden bg-[var(--background)] pl-4 pr-6">
        <div className="min-h-0 flex-1 overflow-y-auto pb-8 pt-2">
          <p className="text-body-md text-neutral-600">This chat could not be found.</p>
          <Link
            href={`/cases/${caseId}`}
            className="mt-4 inline-block text-body-md font-medium text-neutral-950 ui-t-colors hover:text-neutral-700"
          >
            Back to case
          </Link>
        </div>
      </div>
    );
  }

  const canSendWithComposerTrigger = isTaskCreationComposerTrigger({
    mode: composerMode,
    skillId: composerSkill?.id ?? null,
  });
  const isSendDisabled =
    (message.trim().length === 0 && !canSendWithComposerTrigger) || isGenerating;

  const resizeTextarea = (event: FormEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;
    target.style.height = "0px";
    target.style.height = `${target.scrollHeight}px`;
  };

  const sendMessage = async (contentOverride?: string) => {
    const trimmed = (contentOverride ?? message).trim();
    const effectiveContent =
      trimmed ||
      (canSendWithComposerTrigger && !contentOverride ? TASK_DEMO_PROMPT : "");
    if (!effectiveContent || isGenerating) return;

    if (!contentOverride) setMessage("");
    const composerContext = {
      mode: composerMode,
      skillId: composerSkill?.id ?? null,
    };
    setComposerMode(null);
    setComposerSkill(null);

    const withUser: CaseChatMessage[] = [
      ...messages,
      {
        id: `${Date.now()}-user`,
        role: "user",
        content: effectiveContent,
        ...(composerContext.mode ? { composerMode: composerContext.mode } : {}),
        ...(composerContext.skillId ? { skillId: composerContext.skillId } : {}),
      },
    ];
    persistMessages(withUser);
    await runAssistantTurn(withUser, composerContext);
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Clipboard may be unavailable in static export previews.
    }
  };

  return (
    <div className="flex h-[100dvh] min-h-0 w-full min-w-0 flex-1 flex-row overflow-hidden bg-[var(--background)]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-4 pr-6">
        <div className="sticky top-0 z-20 shrink-0 bg-[var(--background)] pt-2 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <CaseChatBreadcrumb
                caseId={caseId}
                caseName={caseRecord.name}
                chatTitle={chatTitle}
              />
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <ChatDocumentsButton
                count={generatedDocuments.length}
                onClick={openGeneratedDocumentsPanel}
                active={isGeneratedDocumentsPanelOpen}
              />
              <ChatJobsButton
                activeCount={chatJobs.runningCount}
                onClick={openJobsPanel}
                active={chatJobs.jobsPanelOpen}
              />
            </div>
          </div>
        </div>

        <motion.div
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={uiMotionTransition(reduceMotion, 0.28)}
        >
          <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-3 px-4 pb-4 pt-4">
            {messages.map((chatMessage, messageIndex) =>
              chatMessage.role === "user" ? (
                <div key={chatMessage.id} className="group ml-auto max-w-[80%]">
                  <div className="ml-auto w-fit rounded-[6px] bg-neutral-200 px-[10px] py-1">
                    <p className="text-body-lg text-neutral-950">{chatMessage.content}</p>
                  </div>
                  <div
                    className={[
                      "mt-1 flex items-center justify-end gap-1 text-neutral-500 ui-t-opacity",
                      "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
                      "group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      aria-label="Retry message"
                      onClick={() => void sendMessage(chatMessage.content)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                    >
                      <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                    <button
                      type="button"
                      aria-label="Edit message"
                      onClick={() => setMessage(chatMessage.content)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                    <button
                      type="button"
                      aria-label="Copy message"
                      onClick={() => void handleCopyMessage(chatMessage.content)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                    >
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                  </div>
                </div>
              ) : chatMessage.presentation === "create_task_demo" && chatMessage.generatedTask ? (
                <div key={chatMessage.id} className="group max-w-[90%]">
                  {chatMessage.content ? (
                    <p className="whitespace-pre-wrap text-response-md text-neutral-950">
                      {chatMessage.content}
                    </p>
                  ) : null}
                  <ChatTaskDemoCard
                    task={chatMessage.generatedTask}
                    synced={chatMessage.cloudLexSynced}
                    onSync={() => markTaskSynced(chatMessage.id)}
                  />
                  <div
                    className={[
                      "mt-1 flex h-6 items-center gap-1 text-neutral-500 ui-t-opacity",
                      messageIndex === lastAssistantMessageIndex
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      aria-label="Copy response"
                      onClick={() => void handleCopyMessage(chatMessage.content)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                    >
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                    <button
                      type="button"
                      aria-label="Share response"
                      onClick={() => void handleCopyMessage(chatMessage.content)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                    >
                      <Share2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                  </div>
                  <LexeeResponseEndSymbol visible={isLexeeEndSymbolVisible(messageIndex)} />
                </div>
              ) : chatMessage.presentation === "draft_document_demo" ? (
                <div key={chatMessage.id} className="group w-full max-w-2xl">
                  <ChatGeneratedDocumentCard
                    document={
                      chatMessage.generatedDocument ?? createDraftPetitionGeneratedDocument()
                    }
                    fileName={DRAFT_PETITION_FILE_NAME}
                    saved={chatMessage.cloudLexSynced}
                    onView={() => {
                      const doc =
                        chatMessage.generatedDocument ?? createDraftPetitionGeneratedDocument();
                      openDocumentPreview([doc], "Draft document", "Generated draft");
                    }}
                    onSave={() => markTaskSynced(chatMessage.id)}
                    onRegenerate={() => {
                      if (isGenerating) return;
                      for (let i = messageIndex - 1; i >= 0; i -= 1) {
                        const candidate = messages[i];
                        if (candidate?.role === "user") {
                          void sendMessage(candidate.content);
                          return;
                        }
                      }
                    }}
                  />
                  <div
                    className={[
                      "mt-1 flex h-6 items-center gap-1 text-neutral-500 ui-t-opacity",
                      messageIndex === lastAssistantMessageIndex
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      aria-label="Copy response"
                      onClick={() =>
                        void handleCopyMessage(
                          chatMessage.content ||
                            chatMessage.generatedDocument?.title ||
                            "Generated document",
                        )
                      }
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                    >
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                    <button
                      type="button"
                      aria-label="Share response"
                      onClick={() =>
                        void handleCopyMessage(
                          chatMessage.content ||
                            chatMessage.generatedDocument?.title ||
                            "Generated document",
                        )
                      }
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                    >
                      <Share2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                  </div>
                  <LexeeResponseEndSymbol visible={isLexeeEndSymbolVisible(messageIndex)} />
                </div>
              ) : (
                <div key={chatMessage.id} className="group max-w-[90%]">
                  <p className="whitespace-pre-wrap text-response-md text-neutral-950">
                    {chatMessage.content}
                  </p>
                  <div
                    className={[
                      "mt-1 flex h-6 items-center gap-1 text-neutral-500 ui-t-opacity",
                      messageIndex === lastAssistantMessageIndex
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      aria-label="Copy response"
                      onClick={() => void handleCopyMessage(chatMessage.content)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                    >
                      <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                    <button
                      type="button"
                      aria-label="Share response"
                      onClick={() => void handleCopyMessage(chatMessage.content)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                    >
                      <Share2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </button>
                  </div>
                  <LexeeResponseEndSymbol visible={isLexeeEndSymbolVisible(messageIndex)} />
                </div>
              ),
            )}

            {isGenerating && generationProgress ? (
              <div className="flex max-w-[min(90%,42rem)] items-start gap-2 text-response-md text-neutral-700">
                {showThinkingGif ? (
                  <Image
                    src="/lexee-thinking.gif"
                    alt=""
                    width={22}
                    height={22}
                    unoptimized
                    onError={() => setShowThinkingGif(false)}
                    className="mt-0.5 h-[22px] w-[22px] shrink-0 rounded-full"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-[10px] w-[10px] shrink-0 animate-pulse rounded-full bg-violet-400"
                  />
                )}
                <p className="min-w-0 flex-1" aria-live="polite">
                  {generationProgress.headline}
                </p>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
        </motion.div>

        <motion.div
          className="z-10 w-full shrink-0 bg-[var(--background)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={uiMotionTransition(reduceMotion, 0.3)}
        >
          <div className="mx-auto flex w-[620px] max-w-full min-w-0 flex-col">
            <div className={HOME_CHAT_COMPOSER_CLASS}>
              <ChatComposerInput
                message={message}
                onMessageChange={setMessage}
                textareaRef={textareaRef}
                onInput={resizeTextarea}
                onKeyDown={handleTextareaKeyDown}
                onSend={() => void sendMessage()}
                sendDisabled={isSendDisabled}
                composerMode={composerMode}
                onComposerModeChange={setComposerMode}
                selectedSkill={composerSkill}
                onSkillSelect={setComposerSkill}
              />
            </div>
          </div>
          <p className="mt-2 pb-1 text-center text-caption select-none">
            Lexee is AI and can make mistakes. Please double-check responses.
          </p>
        </motion.div>
      </div>

      <AnimatedPanel open={documentPreviewOpen} className="shrink-0">
        {documentPreviewOpen ? (
          <DocumentPreviewPanel
            open
            documents={documentCollection}
            activeIndex={documentActiveIndex}
            collectionTitle={documentCollectionTitle}
            collectionSubtitle={documentCollectionSubtitle}
            initialView={documentPreviewInitialView}
            onSelect={setDocumentActiveIndex}
            onUpdateDocument={(index, next) =>
              setDocumentCollection((prev) => prev.map((doc, i) => (i === index ? next : doc)))
            }
            onClose={() => setDocumentPreviewOpen(false)}
          />
        ) : null}
      </AnimatedPanel>

      <AnimatedPanel open={chatJobs.jobsPanelOpen} className="shrink-0">
        <JobsPanel
          open={chatJobs.jobsPanelOpen}
          jobs={chatJobs.visibleJobs}
          statusFilter={chatJobs.statusFilter}
          expandedJobId={chatJobs.expandedJobId}
          onStatusFilterChange={chatJobs.setStatusFilter}
          onExpandedJobIdChange={chatJobs.setExpandedJobId}
          onClose={chatJobs.closeJobsPanel}
        />
      </AnimatedPanel>
    </div>
  );
}
