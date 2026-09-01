"use client";

import Image from "next/image";
import {
  Copy,
  Download,
  Pencil,
  RotateCcw,
  Share2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AnimatedPanel } from "@/components/AnimatedPanel";
import { ChatBreadcrumb } from "@/components/ChatBreadcrumb";
import { ChatCaseSelector } from "@/components/ChatCaseSelector";
import { ChatComposerInput } from "@/components/ChatComposerInput";
import { ChatDocumentsButton } from "@/components/ChatDocumentsButton";
import { ChatJobsButton } from "@/components/ChatJobsButton";
import { ChatTaskDemoCard } from "@/components/ChatTaskDemoCard";
import { JobsPanel } from "@/components/JobsPanel";
import { uiFadeSlide, uiMotionTransition, UI_CARD_INTERACTIVE } from "@/lib/ui-motion";
import type { FormEvent, KeyboardEvent } from "react";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LexeeResponseEndSymbol } from "@/components/LexeeResponseEndSymbol";
import { MedicalSummaryDemoResponse } from "@/components/MedicalSummaryDemoResponse";
import { DocumentFormatBadge } from "@/components/DocumentFormatBadge";
import { DocumentPreviewPanel, type DocumentPreview } from "@/components/DocumentPreviewPanel";
import { VoiceListeningPanel } from "@/components/VoiceListeningPanel";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useChatJobs } from "@/hooks/useChatJobs";
import { createSampleDocumentPreview } from "@/lib/document-preview-names";
import {
  collectGeneratedDocuments,
  createMedicalSummaryGeneratedDocument,
  createSummonsGeneratedDocument,
} from "@/lib/chat-generated-documents";
import {
  GENERATION_PHASES,
  type GenerationProgress,
  runGenerationPhases,
} from "@/lib/generation-phases";
import { caseRefFromMatterName, jobTitleFromPrompt } from "@/lib/jobs";
import {
  MEDICAL_SUMMARY_SKILL_ID,
  MEDICAL_SUMMARY_DEMO_PROMPT,
  MEDICAL_SUMMARY_DEMO_MATTER,
  MEDICAL_SUMMARY_ADDITIONAL_INSTRUCTIONS_RESPONSE,
  SUMMONS_ADDITIONAL_INSTRUCTIONS_RESPONSE,
  SUMMONS_DEMO_PROMPT,
  SUMMONS_SKILL_ID,
  isMedicalSummaryRequestPrompt,
  isSummonsDocumentRequestPrompt,
  shouldShowMedicalSummaryDemo,
  shouldShowSummonsDocumentDemo,
} from "@/lib/skill-launches";
import { resolveScriptedDemoReply } from "@/lib/scripted-chat-demo";
import {
  isTaskCreationComposerTrigger,
  TASK_ADDITIONAL_INSTRUCTIONS_RESPONSE,
  TASK_CREATION_SKILL_ID,
  TASK_DEMO_PROMPT,
  type ComposerMode,
} from "@/lib/task-launches";
import type { Skill } from "@/app/skills/skills-data";
import type { TaskCardData } from "@/components/TaskCard";
import { buildLlmTurns, fetchLlmChatReply } from "@/lib/llm-chat-client";
import { getGeneralChatFirstResponse, getResponse } from "@/lib/responses";
import {
  HISTORY_CHAT_ENTRIES,
  isHistoryNavId,
  SHARED_HISTORY_CONVERSATION_ID,
} from "@/lib/history-chat";

const MATTERS: { name: string; caseNumber: string }[] = [
  { name: "Murdock v. Metro Health", caseNumber: "2024-CV-01842" },
  { name: "People v. N. Castle Holdings", caseNumber: "2023-CR-09417" },
  { name: "State Bar Compliance - Q2", caseNumber: "ADM-2026-004" },
  { name: "Acme Insurance Intake", caseNumber: "CLM-2026-3318" },
  { name: "Nelson & Murdock Retainer Draft", caseNumber: "ENG-2025-112" },
  { name: "Geramita vs Ayal", caseNumber: "2025-CV-00671" },
  { name: MEDICAL_SUMMARY_DEMO_MATTER, caseNumber: "2026-CV-01408" },
];

const DEFAULT_SELECTED_MATTER = MATTERS[0].name;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  presentation?:
    | "medical_summary_demo"
    | "summons_document_demo"
    | "summons_skill_cards"
    | "summons_additional_instructions"
    | "medical_summary_additional_instructions"
    | "task_creation_additional_instructions"
    | "create_task_demo";
  generatedDocument?: DocumentPreview;
  generatedTask?: TaskCardData;
  cloudLexSynced?: boolean;
};

