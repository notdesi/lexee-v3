"use client";

import Image from "next/image";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Mic,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Share2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AnimatedPanel } from "@/components/AnimatedPanel";
import { AnimatedPopover } from "@/components/AnimatedPopover";
import { uiFadeSlide, uiMotionTransition } from "@/lib/ui-motion";
import type { FormEvent, KeyboardEvent } from "react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { LexeeResponseEndSymbol } from "@/components/LexeeResponseEndSymbol";
import { MedicalSummaryDemoResponse } from "@/components/MedicalSummaryDemoResponse";
import { DocumentPreviewPanel, type DocumentPreview } from "@/components/DocumentPreviewPanel";
import { createSampleDocumentPreview } from "@/lib/document-preview-names";
import {
  GENERATION_PHASES,
  type GenerationProgress,
  runGenerationPhases,
} from "@/lib/generation-phases";
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
import { buildLlmTurns, fetchLlmChatReply } from "@/lib/llm-chat-client";
import { getResponse } from "@/lib/responses";
import {
  isHistoryNavId,
  SHARED_HISTORY_CONVERSATION_ID,
} from "@/lib/history-chat";

const MATTERS = [
  "Murdock v. Metro Health",
  "People v. N. Castle Holdings",
  "State Bar Compliance - Q2",
  "Acme Insurance Intake",
  "Nelson & Murdock Retainer Draft",
  "Geramita vs Ayal",
  MEDICAL_SUMMARY_DEMO_MATTER,
];

