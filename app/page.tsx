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
import type { FormEvent, KeyboardEvent } from "react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { MedicalSummaryDemoResponse } from "@/components/MedicalSummaryDemoResponse";
import { DocumentPreviewPanel, type DocumentPreview } from "@/components/DocumentPreviewPanel";
import { SAMPLE_DOCUMENT_PREVIEW } from "@/lib/sample-document-preview";
import {
  GENERATION_PHASES,
  type GenerationProgress,
  runGenerationPhases,
} from "@/lib/generation-phases";
import {
  MEDICAL_SUMMARY_SKILL_ID,
  MEDICAL_SUMMARY_DEMO_PROMPT,
  MEDICAL_SUMMARY_DEMO_MATTER,
  SUMMONS_DEMO_PROMPT,
  SUMMONS_DEMO_RESPONSE,
  SUMMONS_SKILL_ID,
  shouldUseMedicalSummaryDemoResponse,
} from "@/lib/skill-launches";
import { buildLlmTurns, fetchLlmChatReply } from "@/lib/llm-chat-client";
import { getResponse } from "@/lib/responses";

const MATTERS = [
  "Murdock v. Metro Health",
  "People v. N. Castle Holdings",
  "State Bar Compliance - Q2",
  "Acme Insurance Intake",
  "Nelson & Murdock Retainer Draft",
  MEDICAL_SUMMARY_DEMO_MATTER,
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  presentation?:
    | "medical_summary_demo"
    | "summons_document_demo"
    | "summons_skill_cards"
    | "summons_additional_instructions";
};

type SummonsCategory = "MVA" | "Slip and Fall";