type SummonsCategory = "MVA" | "Slip and Fall";

type HistoryConversation = {
  matter: string | null;
  messages: ChatMessage[];
};

const HISTORY_CONVERSATIONS: Record<string, HistoryConversation> = {
  "medical-summary-demo": {
    matter: MEDICAL_SUMMARY_DEMO_MATTER,
    messages: [
      {
        id: "history-demo-user-1",
        role: "user",
        content: "Create a medical summary for Tyler Durden's accident treatment timeline.",
      },
      {
        id: "history-demo-assistant-1",
        role: "assistant",
        content:
          "Absolutely. I can prepare a structured medical summary covering the accident details, emergency care, diagnostics, follow-up treatment, and current condition.",
      },
      {
        id: "history-demo-user-2",
        role: "user",
        content: "Include MRI findings and specialist recommendations.",
      },
      {
        id: "history-demo-assistant-2",
        role: "assistant",
        content: "",
        presentation: "medical_summary_demo",
      },
    ],
  },
  "summons-geramita-ayal": {
    matter: "Geramita vs Ayal",
    messages: [
      {
        id: "history-summons-user-1",
        role: "user",
        content: "Create a summons for Geramita vs Ayal.",
      },
      {
        id: "history-summons-assistant-1",
        role: "assistant",
        content: SUMMONS_ADDITIONAL_INSTRUCTIONS_RESPONSE,
        presentation: "summons_additional_instructions",
      },
    ],
  },
  "case-knowledge-doubt": {
    matter: "Murdock v. Metro Health",
    messages: [
      {
        id: "history-knowledge-user-1",
        role: "user",
        content:
          "I have a doubt regarding case knowledge — can you confirm which filings are on record for Murdock v. Metro Health?",
      },
      {
        id: "history-knowledge-assistant-1",
        role: "assistant",
        content:
          "I can help with that. From the matter workspace I see the operative complaint, defendant's answer, and two discovery orders. Tell me which filing or date range you want to verify and I will cite the source documents.",
      },
    ],
  },
  "cloudlex-features": {
    matter: null,
    messages: [
      {
        id: "history-cloudlex-user-1",
        role: "user",
        content: "Explore features on CloudLex.",
      },
      {
        id: "history-cloudlex-assistant-1",
        role: "assistant",
        content:
          "CloudLex connects matter management, calendaring, document automation, and billing in one workspace. I can walk you through intake workflows, deadline rules, or how Lexee skills plug into an active matter — which area should we start with?",
      },
    ],
  },
};

