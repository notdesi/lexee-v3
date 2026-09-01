"use client";

import { MoreVertical, Pin, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent, KeyboardEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatedPanel } from "@/components/AnimatedPanel";
import { AnimatedPopover } from "@/components/AnimatedPopover";
import { CaseBreadcrumb } from "@/components/CaseBreadcrumb";
import { CaseChatClient } from "@/components/CaseChatClient";
import { ChatComposerInput } from "@/components/ChatComposerInput";
import { ChatDocumentsButton } from "@/components/ChatDocumentsButton";
import { DocumentPreviewPanel, type DocumentPreview } from "@/components/DocumentPreviewPanel";
import { useCaseWorkspace } from "@/hooks/useCaseWorkspace";
import { getMergedCaseChatsForCase } from "@/lib/case-chats";
import { getCaseChatHref } from "@/lib/case-chat-routes";
import { collectCaseGeneratedDocuments } from "@/lib/case-documents";
import { formatLastActivity, getCaseById } from "@/lib/cases";
import {
  createCaseChat,
  pinCase,
  unpinCase,
} from "@/lib/case-workspace";
import type { Skill } from "@/app/skills/skills-data";
import {
  isTaskCreationComposerTrigger,
  TASK_DEMO_PROMPT,
  type ComposerMode,
} from "@/lib/task-launches";

const CASE_CHAT_COMPOSER_CLASS =
  "flex min-h-[120px] w-full flex-col rounded-[20px] border border-[color:var(--chat-outline)] bg-[var(--chatbox-bg)] px-5 py-4 shadow-[var(--shadow-chatbox)] ui-t-layout";

const caseMenuItemClass =
  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-body-md-secondary text-neutral-700 ui-t-colors hover:bg-neutral-100 hover:text-neutral-950";

const caseMenuItemDangerClass =
  "flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-body-md-secondary text-red-600 ui-t-colors hover:bg-red-50 hover:text-red-700";

type CaseDetailClientProps = {
  caseId: string;
};

function CaseHeaderMenu({
  pinned,
  open,
  onOpenChange,
  onPin,
  onDelete,
}: {
  pinned: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="More options"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
      >
        <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
      </button>

      <AnimatedPopover
        open={open}
        className="absolute right-0 top-full z-50 mt-1.5 w-[11.5rem] overflow-hidden rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 p-1.5 shadow-[var(--shadow-popup)]"
      >
        <button
          type="button"
          role="menuitem"
          className={caseMenuItemClass}
          onClick={() => {
            onPin();
            onOpenChange(false);
          }}
        >
          <Pin
            className={[
              "h-[18px] w-[18px] shrink-0 text-neutral-950",
              pinned ? "fill-neutral-950" : "fill-none",
            ].join(" ")}
            strokeWidth={1.5}
          />
          {pinned ? "Unpin" : "Pin"}
        </button>
        <div className="my-1.5 h-px bg-neutral-200" role="presentation" />
        <button
          type="button"
          role="menuitem"
          className={caseMenuItemDangerClass}
          onClick={() => {
            onDelete();
            onOpenChange(false);
          }}
        >
          <Trash2 className="h-[18px] w-[18px] shrink-0 text-red-600" strokeWidth={1.5} />
          Delete
        </button>
      </AnimatedPopover>
    </div>
  );
}