const DUMMY_HISTORY_CONVERSATION: ChatMessage[] = [
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
];

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showThinkingGif, setShowThinkingGif] = useState(true);
  const [selectedMatter, setSelectedMatter] = useState<string | null>(null);
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

  const isSummonsRequestPrompt = (prompt: string) => {
    const normalized = normalisePrompt(prompt);
    return (
      normalized === "i want to create a summons document for this matter" ||
      normalized === "create a summons document for this matter"
    );
  };

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

  useEffect(() => {
    const resetChat = () => {
      generationAbortRef.current?.abort();
      generationAbortRef.current = null;
      setMessage("");
      setMessages([]);
      setIsGenerating(false);
      setGenerationProgress(null);
      setSelectedMatter(null);
      setMatterMenuOpen(false);
      setMatterQuery("");
      setInlineMatterMenuOpen(false);
      setInlineMatterQuery("");
    };

    window.addEventListener("lexee:new-chat", resetChat);
    return () => {
      window.removeEventListener("lexee:new-chat", resetChat);
    };
  }, []);

  useEffect(() => {
    const loadHistoryConversation = () => {
      generationAbortRef.current?.abort();
      generationAbortRef.current = null;
      setMessage("");
      setMessages(DUMMY_HISTORY_CONVERSATION);
      setIsGenerating(false);
      setGenerationProgress(null);
      setSelectedMatter(MEDICAL_SUMMARY_DEMO_MATTER);
      setMatterMenuOpen(false);
      setMatterQuery("");
      setInlineMatterMenuOpen(false);
      setInlineMatterQuery("");
      setDocumentPreviewOpen(false);
      setDocumentCollection([]);
      setDocumentActiveIndex(0);
      setDocumentCollectionTitle(undefined);
      setDocumentCollectionSubtitle(undefined);
    };

    const pendingConversation = window.sessionStorage.getItem("lexee:pending-history-conversation");
    if (pendingConversation === "medical-summary-demo") {
      loadHistoryConversation();
      window.sessionStorage.removeItem("lexee:pending-history-conversation");
    }

    const handleHistoryConversationOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ conversationId?: string }>;
      if (customEvent.detail?.conversationId !== "medical-summary-demo") return;
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
      setSelectedMatter(isMedicalSummaryLaunch ? MEDICAL_SUMMARY_DEMO_MATTER : null);
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
                content: SUMMONS_DEMO_RESPONSE,
                presentation: "summons_additional_instructions" as const,
              }
            : {
                id: `launch-assistant-${Date.now()}`,
                role: "assistant" as const,
                content: "",
                presentation: "medical_summary_demo" as const,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, generationProgress]);

  const isSendDisabled = message.trim().length === 0 || isGenerating;

  const sendMessage = async (contentOverride?: string) => {
    const trimmed = (contentOverride ?? message).trim();
    if (!trimmed) return;

    generationAbortRef.current?.abort();
    const ac = new AbortController();
    generationAbortRef.current = ac;

    if (shouldUseMedicalSummaryDemoResponse(trimmed)) {
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
    const useMedicalSummaryDemo = shouldUseMedicalSummaryDemoResponse(trimmed);
    const useSummonsSkillCards = isSummonsRequestPrompt(trimmed);
    const latestAssistantMessage = [...messages].reverse().find((msg) => msg.role === "assistant");
    const useSummonsDocumentDemo =
      normalized === "no" && latestAssistantMessage?.presentation === "summons_additional_instructions";
    const useDevLlm = process.env.NEXT_PUBLIC_USE_LLM_CHAT === "true";

    let assistantReply: string;
    let presentation: ChatMessage["presentation"] | undefined;

    if (useSummonsDocumentDemo) {
      assistantReply = "Here is your Summons document";
      presentation = "summons_document_demo";
    } else if (useSummonsSkillCards) {
      assistantReply =
        "Absolutely — I can help with that. Please choose a Summons skill category:";
      presentation = "summons_skill_cards";
    } else if (useMedicalSummaryDemo) {
      assistantReply = "";
      presentation = "medical_summary_demo";
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
    openDocumentPreview([{ ...SAMPLE_DOCUMENT_PREVIEW }], "Citation document", "Source document");
  };

  const chatStarted = messages.length > 0;

  return (
    <div className="flex min-h-full w-full flex-1 bg-[var(--background)]">
      <div className="flex min-h-full min-w-0 flex-1 flex-col pl-4 pr-6">
        <div
        ref={matterMenuRef}
        className={[
          "sticky top-0 z-20 flex w-full shrink-0 justify-start bg-[var(--background)]",
          chatStarted ? "border-b border-neutral-200 pb-3 pt-3" : "pb-8 pt-2",
        ].join(" ")}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setMatterMenuOpen((open) => !open)}
            className="inline-flex max-w-[420px] items-center gap-2 rounded-md px-1 py-1 text-left text-body-md text-neutral-800 hover:bg-violet-50 hover:text-neutral-950"
            aria-label="Select matter"
          >
            <span className="truncate">{selectedMatter ?? "No matter selected"}</span>
            <ChevronDown
              className={[
                "h-4 w-4 shrink-0 text-neutral-700 transition-transform",
                matterMenuOpen ? "rotate-180" : "",
              ].join(" ")}
              strokeWidth={1.75}
            />
          </button>

          {matterMenuOpen ? (
            <div className="absolute left-0 mt-2 w-[420px] rounded-xl border border-violet-200 bg-neutral-50 p-2 shadow-[0_12px_28px_rgba(40,38,64,0.18)]">
              <div className="mb-2 flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-2 py-2 focus-within:ring-2 focus-within:ring-violet-300/70">
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
            </div>
          ) : null}
        </div>
        </div>

      {!chatStarted ? (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center pb-16 pt-10">
          <div className="flex flex-col items-center gap-12 px-0">
            <div className="flex items-center justify-center gap-3">
              <Image
                src="/lexee-symbol.svg"
                alt="Lexee"
                width={32}
                height={32}
                priority
              />
              <h1 className="font-spectral text-[36px] leading-none tracking-[-0.02em] text-neutral-950">
                Good Evening Matt!
              </h1>
            </div>

            <div className="w-full max-w-2xl space-y-0">
              {selectedMatter ? (
                <div className="rounded-t-xl border border-b-0 border-violet-200 bg-violet-50 px-3 py-2">
                  <p className="text-[12px] leading-4 text-neutral-800">
                    Matter selected: <span className="text-neutral-950">{selectedMatter}</span>
                  </p>
                </div>
              ) : null}

              <div
                className={[
                  "rounded-xl border border-neutral-200/80 bg-[var(--chatbox-bg)] px-3 py-2.5 shadow-sm",
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
                <div className="mt-12 rounded-xl border border-violet-200/80 bg-violet-50/70 p-3 shadow-[0_1px_2px_rgba(40,38,64,0.10)]">
                  <p className="text-[12px] leading-4 text-neutral-700">
                    Search and select a matter here, or prompt directly in chat and we will infer the matter context.
                  </p>

                  <div className="relative mt-2" ref={inlineMatterMenuRef}>
                    <div className="flex items-center gap-2 rounded-lg border border-violet-300/70 bg-neutral-50 px-2 py-2 focus-within:ring-2 focus-within:ring-violet-300/70">
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

                    {inlineMatterMenuOpen ? (
                      <div className="absolute bottom-full left-0 z-30 mb-2 w-full rounded-xl border border-violet-200 bg-neutral-50 p-2 shadow-[0_12px_28px_rgba(40,38,64,0.18)]">
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
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col pt-10">
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 pb-4 pt-2">
            {messages.map((chatMessage, messageIndex) =>
                chatMessage.role === "user" ? (
                  <div key={chatMessage.id} className="ml-auto max-w-[80%]">
                    <div className="ml-auto w-fit rounded-[6px] bg-neutral-200 px-[10px] py-1">
                      <p className="text-body-lg text-neutral-950">{chatMessage.content}</p>
                    </div>
                    <div className="mt-1 flex items-center justify-end gap-1 text-neutral-500">
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
                  <div key={chatMessage.id} className="group max-w-[90%]">
                    <MedicalSummaryDemoResponse
                      onCitationClick={openMedicalSummaryCitationPreview}
                      onSourcesClick={openDocumentPreview}
                    />
                    <div
                      className={[
                        "mt-2 flex h-6 items-center gap-1 text-neutral-500 transition-opacity",
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
                  </div>
                ) : chatMessage.presentation === "summons_skill_cards" ? (
                  <div key={chatMessage.id} className="group max-w-[90%]">
                    <p className="whitespace-pre-wrap text-response-md text-neutral-950">{chatMessage.content}</p>
                    <div className="mt-3 flex w-full gap-2">
                      <button
                        type="button"
                        onClick={() => handleSummonsCategorySelect("MVA")}
                        className="flex min-w-0 flex-1 items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition-colors hover:border-violet-300 hover:bg-violet-50"
                      >
                        <span className="text-body-md font-medium text-neutral-950">Summons</span>
                        <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-medium leading-4 text-violet-700">
                          MVA
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSummonsCategorySelect("Slip and Fall")}
                        className="flex min-w-0 flex-1 items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition-colors hover:border-violet-300 hover:bg-violet-50"
                      >
                        <span className="text-body-md font-medium text-neutral-950">Summons</span>
                        <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-medium leading-4 text-violet-700">
                          Slip and Fall
                        </span>
                      </button>
                    </div>
                    <div
                      className={[
                        "mt-1 flex h-6 items-center gap-1 text-neutral-500 transition-opacity",
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
                  </div>
                ) : (
                  <div key={chatMessage.id} className="group max-w-[90%]">
                    <p className="whitespace-pre-wrap text-response-md text-neutral-950">{chatMessage.content}</p>
                    {chatMessage.presentation === "summons_document_demo" ? (
                      <button
                        type="button"
                        onClick={() =>
                          openDocumentPreview(
                            [{ ...SAMPLE_DOCUMENT_PREVIEW, editable: true, isLexeeGenerated: true }],
                            "Summons document",
                            "Generated draft",
                          )
                        }
                        className="mt-3 w-full rounded-xl border border-neutral-200 p-3 text-left transition-colors hover:border-violet-300"
                      >
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-violet-700">
                            <FileText className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-body-md font-medium text-neutral-950">
                              Summons for {selectedMatter ?? "this matter"}
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
                        "mt-1 flex h-6 items-center gap-1 text-neutral-500 transition-opacity",
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
                  </div>
                ),
            )}
            {messages.length > 0 ? (
              <div className="mt-3">
                <Image
                  src="/lexee-symbol.svg"
                  alt="Lexee"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </div>
            ) : null}
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

          <div className="sticky bottom-0 z-10 shrink-0 border-t border-neutral-200/50 bg-[var(--background)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
            <div className="mx-auto w-full max-w-2xl space-y-0">
            {selectedMatter ? (
              <div className="rounded-t-xl border border-b-0 border-violet-200 bg-violet-50 px-3 py-2">
                <p className="text-[12px] leading-4 text-neutral-800">
                  Matter selected: <span className="text-neutral-950">{selectedMatter}</span>
                </p>
              </div>
            ) : null}

            <div
              className={[
                "rounded-xl border border-neutral-200/80 bg-[var(--chatbox-bg)] px-3 py-2.5 shadow-sm",
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
          </div>
        </div>
      )}
      </div>

      {documentPreviewOpen ? (
        <DocumentPreviewPanel
          open={documentPreviewOpen}
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
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Suspense fallback={null}>
        <HomeInner />
      </Suspense>
    </div>
  );
}
