"use client";

import { ArrowUp, Check, ChevronDown, MessageSquareHeart, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedPopover } from "@/components/AnimatedPopover";
import { uiFadeSlide, uiMotionTransition } from "@/lib/ui-motion";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type FeedbackConversation = {
  id: string;
  title: string;
  updatedAtLabel: string;
  messages: ChatMessage[];
};

const SAMPLE_CONVERSATIONS: FeedbackConversation[] = [
  {
    id: "voice-mobile",
    title: "Voice input is hard to use on mobile",
    updatedAtLabel: "2 days ago",
    messages: [
      {
        id: "voice-user-1",
        role: "user",
        content: "Voice input is hard to use on mobile — the mic is easy to miss.",
      },
      {
        id: "voice-assistant-1",
        role: "assistant",
        content:
          "Thanks for sharing that with us. We've logged it for the product team. Anything else you'd like us to know — a workflow that's painful, a feature you rely on, or something you wish existed?",
      },
    ],
  },
  {
    id: "rerun-skill",
    title: "Wish I could rerun a skill on a new matter",
    updatedAtLabel: "Last week",
    messages: [
      {
        id: "skill-user-1",
        role: "user",
        content: "I wish I could rerun a skill on a new matter without starting over.",
      },
      {
        id: "skill-assistant-1",
        role: "assistant",
        content:
          "Thanks for sharing that with us. We've logged it for the product team. Anything else you'd like us to know — a workflow that's painful, a feature you rely on, or something you wish existed?",
      },
    ],
  },
  {
    id: "citation-pdf",
    title: "Citations sometimes point to the wrong PDF",
    updatedAtLabel: "Last week",
    messages: [
      {
        id: "cite-user-1",
        role: "user",
        content: "Citations sometimes open the wrong PDF page.",
      },
      {
        id: "cite-assistant-1",
        role: "assistant",
        content:
          "Thanks for sharing that with us. We've logged it for the product team. Anything else you'd like us to know — a workflow that's painful, a feature you rely on, or something you wish existed?",
      },
    ],
  },
];

function getProductTeamReply(prompt: string): string {
  const normalized = prompt
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?.!,]+$/g, "");

  if (normalized === "hi" || normalized === "hello" || normalized === "hey") {
    return "Hi — thanks for writing in. This chat goes straight to the product team. What's working for you in Lexee, and what do you wish it could do?";
  }

  return "Thanks for sharing that with us. We've logged it for the product team. Anything else you'd like us to know — a workflow that's painful, a feature you rely on, or something you wish existed?";
}