export function CaseDetailClient({ caseId }: CaseDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChatId = searchParams.get("chat");
  const workspace = useCaseWorkspace();
  const caseRecord = useMemo(() => getCaseById(caseId), [caseId]);
  const recentChats = useMemo(() => {
    if (!caseRecord) return [];
    return getMergedCaseChatsForCase(caseRecord.id, workspace.chats);
  }, [caseRecord, workspace.chats]);
  const [message, setMessage] = useState("");
  const [composerMode, setComposerMode] = useState<ComposerMode | null>(null);
  const [composerSkill, setComposerSkill] = useState<Skill | null>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [documentCollection, setDocumentCollection] = useState<DocumentPreview[]>([]);
  const [documentActiveIndex, setDocumentActiveIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const caseDocuments = useMemo(() => {
    if (!caseRecord) return [];
    return collectCaseGeneratedDocuments(caseRecord.id, workspace.chats, caseRecord.name);
  }, [caseRecord, workspace.chats]);

  const isGeneratedDocumentsPanelOpen =
    documentPreviewOpen && documentCollection.length > 0;

  const openGeneratedDocumentsPanel = useCallback(() => {
    if (!caseDocuments.length) return;
    setDocumentCollection(caseDocuments);
    setDocumentActiveIndex(0);
    setDocumentPreviewOpen(true);
  }, [caseDocuments]);

  useEffect(() => {
    if (!documentPreviewOpen) return;
    window.dispatchEvent(new CustomEvent("lexee:right-panel-opened"));
  }, [documentPreviewOpen]);

  const isPinned = workspace.pinnedCases.some((entry) => entry.id === caseId);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const togglePin = () => {
    if (!caseRecord) return;
    if (isPinned) {
      unpinCase(caseId);
      return;
    }
    const result = pinCase({
      id: caseRecord.id,
      label: caseRecord.name,
      scope: caseRecord.scope,
    });
    if (!result.ok) {
      setNotice(result.message);
    }
  };

  if (activeChatId) {
    return <CaseChatClient caseId={caseId} chatId={activeChatId} />;
  }

  if (!caseRecord) {
    return (
      <div className="flex h-[100dvh] min-h-0 flex-1 flex-col overflow-hidden bg-[var(--background)] pl-4 pr-6">
        <div className="shrink-0 pt-2 pb-3">
          <Link
            href="/cases"
            className="text-body-md-secondary text-neutral-600 ui-t-colors hover:text-neutral-950"
          >
            Cases
          </Link>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-8">
          <p className="text-body-md text-neutral-600">This case could not be found.</p>
          <Link
            href="/cases"
            className="mt-4 inline-block text-body-md font-medium text-neutral-950 ui-t-colors hover:text-neutral-700"
          >
            Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  const canSendWithComposerTrigger = isTaskCreationComposerTrigger({
    mode: composerMode,
    skillId: composerSkill?.id ?? null,
  });
  const isSendDisabled = message.trim().length === 0 && !canSendWithComposerTrigger;

  const resizeTextarea = (event: FormEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;
    target.style.height = "0px";
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    const trimmed = message.trim();
    const effectiveContent =
      trimmed || (canSendWithComposerTrigger ? TASK_DEMO_PROMPT : "");
    if (!effectiveContent || !caseRecord) return;

    const composerModeAtSend = composerMode;
    const skillIdAtSend = composerSkill?.id ?? null;
    setComposerMode(null);
    setComposerSkill(null);

    const result = createCaseChat(caseId, caseRecord.name, effectiveContent, {
      composerMode: composerModeAtSend,
      skillId: skillIdAtSend,
    });
    if (!result.ok) {
      setNotice(result.message);
      return;
    }
    setMessage("");
    router.replace(getCaseChatHref(caseId, result.chat.id), { scroll: false });
  };

  return (
    <div className="flex h-[100dvh] min-h-0 w-full min-w-0 flex-1 flex-row overflow-hidden bg-[var(--background)]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pl-4 pr-6">
      {notice ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <p className="rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 px-4 py-2 text-body-md text-neutral-950 shadow-[var(--shadow-popup)]">
            {notice}
          </p>
        </div>
      ) : null}
      <header className="shrink-0 bg-[var(--background)] pt-2">
        <CaseBreadcrumb caseName={caseRecord.name} />
      </header>

      <div className="min-h-0 flex-1 flex flex-col overflow-y-auto pb-16">
        <div className="mx-auto w-full max-w-[620px] shrink-0 pt-16">
          <p className="text-caption text-neutral-600">{caseRecord.caseNumber}</p>

          <div className="mt-1 flex items-center justify-between gap-6">
            <h1 className="min-w-0 font-tiempos-text text-[32px] leading-none tracking-[-0.015em] text-neutral-950">
              {caseRecord.name}
            </h1>
            <div className="flex shrink-0 items-center gap-0.5">
              <ChatDocumentsButton
                count={caseDocuments.length}
                onClick={openGeneratedDocumentsPanel}
                active={isGeneratedDocumentsPanelOpen}
              />
              <button
                type="button"
                aria-label={isPinned ? "Unpin case" : "Pin case"}
                onClick={togglePin}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
              >
                <Pin
                  className={[
                    "h-4 w-4",
                    isPinned ? "fill-neutral-950 text-neutral-950" : "fill-none",
                  ].join(" ")}
                  strokeWidth={1.75}
                />
              </button>
              <CaseHeaderMenu
                pinned={isPinned}
                open={headerMenuOpen}
                onOpenChange={setHeaderMenuOpen}
                onPin={togglePin}
                onDelete={() => router.push("/cases")}
              />
            </div>
          </div>
        </div>

        <div className="flex-1" aria-hidden />

        <div className="mx-auto w-full max-w-[620px] shrink-0">
          <div className={CASE_CHAT_COMPOSER_CLASS}>
            <ChatComposerInput
              message={message}
              onMessageChange={setMessage}
              textareaRef={textareaRef}
              onInput={resizeTextarea}
              onKeyDown={handleTextareaKeyDown}
              onSend={sendMessage}
              sendDisabled={isSendDisabled}
              composerMode={composerMode}
              onComposerModeChange={setComposerMode}
              selectedSkill={composerSkill}
              onSkillSelect={setComposerSkill}
            />
          </div>

          <section className="mt-12 w-full">
            <h2 className="text-caption text-neutral-500">Recents</h2>

            {recentChats.length > 0 ? (
              <ul className="mt-2 divide-y divide-neutral-200">
                {recentChats.map((chat) => (
                  <li key={chat.id}>
                    <div className="group relative flex w-full items-center rounded-lg px-3 py-2.5 ui-t-colors hover:bg-neutral-200">
                      <button
                        type="button"
                        onClick={() => router.push(getCaseChatHref(caseId, chat.id))}
                        className="flex min-w-0 flex-1 items-center justify-between gap-4 pr-8 text-left"
                      >
                        <span className="min-w-0 truncate text-body-md text-neutral-950">
                          {chat.title}
                        </span>
                        <span className="shrink-0 text-caption text-neutral-500 group-hover:invisible">
                          {formatLastActivity(chat.lastActivityAt)}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label="More options"
                        className={[
                          "absolute right-3 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-600",
                          "opacity-0 ui-t-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                          "hover:text-neutral-950",
                          "focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-300",
                        ].join(" ")}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-body-md-secondary text-neutral-600">
                No chats yet. Start one above.
              </p>
            )}
          </section>
        </div>

        <div className="flex-1" aria-hidden />
      </div>
      </div>

      <AnimatedPanel open={documentPreviewOpen} className="shrink-0">
        {documentPreviewOpen ? (
          <DocumentPreviewPanel
            open
            documents={documentCollection}
            activeIndex={documentActiveIndex}
            collectionTitle="Generated documents"
            collectionSubtitle={`${documentCollection.length} document${documentCollection.length === 1 ? "" : "s"} in this case`}
            initialView="list"
            onSelect={setDocumentActiveIndex}
            onUpdateDocument={(index, next) =>
              setDocumentCollection((prev) => prev.map((doc, i) => (i === index ? next : doc)))
            }
            onClose={() => setDocumentPreviewOpen(false)}
          />
        ) : null}
      </AnimatedPanel>
    </div>
  );
}