const DEFAULT_SELECTED_MATTER = MATTERS[0];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  presentation?:
    | "medical_summary_demo"
    | "summons_document_demo"
    | "summons_skill_cards"
    | "summons_additional_instructions"
    | "medical_summary_additional_instructions";
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

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showThinkingGif, setShowThinkingGif] = useState(true);
  const [selectedMatter, setSelectedMatter] = useState<string | null>(DEFAULT_SELECTED_MATTER);
  const [matterMenuOpen, setMatterMenuOpen] = useState(false);
  const [matterQuery, setMatterQuery] = useState("");
  const [inlineMatterMenuOpen, setInlineMatterMenuOpen] = useState(false);
  const [inlineMatterQuery, setInlineMatterQuery] = useState("");
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [documentCollection, setDocumentCollection] = useState<DocumentPreview[]>([]);
  const [documentActiveIndex, setDocumentActiveIndex] = useState(0);
  const [documentCollectionTitle, setDocumentCollectionTitle] = useState<string | undefined>(undefined);
  const [documentCollectionSubtitle, setDocumentCollectionSubtitle] = useState<string | undefined>(undefined);
  const matterMenuRef = useRef<HTMLDivElement | null>(null);
  const inlineMatterMenuRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const generationAbortRef = useRef<AbortController | null>(null);

  const normalisePrompt = (prompt: string) =>
    prompt
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[?.!,]+$/g, "");

  useEffect(() => {
    if (!documentPreviewOpen) return;
    window.dispatchEvent(new CustomEvent("lexee:right-panel-opened"));
  }, [documentPreviewOpen]);

  const resizeTextarea = (event: FormEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;
    target.style.height = "0px";
    target.style.height = `${target.scrollHeight}px`;
  };

  const filteredMatters = useMemo(
    () =>
      MATTERS.filter((matter) =>
        matter.toLowerCase().includes(matterQuery.trim().toLowerCase()),
      ),
    [matterQuery],
  );
  const inlineFilteredMatters = useMemo(
    () =>
      MATTERS.filter((matter) =>
        matter.toLowerCase().includes(inlineMatterQuery.trim().toLowerCase()),
      ),
    [inlineMatterQuery],
  );
  const lastAssistantMessageIndex = useMemo(
    () => messages.reduce((latest, msg, idx) => (msg.role === "assistant" ? idx : latest), -1),
    [messages],
  );
  const isLexeeEndSymbolVisible = (messageIndex: number) =>
    !isGenerating && messageIndex === lastAssistantMessageIndex;

  useEffect(() => {
    const resetChat = () => {
      generationAbortRef.current?.abort();
      generationAbortRef.current = null;
      setMessage("");
      setMessages([]);
      setIsGenerating(false);
      setGenerationProgress(null);
      setSelectedMatter(DEFAULT_SELECTED_MATTER);
      setMatterMenuOpen(false);
      setMatterQuery("");
      setInlineMatterMenuOpen(false);
      setInlineMatterQuery("");
      window.dispatchEvent(
        new CustomEvent("lexee:active-conversation-changed", {
          detail: { conversationId: null as string | null },
        }),
      );
    };

    window.addEventListener("lexee:new-chat", resetChat);
    return () => {
      window.removeEventListener("lexee:new-chat", resetChat);
    };
  }, []);

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
      setSelectedMatter(conversation.matter ?? DEFAULT_SELECTED_MATTER);
      setMatterMenuOpen(false);
      setMatterQuery("");
      setInlineMatterMenuOpen(false);
      setInlineMatterQuery("");
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
    if (!isMedicalSummaryLaunch && !isSummonsLaunch) return;

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
          content: isSummonsLaunch ? SUMMONS_DEMO_PROMPT : MEDICAL_SUMMARY_DEMO_PROMPT,
        },
      ]);
      setSelectedMatter(
        isMedicalSummaryLaunch ? MEDICAL_SUMMARY_DEMO_MATTER : DEFAULT_SELECTED_MATTER,
      );
      /* Keep ?skill= in the URL until generation finishes — immediate router.replace here
       * can reset the suspense/searchParams subtree and drop isGenerating / generationProgress. */
      setIsGenerating(true);
      setGenerationProgress({
        headline: GENERATION_PHASES[0]?.label ?? "Lexee is thinking…",
        step: 0,
      });

      void (async () => {
        try {
          await runGenerationPhases(setGenerationProgress, ac.signal);
        } catch {
          if (!cancelled) {
            setIsGenerating(false);
            setGenerationProgress(null);
            router.replace("/", { scroll: false });
          }
          generationAbortRef.current = null;
          return;
        }

        if (cancelled) {
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
            : {
                id: `launch-assistant-${Date.now()}`,
                role: "assistant" as const,
                content: MEDICAL_SUMMARY_ADDITIONAL_INSTRUCTIONS_RESPONSE,
                presentation: "medical_summary_additional_instructions" as const,
              },
        ]);
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
  }, [searchParams, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (matterMenuRef.current && !matterMenuRef.current.contains(target)) {
        setMatterMenuOpen(false);
      }
      if (inlineMatterMenuRef.current && !inlineMatterMenuRef.current.contains(target)) {
        setInlineMatterMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const messageCount = messages.length;

  useEffect(() => {
    if (messageCount === 0) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messageCount, reduceMotion]);

  const isSendDisabled = message.trim().length === 0 || isGenerating;

  const sendMessage = async (contentOverride?: string) => {
    const trimmed = (contentOverride ?? message).trim();
    if (!trimmed) return;

    generationAbortRef.current?.abort();
    const ac = new AbortController();
    generationAbortRef.current = ac;

    if (isMedicalSummaryRequestPrompt(trimmed)) {
      setSelectedMatter(MEDICAL_SUMMARY_DEMO_MATTER);
    }

    if (!contentOverride) {
      setMessage("");
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-user`,
        role: "user",
        content: trimmed,
      },
    ]);
    setIsGenerating(true);
    setGenerationProgress({
      headline: GENERATION_PHASES[0]?.label ?? "Lexee is thinking…",
      step: 0,
    });

    try {
      await runGenerationPhases(setGenerationProgress, ac.signal);
    } catch {
      setIsGenerating(false);
      setGenerationProgress(null);
      generationAbortRef.current = null;
      return;
    }

    const normalized = normalisePrompt(trimmed);
    const latestAssistantMessage = [...messages].reverse().find((msg) => msg.role === "assistant");
    const useSummonsDocumentDemo = shouldShowSummonsDocumentDemo(
      trimmed,
      latestAssistantMessage?.presentation,
    );
    const useSummonsAdditionalInstructions = isSummonsDocumentRequestPrompt(trimmed);
    const useMedicalSummaryDemo = shouldShowMedicalSummaryDemo(
      trimmed,
      latestAssistantMessage?.presentation,
    );
    const useMedicalSummaryAdditionalInstructions = isMedicalSummaryRequestPrompt(trimmed);
    const useDevLlm = process.env.NEXT_PUBLIC_USE_LLM_CHAT === "true";

    let assistantReply: string;
    let presentation: ChatMessage["presentation"] | undefined;

    if (useSummonsDocumentDemo) {
      assistantReply = "Here is your Summons document";
      presentation = "summons_document_demo";
    } else if (useSummonsAdditionalInstructions) {
      assistantReply = SUMMONS_ADDITIONAL_INSTRUCTIONS_RESPONSE;
      presentation = "summons_additional_instructions";
    } else if (useMedicalSummaryDemo) {
      assistantReply = "";
      presentation = "medical_summary_demo";
    } else if (useMedicalSummaryAdditionalInstructions) {
      assistantReply = MEDICAL_SUMMARY_ADDITIONAL_INSTRUCTIONS_RESPONSE;
      presentation = "medical_summary_additional_instructions";
    } else {
      const cannedMatterHi =
        normalized === "hi" && selectedMatter
          ? `We are in the context of ${selectedMatter}. How can I help you?`
          : null;
      presentation = undefined;
      if (useDevLlm) {
        try {
          const turns = buildLlmTurns(messages, trimmed);
          const llmText = await fetchLlmChatReply(turns, {
            matter: selectedMatter,
            signal: ac.signal,
          });
          assistantReply = llmText ?? cannedMatterHi ?? getResponse(trimmed);
        } catch {
          if (ac.signal.aborted) {
            setIsGenerating(false);
            setGenerationProgress(null);
            generationAbortRef.current = null;
            return;
          }
          assistantReply = cannedMatterHi ?? getResponse(trimmed);
        }
      } else {
        assistantReply = cannedMatterHi ?? getResponse(trimmed);
      }
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: assistantReply,
        ...(presentation ? { presentation } : {}),
      },
    ]);
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
  ) => {
    if (!docs.length) return;
    setDocumentCollection(docs);
    setDocumentActiveIndex(0);
    setDocumentCollectionTitle(title);
    setDocumentCollectionSubtitle(subtitle);
    setDocumentPreviewOpen(true);
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-4">
        <div
        ref={matterMenuRef}
        className={[
          "z-20 flex w-full shrink-0 justify-start bg-[var(--background)] ui-t-layout",
          chatStarted ? "border-b border-[color:var(--chat-outline)] pb-3 pt-3" : "pb-8 pt-2",
        ].join(" ")}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setMatterMenuOpen((open) => !open)}
            className="inline-flex min-w-0 max-w-[420px] items-center gap-2 rounded-md px-1 py-1 text-left text-body-md text-neutral-800 ui-t-colors hover:bg-violet-50 hover:text-neutral-950"
            aria-label="Select matter"
          >
            <span className="min-w-0 flex-1 overflow-hidden text-left">
              <MatterTextCrossfade
                display="block"
                text={selectedMatter ?? "No matter selected"}
              />
            </span>
            <ChevronDown
              className={[
                "h-4 w-4 shrink-0 text-neutral-700 ui-t-transform",
                matterMenuOpen ? "rotate-180" : "",
              ].join(" ")}
              strokeWidth={1.75}
            />
          </button>

          <AnimatedPopover
            open={matterMenuOpen}
            className="absolute left-0 mt-2 w-[420px] rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-2 shadow-[var(--shadow-popup)]"
          >
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-[color:var(--chat-outline-accent)] bg-violet-50 px-2 py-2 focus-within:ring-2 focus-within:ring-violet-300/70">
                <Search className="h-4 w-4 text-neutral-500" strokeWidth={1.75} />
                <input
                  type="text"
                  value={matterQuery}
                  onChange={(event) => setMatterQuery(event.target.value)}
                  placeholder="Search matters"
                  className="w-full bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
                />
              </div>

              <div className="max-h-56 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMatter(null);
                    setMatterMenuOpen(false);
                    setMatterQuery("");
                  }}
                  className={[
                    "mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-body-md-secondary",
                    selectedMatter === null
                      ? "bg-violet-100 text-neutral-950"
                      : "text-neutral-700 hover:bg-violet-50 hover:text-neutral-950",
                  ].join(" ")}
                >
                  <span className="truncate">No matter</span>
                  {selectedMatter === null ? (
                    <Check className="ml-auto h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2} />
                  ) : null}
                </button>

                {filteredMatters.length > 0 ? (
                  filteredMatters.map((matter) => (
                    <button
                      key={matter}
                      type="button"
                      onClick={() => {
                        setSelectedMatter(matter);
                        setMatterMenuOpen(false);
                        setMatterQuery("");
                      }}
                      className={[
                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-body-md-secondary",
                        selectedMatter === matter
                          ? "bg-violet-100 text-neutral-950"
                          : "text-neutral-700 hover:bg-violet-50 hover:text-neutral-950",
                      ].join(" ")}
                    >
                      <span className="truncate">{matter}</span>
                      {selectedMatter === matter ? (
                        <Check className="ml-auto h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2} />
                      ) : null}
                    </button>
                  ))
                ) : (
                  <p className="px-2 py-2 text-[12px] leading-4 text-neutral-600">
                    No matters found.
                  </p>
                )}
              </div>
          </AnimatedPopover>
        </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
      {!chatStarted ? (
        <motion.div
          key="chat-empty"
          {...uiFadeSlide(reduceMotion, { enterY: 8, exitY: -10 })}
          transition={uiMotionTransition(reduceMotion, 0.22)}
          className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto"
        >
        <div className="mx-auto w-full max-w-3xl pb-16">
          <div className="flex flex-col items-center gap-12 px-0">
            <div className="flex items-center justify-center gap-3">
              <Image
                src="/lexee-symbol.svg"
                alt="Lexee"
                width={32}
                height={32}
                priority
              />
              <h1 className="select-none font-spectral text-[36px] leading-none tracking-[-0.02em] text-neutral-950">
                Good Evening Matt!
              </h1>
            </div>

            <div className="flex w-full max-w-2xl flex-col">
              <AnimatePresence initial={false}>
                {selectedMatter ? (
                  <motion.div
                    key="matter-strip-empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={uiMotionTransition(reduceMotion, 0.2)}
                    className="rounded-t-xl border border-b-0 border-[color:var(--chat-outline-accent)] bg-violet-50 px-3 py-2"
                  >
                    <p className="flex flex-wrap items-baseline gap-x-1 text-[12px] leading-4 text-neutral-800">
                      <span>Matter selected:</span>
                      <MatterTextCrossfade
                        text={selectedMatter}
                        className="text-neutral-950"
                      />
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div
                className={[
                  "rounded-xl border border-[color:var(--chat-outline)] bg-[var(--chatbox-bg)] px-3 py-2.5 shadow-[var(--shadow-subtle)] ui-t-layout",
                  selectedMatter ? "rounded-b-xl rounded-t-none border-t-0" : "",
                ].join(" ")}
              >
                <textarea
                  rows={1}
                  onInput={resizeTextarea}
                  onKeyDown={handleTextareaKeyDown}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type @ for case knowledge context"
                  className="w-full resize-none overflow-hidden bg-transparent text-body-lg text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
                />

                <div className="mt-1.5 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Add context"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--button-ghost-fg)] hover:bg-[var(--button-ghost-hover)] hover:text-[var(--foreground)]"
                  >
                    <Plus className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Voice input"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--button-ghost-fg)] hover:bg-[var(--button-ghost-hover)] hover:text-[var(--foreground)]"
                    >
                      <Mic className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    </button>

                    <button
                      type="button"
                      aria-label="Send message"
                      onClick={() => {
                        void sendMessage();
                      }}
                      disabled={isSendDisabled}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--button-primary-disabled-bg)] disabled:text-[var(--button-primary-disabled-fg)] disabled:hover:bg-[var(--button-primary-disabled-bg)]"
                    >
                      <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>

              {!selectedMatter ? (
                <div className="mt-8 rounded-xl border border-[color:var(--chat-outline-accent)] bg-violet-50/70 p-3 shadow-[var(--shadow-card)]">
                  <p className="text-[12px] leading-4 text-neutral-700">
                    Search and select a matter here, or prompt directly in chat and we will infer the matter context.
                  </p>

                  <div className="relative mt-2" ref={inlineMatterMenuRef}>
                    <div className="flex items-center gap-2 rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 px-2 py-2 focus-within:ring-2 focus-within:ring-violet-300/70">
                      <Search className="h-4 w-4 text-neutral-500" strokeWidth={1.75} />
                      <input
                        type="text"
                        value={inlineMatterQuery}
                        onChange={(event) => {
                          setInlineMatterQuery(event.target.value);
                          setInlineMatterMenuOpen(true);
                        }}
                        onFocus={() => setInlineMatterMenuOpen(true)}
                        placeholder="Search and select matter"
                        className="w-full bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
                      />
                    </div>

                    <AnimatedPopover
                      open={inlineMatterMenuOpen}
                      className="absolute bottom-full left-0 z-30 mb-2 w-full rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-2 shadow-[var(--shadow-popup)]"
                    >
                        <div className="max-h-48 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMatter(null);
                              setInlineMatterQuery("");
                              setInlineMatterMenuOpen(false);
                            }}
                            className={[
                              "mb-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-body-md-secondary",
                              selectedMatter === null
                                ? "bg-violet-100 text-neutral-950"
                                : "text-neutral-700 hover:bg-violet-50 hover:text-neutral-950",
                            ].join(" ")}
                          >
                            <span className="truncate">No matter</span>
                            {selectedMatter === null ? (
                              <Check className="ml-auto h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2} />
                            ) : null}
                          </button>

                          {inlineFilteredMatters.length > 0 ? (
                            inlineFilteredMatters.map((matter) => (
                              <button
                                key={matter}
                                type="button"
                                onClick={() => {
                                  setSelectedMatter(matter);
                                  setInlineMatterQuery("");
                                  setInlineMatterMenuOpen(false);
                                }}
                                className={[
                                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-body-md-secondary",
                                  selectedMatter === matter
                                    ? "bg-violet-100 text-neutral-950"
                                    : "text-neutral-700 hover:bg-violet-50 hover:text-neutral-950",
                                ].join(" ")}
                              >
                                <span className="truncate">{matter}</span>
                                {selectedMatter === matter ? (
                                  <Check className="ml-auto h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2} />
                                ) : null}
                              </button>
                            ))
                          ) : (
                            <p className="px-2 py-2 text-[12px] leading-4 text-neutral-600">No matters found.</p>
                          )}
                        </div>
                    </AnimatedPopover>
                  </div>
                </div>
              ) : null}
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
          <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-3 px-4 pb-4 pt-10">
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
                        className="flex min-w-0 flex-1 items-center justify-between rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 px-4 py-3 text-left ui-t-colors hover:border-[color:var(--chat-outline-accent)] hover:bg-violet-50"
                      >
                        <span className="text-body-md font-medium text-neutral-950">Summons</span>
                        <span className="inline-flex items-center rounded-full border border-[color:var(--chat-outline-accent)] bg-violet-50 px-2 py-1 text-[11px] font-medium leading-4 text-violet-700">
                          MVA
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSummonsCategorySelect("Slip and Fall")}
                        className="flex min-w-0 flex-1 items-center justify-between rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 px-4 py-3 text-left ui-t-colors hover:border-[color:var(--chat-outline-accent)] hover:bg-violet-50"
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
                                editable: true,
                                isLexeeGenerated: true,
                              }),
                            ],
                            "Summons document",
                            "Generated draft",
                          )
                        }
                        className="mt-3 w-full rounded-xl border border-[color:var(--chat-outline)] p-3 text-left ui-t-colors hover:border-[color:var(--chat-outline-accent)]"
                      >
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-violet-700">
                            <FileText className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="flex min-w-0 items-baseline gap-x-1 text-body-md font-medium text-neutral-950">
                              <span className="shrink-0">Summons for</span>
                              <span className="min-w-0 flex-1 overflow-hidden">
                                <MatterTextCrossfade
                                  display="block"
                                  text={selectedMatter ?? "this matter"}
                                  className="truncate font-medium text-neutral-950"
                                />
                              </span>
                            </p>
                            <p className="mt-0.5 text-[12px] leading-4 text-neutral-600">PDF Document</p>
                          </div>
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
            <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col">
            <AnimatePresence initial={false}>
              {selectedMatter ? (
                <motion.div
                  key="matter-strip-chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={uiMotionTransition(reduceMotion, 0.2)}
                  className="rounded-t-xl border border-b-0 border-[color:var(--chat-outline-accent)] bg-violet-50 px-3 py-2"
                >
                  <p className="flex flex-wrap items-baseline gap-x-1 text-[12px] leading-4 text-neutral-800">
                    <span>Matter selected:</span>
                    <MatterTextCrossfade
                      text={selectedMatter}
                      className="text-neutral-950"
                    />
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div
              className={[
                "rounded-xl border border-[color:var(--chat-outline)] bg-[var(--chatbox-bg)] px-3 py-2.5 shadow-[var(--shadow-subtle)] ui-t-layout",
                selectedMatter ? "rounded-b-xl rounded-t-none border-t-0" : "",
              ].join(" ")}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                onInput={resizeTextarea}
                onKeyDown={handleTextareaKeyDown}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Type @ for case knowledge context"
                className="w-full resize-none overflow-hidden bg-transparent text-body-lg text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
              />

              <div className="mt-1.5 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Add context"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--button-ghost-fg)] hover:bg-[var(--button-ghost-hover)] hover:text-[var(--foreground)]"
                >
                  <Plus className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Voice input"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--button-ghost-fg)] hover:bg-[var(--button-ghost-hover)] hover:text-[var(--foreground)]"
                  >
                    <Mic className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </button>

                  <button
                    type="button"
                    aria-label="Send message"
                    onClick={() => {
                      void sendMessage();
                    }}
                    disabled={isSendDisabled}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--button-primary-disabled-bg)] disabled:text-[var(--button-primary-disabled-fg)] disabled:hover:bg-[var(--button-primary-disabled-bg)]"
                  >
                    <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
            </div>
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