function titleFromPrompt(prompt: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 48).trim()}…`;
}

function FeedbackComposer({
  value,
  onChange,
  onSend,
  disabled,
  textareaRef,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const resizeTextarea = (event: FormEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;
    target.style.height = "0px";
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="rounded-2xl border border-[color:var(--chat-outline)] bg-[var(--chatbox-bg)] px-3 py-2.5 shadow-[var(--shadow-chatbox)] ui-t-layout">
        <textarea
          ref={textareaRef}
          rows={1}
          onInput={resizeTextarea}
          onKeyDown={handleKeyDown}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Share your feedback"
          className="w-full resize-none overflow-hidden bg-transparent text-body-lg text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
        />

        <div className="mt-1.5 flex items-center justify-end">
          <button
            type="button"
            aria-label="Send feedback"
            onClick={onSend}
            disabled={disabled}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--button-primary-bg)] text-[var(--button-primary-fg)] hover:bg-[var(--button-primary-hover)] disabled:cursor-not-allowed disabled:bg-[var(--button-primary-disabled-bg)] disabled:text-[var(--button-primary-disabled-fg)] disabled:hover:bg-[var(--button-primary-disabled-bg)]"
          >
            <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>
      </div>
      <p className="mt-2 text-center text-caption select-none">
        This goes straight to the product team
      </p>
    </div>
  );
}

function FeedbackHistoryDropdown({
  conversations,
  activeId,
  onSelectNew,
  onSelectConversation,
}: {
  conversations: FeedbackConversation[];
  activeId: string | null;
  onSelectNew: () => void;
  onSelectConversation: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const activeConversation = conversations.find((conversation) => conversation.id === activeId);
  const triggerLabel = activeConversation?.title ?? "New feedback";

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-w-0 max-w-[320px] items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-neutral-800 ui-t-colors hover:bg-violet-50 hover:text-neutral-950"
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="min-w-0 truncate text-body-md">{triggerLabel}</span>
        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 text-neutral-700 ui-t-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          strokeWidth={1.75}
        />
      </button>

      <AnimatedPopover
        open={open}
        className="absolute left-0 z-50 mt-2 w-[320px] rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-2 shadow-[var(--shadow-popup)]"
      >
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onSelectNew();
            setOpen(false);
          }}
          className={[
            "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-body-md-secondary",
            activeId === null
              ? "bg-violet-100 text-neutral-950"
              : "text-neutral-700 hover:bg-violet-50 hover:text-neutral-950",
          ].join(" ")}
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="min-w-0 flex-1 truncate">New feedback</span>
          {activeId === null ? (
            <Check className="ml-auto h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2} />
          ) : null}
        </button>

        <div className="my-1.5 h-px bg-neutral-200" role="presentation" />

        <div className="max-h-56 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conversation) => {
              const isActive = conversation.id === activeId;
              return (
                <button
                  key={conversation.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSelectConversation(conversation.id);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left",
                    isActive
                      ? "bg-violet-100 text-neutral-950"
                      : "text-neutral-700 hover:bg-violet-50 hover:text-neutral-950",
                  ].join(" ")}
                >
                  <span className="min-w-0 flex-1 overflow-hidden">
                    <span className="block truncate text-body-md-secondary">{conversation.title}</span>
                    <span className="mt-0.5 block truncate text-[12px] leading-4 text-neutral-500">
                      {conversation.updatedAtLabel}
                    </span>
                  </span>
                  {isActive ? (
                    <Check className="ml-auto h-4 w-4 shrink-0 text-neutral-700" strokeWidth={2} />
                  ) : null}
                </button>
              );
            })
          ) : (
            <p className="px-2 py-2 text-[12px] leading-4 text-neutral-600">No conversations yet.</p>
          )}
        </div>
      </AnimatedPopover>
    </div>
  );
}

export default function FeedbackPage() {
  const reduceMotion = useReducedMotion();
  const [draft, setDraft] = useState("");
  const [conversations, setConversations] = useState<FeedbackConversation[]>(SAMPLE_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const sendTimeoutRef = useRef<number | null>(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [conversations, activeId],
  );
  const messages = activeConversation?.messages ?? [];
  const chatStarted = messages.length > 0;
  const isSendDisabled = draft.trim().length === 0 || isSending;

  useEffect(() => {
    return () => {
      if (sendTimeoutRef.current !== null) {
        window.clearTimeout(sendTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!chatStarted) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [chatStarted, messages.length, isSending, reduceMotion]);

  const startNewConversation = () => {
    if (sendTimeoutRef.current !== null) {
      window.clearTimeout(sendTimeoutRef.current);
      sendTimeoutRef.current = null;
    }
    setIsSending(false);
    setDraft("");
    setActiveId(null);
  };

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;

    setDraft("");
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmed,
    };

    let conversationId = activeId;
    if (!conversationId) {
      conversationId = `feedback-${Date.now()}`;
      const createdId = conversationId;
      setConversations((prev) => [
        {
          id: createdId,
          title: titleFromPrompt(trimmed),
          updatedAtLabel: "Just now",
          messages: [userMessage],
        },
        ...prev,
      ]);
      setActiveId(createdId);
    } else {
      const targetId = conversationId;
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === targetId
            ? {
                ...conversation,
                updatedAtLabel: "Just now",
                messages: [...conversation.messages, userMessage],
              }
            : conversation,
        ),
      );
    }

    setIsSending(true);
    if (sendTimeoutRef.current !== null) {
      window.clearTimeout(sendTimeoutRef.current);
    }
    const replyForId = conversationId;
    sendTimeoutRef.current = window.setTimeout(() => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === replyForId
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  {
                    id: `${Date.now()}-assistant`,
                    role: "assistant",
                    content: getProductTeamReply(trimmed),
                  },
                ],
              }
            : conversation,
        ),
      );
      setIsSending(false);
      sendTimeoutRef.current = null;
      queueMicrotask(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "0px";
        el.style.height = `${el.scrollHeight}px`;
        el.focus();
      });
    }, 420);
  };

  return (
    <div className="flex h-[100dvh] min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--background)]">
      <div className="z-20 flex w-full shrink-0 justify-start bg-[var(--background)] px-4 pt-2 pb-2">
        <FeedbackHistoryDropdown
          conversations={conversations}
          activeId={activeId}
          onSelectNew={startNewConversation}
          onSelectConversation={(id) => {
            if (sendTimeoutRef.current !== null) {
              window.clearTimeout(sendTimeoutRef.current);
              sendTimeoutRef.current = null;
            }
            setIsSending(false);
            setDraft("");
            setActiveId(id);
          }}
        />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!chatStarted ? (
          <motion.div
            key="feedback-empty"
            {...uiFadeSlide(reduceMotion, { enterY: 8, exitY: -10 })}
            transition={uiMotionTransition(reduceMotion, 0.22)}
            className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto"
          >
            <div className="mx-auto w-full max-w-3xl px-4 pb-16">
              <div className="flex flex-col items-center gap-6">
                <div className="flex max-w-lg flex-col items-center">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100"
                    aria-hidden
                  >
                    <MessageSquareHeart
                      className="h-5 w-5 text-violet-600"
                      strokeWidth={1.5}
                    />
                  </span>
                  <h1 className="mt-4 text-center font-inter text-[24px] font-medium leading-8 tracking-[-0.02em] text-neutral-950">
                    Help us make Lexee better
                  </h1>
                  <p className="mt-2 text-center text-body-md-secondary">
                    Tell us how you&apos;re using Lexee, what&apos;s working,
                    <br />
                    and what you wish it could do.
                  </p>
                </div>

                <div className="flex w-full max-w-2xl flex-col">
                  <FeedbackComposer
                    value={draft}
                    onChange={setDraft}
                    onSend={sendMessage}
                    disabled={isSendDisabled}
                    textareaRef={textareaRef}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="feedback-active"
            {...uiFadeSlide(reduceMotion, { enterY: 14, exitY: 8 })}
            transition={uiMotionTransition(reduceMotion, 0.34)}
            className="flex min-h-0 w-full min-w-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-3 px-4 pb-4 pt-4">
                {messages.map((chatMessage) =>
                  chatMessage.role === "user" ? (
                    <div key={chatMessage.id} className="ml-auto max-w-[80%]">
                      <div className="ml-auto w-fit rounded-[6px] bg-neutral-200 px-[10px] py-1">
                        <p className="text-body-lg text-neutral-950">{chatMessage.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={chatMessage.id} className="max-w-[90%]">
                      <p className="whitespace-pre-wrap text-response-md text-neutral-950">
                        {chatMessage.content}
                      </p>
                    </div>
                  ),
                )}
                {isSending ? (
                  <p className="text-body-md-secondary" aria-live="polite">
                    The product team is reading…
                  </p>
                ) : null}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="z-10 w-full shrink-0 bg-[var(--background)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
              <div className="mx-auto w-full min-w-0 max-w-2xl">
                <FeedbackComposer
                  value={draft}
                  onChange={setDraft}
                  onSend={sendMessage}
                  disabled={isSendDisabled}
                  textareaRef={textareaRef}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