function MatterTextCrossfade({
  text,
  className,
  display = "inline",
}: {
  text: string;
  className?: string;
  display?: "block" | "inline";
}) {
  const reduceMotion = useReducedMotion();
  const isBlock = display === "block";

  return (
    <span
      className={[
        isBlock ? "relative block min-w-0 w-full overflow-hidden" : "inline",
      ].join(" ")}
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={uiMotionTransition(reduceMotion, 0.15)}
          className={[
            isBlock ? "block truncate" : "inline",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const HOME_CHAT_SHELL_CLASS =
  "flex w-[620px] max-w-full flex-col rounded-[26px] border border-violet-100 bg-violet-50 p-1.5 shadow-[var(--shadow-chatbox)] ui-t-layout";

const HOME_CHAT_COMPOSER_CLASS =
  "flex min-h-[120px] w-full flex-col rounded-[20px] border border-[color:var(--chat-outline)] bg-[var(--chatbox-bg)] px-5 py-4 ui-t-layout";

const DEFAULT_CHAT_TITLE = "New chat";

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatTitle, setChatTitle] = useState(DEFAULT_CHAT_TITLE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showThinkingGif, setShowThinkingGif] = useState(true);
  const [selectedMatter, setSelectedMatter] = useState<string | null>(null);
  const [composerMode, setComposerMode] = useState<ComposerMode | null>(null);
  const [composerSkill, setComposerSkill] = useState<Skill | null>(null);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [documentCollection, setDocumentCollection] = useState<DocumentPreview[]>([]);
  const [documentActiveIndex, setDocumentActiveIndex] = useState(0);
  const [documentCollectionTitle, setDocumentCollectionTitle] = useState<string | undefined>(undefined);
  const [documentCollectionSubtitle, setDocumentCollectionSubtitle] = useState<string | undefined>(undefined);
  const [documentPreviewInitialView, setDocumentPreviewInitialView] = useState<
    "list" | "preview" | undefined
  >(undefined);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const generationAbortRef = useRef<AbortController | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const {
    isSupported: isSpeechSupported,
    transcript: voiceTranscript,
    interimTranscript: voiceInterim,
    error: voiceError,
    start: startSpeech,
    stop: stopSpeech,
    abort: abortSpeech,
    reset: resetSpeech,
  } = useSpeechRecognition();
  const chatJobs = useChatJobs({ includeDemoJob: true });

  const normalisePrompt = (prompt: string) =>
    prompt
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[?.!,]+$/g, "");

  const beginVoiceMode = useCallback(() => {
    if (!isSpeechSupported || isGenerating) return;
    const started = startSpeech();
    if (started) setIsVoiceMode(true);
  }, [isGenerating, isSpeechSupported, startSpeech]);

  const cancelVoiceMode = useCallback(() => {
    abortSpeech();
    resetSpeech();
    setIsVoiceMode(false);
    queueMicrotask(() => {
      textareaRef.current?.focus();
    });
  }, [abortSpeech, resetSpeech]);

  const confirmVoiceMode = useCallback(() => {
    const draft = `${voiceTranscript}${voiceInterim}`.replace(/\s+/g, " ").trim();
    stopSpeech();
    if (draft) {
      setMessage((prev) => {
        const existing = prev.trim();
        return existing ? `${existing} ${draft}` : draft;
      });
    }
    resetSpeech();
    setIsVoiceMode(false);
    queueMicrotask(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.style.height = "0px";
      el.style.height = `${el.scrollHeight}px`;
    });
  }, [resetSpeech, stopSpeech, voiceInterim, voiceTranscript]);

  useEffect(() => {
    if (!documentPreviewOpen) return;
    window.dispatchEvent(new CustomEvent("lexee:right-panel-opened"));
  }, [documentPreviewOpen]);

  const resizeTextarea = (event: FormEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;
    target.style.height = "0px";
    target.style.height = `${target.scrollHeight}px`;
  };

  const lastAssistantMessageIndex = useMemo(
    () => messages.reduce((latest, msg, idx) => (msg.role === "assistant" ? idx : latest), -1),
    [messages],
  );
  const generatedDocuments = useMemo(() => collectGeneratedDocuments(messages), [messages]);
  const isGeneratedDocumentsPanelOpen =
    documentPreviewOpen && documentCollectionTitle === "Generated documents";
  const isLexeeEndSymbolVisible = (messageIndex: number) =>
    !isGenerating && messageIndex === lastAssistantMessageIndex;

  const resetChat = useCallback(() => {
    generationAbortRef.current?.abort();
    generationAbortRef.current = null;
    setMessage("");
    setMessages([]);
    setChatTitle(DEFAULT_CHAT_TITLE);
    setIsGenerating(false);
    setGenerationProgress(null);
    setSelectedMatter(null);
    setDocumentPreviewOpen(false);
    setDocumentCollection([]);
    setDocumentActiveIndex(0);
    setDocumentCollectionTitle(undefined);
    setDocumentCollectionSubtitle(undefined);
    setDocumentPreviewInitialView(undefined);
    chatJobs.resetJobs();
    window.dispatchEvent(
      new CustomEvent("lexee:active-conversation-changed", {
        detail: { conversationId: null as string | null },
      }),
    );
  }, [chatJobs.resetJobs]);

  useEffect(() => {
    window.addEventListener("lexee:new-chat", resetChat);
    return () => {
      window.removeEventListener("lexee:new-chat", resetChat);
    };
  }, [resetChat]);

  useEffect(() => {
    const loadHistoryConversation = () => {
      const conversation = HISTORY_CONVERSATIONS[SHARED_HISTORY_CONVERSATION_ID];
      if (!conversation) return;

      generationAbortRef.current?.abort();
      generationAbortRef.current = null;
      setMessage("");
      setMessages(conversation.messages);
      setIsGenerating(false);
      setGenerationProgress(null);
      setSelectedMatter(conversation.matter ?? null);
      setChatTitle(
        HISTORY_CHAT_ENTRIES.find((entry) => entry.id === SHARED_HISTORY_CONVERSATION_ID)?.label ??
          DEFAULT_CHAT_TITLE,
      );
      setDocumentPreviewOpen(false);
      setDocumentCollection([]);
      setDocumentActiveIndex(0);
      setDocumentCollectionTitle(undefined);
      setDocumentCollectionSubtitle(undefined);
      window.dispatchEvent(
        new CustomEvent("lexee:active-conversation-changed", {
          detail: { conversationId: SHARED_HISTORY_CONVERSATION_ID },
        }),
      );
    };

    const pendingNavId = window.sessionStorage.getItem("lexee:pending-history-nav");
    if (pendingNavId && isHistoryNavId(pendingNavId)) {
      loadHistoryConversation();
      window.dispatchEvent(
        new CustomEvent("lexee:history-nav-selected", { detail: { navId: pendingNavId } }),
      );
      window.sessionStorage.removeItem("lexee:pending-history-nav");
    }

    const handleHistoryConversationOpen = () => {
      loadHistoryConversation();
    };

    window.addEventListener("lexee:open-history-conversation", handleHistoryConversationOpen);
    return () => {
      window.removeEventListener("lexee:open-history-conversation", handleHistoryConversationOpen);
    };
  }, []);

  useEffect(() => {
    const skill = searchParams.get("skill");
    const isMedicalSummaryLaunch = skill === MEDICAL_SUMMARY_SKILL_ID;
    const isSummonsLaunch = skill === SUMMONS_SKILL_ID;
    const isTaskCreationLaunch = skill === TASK_CREATION_SKILL_ID;
    if (!isMedicalSummaryLaunch && !isSummonsLaunch && !isTaskCreationLaunch) return;

    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      generationAbortRef.current?.abort();
      const ac = new AbortController();
      generationAbortRef.current = ac;

      setMessages([
        {
          id: `launch-user-${Date.now()}`,
          role: "user",
          content: isSummonsLaunch
            ? SUMMONS_DEMO_PROMPT
            : isTaskCreationLaunch
              ? TASK_DEMO_PROMPT
              : MEDICAL_SUMMARY_DEMO_PROMPT,
        },
      ]);
      setSelectedMatter(
        isMedicalSummaryLaunch
          ? MEDICAL_SUMMARY_DEMO_MATTER
          : isTaskCreationLaunch
            ? DEFAULT_SELECTED_MATTER
            : DEFAULT_SELECTED_MATTER,
      );
      /* Keep ?skill= in the URL until generation finishes — immediate router.replace here
       * can reset the suspense/searchParams subtree and drop isGenerating / generationProgress. */
      setIsGenerating(true);
      const launchMatter = isMedicalSummaryLaunch
        ? MEDICAL_SUMMARY_DEMO_MATTER
        : DEFAULT_SELECTED_MATTER;
      const launchTitle = isSummonsLaunch
        ? "Run Summons skill"
        : isTaskCreationLaunch
          ? "Task creation"
          : "Create Medical summary";
      const launchJobId = chatJobs.startJob({
        title: launchTitle,
        caseRef: caseRefFromMatterName(launchMatter),
      });
      const onLaunchProgress = chatJobs.bindGenerationProgress(launchJobId, setGenerationProgress);
      onLaunchProgress({
        headline: GENERATION_PHASES[0]?.label ?? "Lexee is thinking…",
        step: 0,
      });

      void (async () => {
        try {
          await runGenerationPhases(onLaunchProgress, ac.signal);
        } catch {
          if (!cancelled) {
            if (ac.signal.aborted) {
              chatJobs.cancelJob(launchJobId);
            } else {
              chatJobs.failJob(launchJobId);
            }
            setIsGenerating(false);
            setGenerationProgress(null);
            router.replace("/", { scroll: false });
          }
          generationAbortRef.current = null;
          return;
        }

        if (cancelled) {
          chatJobs.cancelJob(launchJobId);
          generationAbortRef.current = null;
          return;
        }

        setMessages((prev) => [
          ...prev,
          isSummonsLaunch
            ? {
                id: `launch-assistant-${Date.now()}`,
                role: "assistant" as const,
                content: SUMMONS_ADDITIONAL_INSTRUCTIONS_RESPONSE,
                presentation: "summons_additional_instructions" as const,
              }
            : isTaskCreationLaunch
              ? {
                  id: `launch-assistant-${Date.now()}`,
                  role: "assistant" as const,
                  content: TASK_ADDITIONAL_INSTRUCTIONS_RESPONSE,
                  presentation: "task_creation_additional_instructions" as const,
                }
              : {
                  id: `launch-assistant-${Date.now()}`,
                  role: "assistant" as const,
                  content: MEDICAL_SUMMARY_ADDITIONAL_INSTRUCTIONS_RESPONSE,
                  presentation: "medical_summary_additional_instructions" as const,
                },
        ]);
        chatJobs.completeJob(launchJobId);
        setIsGenerating(false);
        setGenerationProgress(null);
        generationAbortRef.current = null;
        router.replace("/", { scroll: false });
      })();
    });

    return () => {
      cancelled = true;
      generationAbortRef.current?.abort();
    };
  }, [
    searchParams,
    router,
    chatJobs.startJob,
    chatJobs.bindGenerationProgress,
    chatJobs.completeJob,
    chatJobs.failJob,
    chatJobs.cancelJob,
  ]);

  const messageCount = messages.length;

  useEffect(() => {
    if (messageCount === 0) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messageCount, reduceMotion]);

  const canSendWithComposerTrigger =
    selectedMatter !== null &&
    isTaskCreationComposerTrigger({
      mode: composerMode,
      skillId: composerSkill?.id ?? null,
    });
  const isSendDisabled =
    (message.trim().length === 0 && !canSendWithComposerTrigger) || isGenerating;

  const markTaskSynced = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((entry) =>
        entry.id === messageId ? { ...entry, cloudLexSynced: true } : entry,
      ),
    );
  }, []);

  const sendMessage = async (contentOverride?: string) => {
    const trimmed = (contentOverride ?? message).trim();
    const effectiveContent =
      trimmed ||
      (canSendWithComposerTrigger && !contentOverride ? TASK_DEMO_PROMPT : "");
    if (!effectiveContent) return;

    generationAbortRef.current?.abort();
    const ac = new AbortController();
    generationAbortRef.current = ac;

    if (isMedicalSummaryRequestPrompt(effectiveContent)) {
      setSelectedMatter(MEDICAL_SUMMARY_DEMO_MATTER);
    }

    const matterForJob = isMedicalSummaryRequestPrompt(effectiveContent)
      ? MEDICAL_SUMMARY_DEMO_MATTER
      : selectedMatter;

    if (!contentOverride) {
      setMessage("");
    }
    const composerModeAtSend = composerMode;
    const composerSkillIdAtSend = composerSkill?.id ?? null;
    setComposerMode(null);
    setComposerSkill(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-user`,
        role: "user",
        content: effectiveContent,
      },
    ]);
    setIsGenerating(true);
    const jobId = chatJobs.startJob({
      title: jobTitleFromPrompt(effectiveContent),
      caseRef: caseRefFromMatterName(matterForJob),
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

    const normalized = normalisePrompt(effectiveContent);
    const latestAssistantMessage = [...messages].reverse().find((msg) => msg.role === "assistant");
    const taskDemoReply = selectedMatter
      ? resolveScriptedDemoReply({
          trimmed: effectiveContent,
          messages,
          latestAssistantPresentation: latestAssistantMessage?.presentation,
          matterName: selectedMatter,
          composerMode: composerModeAtSend,
          skillId: composerSkillIdAtSend,
        })
      : null;
    const useSummonsDocumentDemo = shouldShowSummonsDocumentDemo(
      effectiveContent,
      latestAssistantMessage?.presentation,
    );
    const useSummonsAdditionalInstructions = isSummonsDocumentRequestPrompt(effectiveContent);
    const useMedicalSummaryDemo = shouldShowMedicalSummaryDemo(
      effectiveContent,
      latestAssistantMessage?.presentation,
    );
    const useMedicalSummaryAdditionalInstructions = isMedicalSummaryRequestPrompt(effectiveContent);
    const useDevLlm = process.env.NEXT_PUBLIC_USE_LLM_CHAT === "true";

    const isFirstTurn = messages.length === 0;
    const hasCaseContext = selectedMatter !== null;

    let assistantReply: string;
    let presentation: ChatMessage["presentation"] | undefined;
    let generatedDocument: DocumentPreview | undefined;
    let generatedTask: TaskCardData | undefined;

    if (taskDemoReply) {
      assistantReply = taskDemoReply.content;
      presentation = taskDemoReply.presentation as ChatMessage["presentation"];
      generatedTask = taskDemoReply.generatedTask;
    } else if (useSummonsDocumentDemo) {
      assistantReply = "Here is your Summons document";
      presentation = "summons_document_demo";
      generatedDocument = createSummonsGeneratedDocument(selectedMatter);
    } else if (useSummonsAdditionalInstructions) {
      assistantReply = SUMMONS_ADDITIONAL_INSTRUCTIONS_RESPONSE;
      presentation = "summons_additional_instructions";
    } else if (useMedicalSummaryDemo) {
      assistantReply = "";
      presentation = "medical_summary_demo";
      generatedDocument = createMedicalSummaryGeneratedDocument();
    } else if (useMedicalSummaryAdditionalInstructions) {
      assistantReply = MEDICAL_SUMMARY_ADDITIONAL_INSTRUCTIONS_RESPONSE;
      presentation = "medical_summary_additional_instructions";
    } else {
      const cannedCaseHi =
        isFirstTurn && hasCaseContext && normalized === "hi"
          ? `We are in the context of ${selectedMatter}. How can I help you?`
          : null;
      const cannedGeneralFirst =
        isFirstTurn && !hasCaseContext ? getGeneralChatFirstResponse(effectiveContent) : null;
      const fallbackReply = cannedCaseHi ?? cannedGeneralFirst ?? getResponse(effectiveContent);
      presentation = undefined;
      if (useDevLlm) {
        try {
          const turns = buildLlmTurns(messages, effectiveContent);
          const llmText = await fetchLlmChatReply(turns, {
            matter: selectedMatter,
            signal: ac.signal,
          });
          assistantReply = llmText ?? fallbackReply;
        } catch {
          if (ac.signal.aborted) {
            chatJobs.cancelJob(jobId);
            setIsGenerating(false);
            setGenerationProgress(null);
            generationAbortRef.current = null;
            return;
          }
          assistantReply = fallbackReply;
        }
      } else {
        assistantReply = fallbackReply;
      }
    }

    setMessages((prev) => [
      ...prev,
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
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  const handleRetryMessage = (content: string) => {
    if (isGenerating) return;
    void sendMessage(content);
  };

  const handleEditMessage = (content: string) => {
    setMessage(content);
    textareaRef.current?.focus();
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // Ignore clipboard failures.
    }
  };

  const handleRetryResponse = (messageIndex: number) => {
    if (isGenerating) return;
    for (let i = messageIndex - 1; i >= 0; i -= 1) {
      const candidate = messages[i];
      if (candidate?.role === "user") {
        void sendMessage(candidate.content);
        break;
      }
    }
  };

  const handleShareMessage = async (content: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ text: content });
        return;
      }
      await navigator.clipboard.writeText(content);
    } catch {
      // Ignore share/clipboard failures.
    }
  };

  const handleSummonsCategorySelect = (category: SummonsCategory) => {
    if (isGenerating) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-user`,
        role: "user",
        content: `${category} summons skill`,
      },
      {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: `Great choice — I'll use the ${category} Summons skill. Do you have any additional instructions for me?`,
        presentation: "summons_additional_instructions",
      },
    ]);
  };

  const openDocumentPreview = (
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
  };

  const openJobsPanel = () => {
    setDocumentPreviewOpen(false);
    chatJobs.openJobsPanel();
  };

  const openGeneratedDocumentsPanel = () => {
    if (!generatedDocuments.length) return;
    openDocumentPreview(
      generatedDocuments,
      "Generated documents",
      `${generatedDocuments.length} document${generatedDocuments.length === 1 ? "" : "s"} in this chat`,
      { initialView: "list" },
    );
  };

  const openMedicalSummaryCitationPreview = (
    ..._unused: Parameters<typeof openDocumentPreview>
  ) => {
    void _unused;
    openDocumentPreview([createSampleDocumentPreview()], "Citation document", "Source document");
  };

  const chatStarted = messages.length > 0;

  return (
    <div className="flex h-[100dvh] min-h-0 w-full min-w-0 flex-1 flex-row overflow-hidden bg-[var(--background)]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-4 pr-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="sticky top-0 z-20 shrink-0 bg-[var(--background)] pt-2 pb-3">
            {chatStarted ? (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <ChatBreadcrumb
                    title={chatTitle}
                    onTitleChange={setChatTitle}
                    onMarkUnread={() => {
                      // Prototype: wire unread state when inbox/history sync exists.
                    }}
                    onAddToCase={() => {
                      // Prototype: replace with case picker when Cases is built.
                      window.prompt("Add to case", "");
                    }}
                    onDelete={resetChat}
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
            ) : (
              <div className="flex justify-end">
                <ChatJobsButton
                  activeCount={chatJobs.runningCount}
                  onClick={openJobsPanel}
                  active={chatJobs.jobsPanelOpen}
                />
              </div>
            )}
          </div>

      <AnimatePresence mode="wait" initial={false}>
      {!chatStarted ? (
        <motion.div
          key="chat-empty"
          {...uiFadeSlide(reduceMotion, { enterY: 8, exitY: -10 })}
          transition={uiMotionTransition(reduceMotion, 0.22)}
          className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden"
        >
        <div className="mx-auto w-full max-w-3xl pb-16">
          <div className="flex flex-col items-center gap-[38.4px] px-0">
            <div className="flex items-center justify-center gap-3">
              <Image
                src="/lexee-symbol.svg"
                alt="Lexee"
                width={32}
                height={32}
                priority
              />
              <h1 className="select-none font-tiempos-text text-[36px] leading-none tracking-[-0.015em] text-neutral-950">
                Good Evening, Matt
              </h1>
            </div>

            <div className="flex w-full flex-col items-center">
              <div className={HOME_CHAT_SHELL_CLASS}>
                <div className={HOME_CHAT_COMPOSER_CLASS}>
                  {isVoiceMode ? (
                    <VoiceListeningPanel
                      transcript={voiceTranscript}
                      interimTranscript={voiceInterim}
                      error={voiceError}
                      onCancel={cancelVoiceMode}
                      onConfirm={confirmVoiceMode}
                      disabledConfirm={
                        `${voiceTranscript}${voiceInterim}`.trim().length === 0
                      }
                    />
                  ) : (
                    <ChatComposerInput
                      message={message}
                      onMessageChange={setMessage}
                      textareaRef={textareaRef}
                      onInput={resizeTextarea}
                      onKeyDown={handleTextareaKeyDown}
                      onSend={() => {
                        void sendMessage();
                      }}
                      sendDisabled={isSendDisabled}
                      composerMode={composerMode}
                      onComposerModeChange={setComposerMode}
                      selectedSkill={composerSkill}
                      onSkillSelect={setComposerSkill}
                    />
                  )}
                </div>
                <ChatCaseSelector
                  selectedCaseName={selectedMatter}
                  onSelect={(record) => setSelectedMatter(record.name)}
                />
              </div>
            </div>
          </div>
        </div>
        </motion.div>
      ) : (
        <motion.div
          key="chat-active"
          {...uiFadeSlide(reduceMotion, { enterY: 14, exitY: 8 })}
          transition={uiMotionTransition(reduceMotion, 0.34)}
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col"
        >
          <motion.div
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              ...uiMotionTransition(reduceMotion, 0.28),
              delay: reduceMotion ? 0 : 0.06,
            }}
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
                        onClick={() => handleRetryMessage(chatMessage.content)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label="Edit message"
                        onClick={() => handleEditMessage(chatMessage.content)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label="Copy message"
                        onClick={() => {
                          void handleCopyMessage(chatMessage.content);
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                    </div>
                  </div>
                ) : chatMessage.presentation === "medical_summary_demo" ? (
                  <div key={chatMessage.id} className="group w-full max-w-2xl">
                    <MedicalSummaryDemoResponse
                      onCitationClick={openMedicalSummaryCitationPreview}
                      onSourcesClick={openDocumentPreview}
                    />
                    <div
                      className={[
                        "mt-2 flex h-6 items-center gap-1 text-neutral-500 ui-t-opacity",
                        messageIndex === lastAssistantMessageIndex
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
                      ].join(" ")}
                    >
                      <button
                        type="button"
                        aria-label="Copy response"
                        onClick={() => {
                          void handleCopyMessage(chatMessage.content || "Medical Summary (demo)");
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label="Retry response"
                        onClick={() => handleRetryResponse(messageIndex)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label="Share response"
                        onClick={() => {
                          void handleShareMessage(chatMessage.content || "Medical Summary (demo)");
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <Share2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                    </div>
                    <LexeeResponseEndSymbol visible={isLexeeEndSymbolVisible(messageIndex)} />
                  </div>
                ) : chatMessage.presentation === "summons_skill_cards" ? (
                  <div key={chatMessage.id} className="group max-w-[90%]">
                    <p className="whitespace-pre-wrap text-response-md text-neutral-950">{chatMessage.content}</p>
                    <div className="mt-3 flex w-full gap-2">
                      <button
                        type="button"
                        onClick={() => handleSummonsCategorySelect("MVA")}
                        className={`flex min-w-0 flex-1 items-center justify-between px-4 py-3 text-left ${UI_CARD_INTERACTIVE}`}
                      >
                        <span className="text-body-md font-medium text-neutral-950">Summons</span>
                        <span className="inline-flex items-center rounded-full border border-[color:var(--chat-outline-accent)] bg-violet-50 px-2 py-1 text-[11px] font-medium leading-4 text-violet-700">
                          MVA
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSummonsCategorySelect("Slip and Fall")}
                        className={`flex min-w-0 flex-1 items-center justify-between px-4 py-3 text-left ${UI_CARD_INTERACTIVE}`}
                      >
                        <span className="text-body-md font-medium text-neutral-950">Summons</span>
                        <span className="inline-flex items-center rounded-full border border-[color:var(--chat-outline-accent)] bg-violet-50 px-2 py-1 text-[11px] font-medium leading-4 text-violet-700">
                          Slip and Fall
                        </span>
                      </button>
                    </div>
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
                        onClick={() => {
                          void handleCopyMessage(chatMessage.content);
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label="Retry response"
                        onClick={() => handleRetryResponse(messageIndex)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label="Share response"
                        onClick={() => {
                          void handleShareMessage(chatMessage.content);
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <Share2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                    </div>
                    <LexeeResponseEndSymbol visible={isLexeeEndSymbolVisible(messageIndex)} />
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
                        "mt-2 flex h-6 items-center gap-1 text-neutral-500 ui-t-opacity",
                        messageIndex === lastAssistantMessageIndex
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto",
                      ].join(" ")}
                    >
                      <button
                        type="button"
                        aria-label="Copy response"
                        onClick={() => {
                          void handleCopyMessage(chatMessage.content);
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label="Retry response"
                        onClick={() => handleRetryResponse(messageIndex)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label="Share response"
                        onClick={() => {
                          void handleShareMessage(chatMessage.content);
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <Share2 className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                    </div>
                    <LexeeResponseEndSymbol visible={isLexeeEndSymbolVisible(messageIndex)} />
                  </div>
                ) : (
                  <div key={chatMessage.id} className="group max-w-[90%]">
                    <p className="whitespace-pre-wrap text-response-md text-neutral-950">{chatMessage.content}</p>
                    {chatMessage.presentation === "summons_document_demo" ? (
                      <button
                        type="button"
                        onClick={() =>
                          openDocumentPreview(
                            [
                              createSampleDocumentPreview({
                                format: "PDF",
                                editable: true,
                                isLexeeGenerated: true,
                              }),
                            ],
                            "Summons document",
                            "Generated draft",
                          )
                        }
                        className={`mt-3 w-full p-3 text-left ${UI_CARD_INTERACTIVE}`}
                      >
                        <DocumentFormatBadge format="PDF" size="sm" />
                        <div className="mt-2 flex items-start gap-3">
                          <p className="flex min-w-0 flex-1 items-baseline gap-x-1 text-body-md font-medium text-neutral-950">
                            <span className="shrink-0">Summons for</span>
                            <span className="min-w-0 flex-1 overflow-hidden">
                              <MatterTextCrossfade
                                display="block"
                                text={selectedMatter ?? "this matter"}
                                className="truncate font-medium text-neutral-950"
                              />
                            </span>
                          </p>
                          <a
                            href="/sampledocument.pdf"
                            download
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950"
                            aria-label="Download summons document"
                            title="Download"
                          >
                            <Download className="h-4 w-4" strokeWidth={1.75} />
                          </a>
                        </div>
                      </button>
                    ) : null}
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
                        onClick={() => {
                          void handleCopyMessage(chatMessage.content);
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <Copy className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label="Retry response"
                        onClick={() => handleRetryResponse(messageIndex)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-neutral-200/80"
                      >
                        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        aria-label="Share response"
                        onClick={() => {
                          void handleShareMessage(chatMessage.content);
                        }}
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
            transition={{
              ...uiMotionTransition(reduceMotion, 0.3),
              delay: reduceMotion ? 0 : 0.1,
            }}
          >
            <div className="mx-auto flex w-[620px] max-w-full min-w-0 flex-col">
            <div className={HOME_CHAT_SHELL_CLASS}>
              <div className={HOME_CHAT_COMPOSER_CLASS}>
                {isVoiceMode ? (
                  <VoiceListeningPanel
                    transcript={voiceTranscript}
                    interimTranscript={voiceInterim}
                    error={voiceError}
                    onCancel={cancelVoiceMode}
                    onConfirm={confirmVoiceMode}
                    disabledConfirm={
                      `${voiceTranscript}${voiceInterim}`.trim().length === 0
                    }
                  />
                ) : (
                  <ChatComposerInput
                    message={message}
                    onMessageChange={setMessage}
                    textareaRef={textareaRef}
                    onInput={resizeTextarea}
                    onKeyDown={handleTextareaKeyDown}
                    onSend={() => {
                      void sendMessage();
                    }}
                    sendDisabled={isSendDisabled}
                    composerMode={composerMode}
                    onComposerModeChange={setComposerMode}
                    selectedSkill={composerSkill}
                    onSkillSelect={setComposerSkill}
                  />
                )}
              </div>
              <ChatCaseSelector
                selectedCaseName={selectedMatter}
                onSelect={(record) => setSelectedMatter(record.name)}
              />
            </div>
            </div>
            <p className="mt-2 pb-1 text-center text-caption select-none">
              Lexee is AI and can make mistakes. Please double-check responses.
            </p>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
        </div>
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
            setDocumentCollection((prev) =>
              prev.map((doc, i) => (i === index ? next : doc)),
            )
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
          showCaseFilter
          caseFilter={chatJobs.caseFilter}
          onCaseFilterChange={chatJobs.setCaseFilter}
        />
      </AnimatedPanel>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex h-[100dvh] min-h-0 flex-1 flex-col">
      <Suspense fallback={null}>
        <HomeInner />
      </Suspense>
    </div>
  );
}
