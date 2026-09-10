"use client";

import Image from "next/image";
import {
  CheckCircle2,
  Download,
  Eye,
  RotateCcw,
  UserRoundCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DocumentFormatBadge } from "@/components/DocumentFormatBadge";
import type { DocumentPreview } from "@/components/DocumentPreviewPanel";
import { formatModShortcut, UiTooltip } from "@/components/UiTooltip";
import { UI_CARD_BASE, UI_T_COLORS } from "@/lib/ui-motion";

export type ChatGeneratedDocumentCardProps = {
  document: DocumentPreview;
  fileName?: string;
  showIntro?: boolean;
  onView?: () => void;
  onDownload?: () => void;
  onSave?: () => void;
  onRegenerate?: () => void;
  onSendForApproval?: () => void;
  saved?: boolean;
};

const iconButtonClassName = [
  "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[color:var(--chat-outline)]",
  "bg-neutral-50 text-neutral-700",
  UI_T_COLORS,
  "hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950",
].join(" ");

const saveButtonClassName = [
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-[color:var(--chat-outline)]",
  "bg-neutral-50 px-2.5 text-[12.5px] font-medium text-neutral-700",
  UI_T_COLORS,
  "hover:border-neutral-300 hover:bg-neutral-100 hover:text-neutral-950",
].join(" ");

const approvalButtonClassName = [
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3",
  "bg-[var(--button-primary-bg)] text-[12.5px] font-medium text-[var(--button-primary-fg)]",
  UI_T_COLORS,
  "hover:bg-[var(--button-primary-hover)]",
].join(" ");

export function ChatGeneratedDocumentCard({
  document,
  fileName,
  showIntro = true,
  onView,
  onDownload,
  onSave,
  onRegenerate,
  onSendForApproval,
  saved = false,
}: ChatGeneratedDocumentCardProps) {
  const format = document.format ?? "DOCX";
  const displayFileName = fileName ?? document.title;
  const downloadHref = document.src;
  const cardRef = useRef<HTMLDivElement>(null);
  const [saveShortcut, setSaveShortcut] = useState("⌘S");

  useEffect(() => {
    setSaveShortcut(formatModShortcut("S"));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      const root = cardRef.current;
      if (!root || !root.contains(document.activeElement)) return;
      if (saved || !onSave) return;
      event.preventDefault();
      onSave();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave, saved]);

  return (
    <div className="mt-3 w-full max-w-2xl">
      {showIntro ? (
        <p className="text-response-md text-neutral-950">
          Drafted <span className="font-medium">{document.title}.</span>
        </p>
      ) : null}

      <div
        ref={cardRef}
        className={`p-3.5 ${showIntro ? "mt-3" : ""} ${UI_CARD_BASE}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-md font-medium text-neutral-950">
              {displayFileName}
            </p>
            <DocumentFormatBadge format={format} size="sm" showIcon className="mt-1.5" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <UiTooltip label="View">
              <button
                type="button"
                onClick={onView}
                className={iconButtonClassName}
                aria-label="View document"
              >
                <Eye className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </UiTooltip>
            <UiTooltip label="Regenerate">
              <button
                type="button"
                onClick={onRegenerate}
                className={iconButtonClassName}
                aria-label="Regenerate document"
              >
                <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
              </button>
            </UiTooltip>
            <UiTooltip label="Download">
              {downloadHref ? (
                <a
                  href={downloadHref}
                  download
                  onClick={(event) => {
                    event.stopPropagation();
                    onDownload?.();
                  }}
                  className={iconButtonClassName}
                  aria-label="Download document"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onDownload}
                  className={iconButtonClassName}
                  aria-label="Download document"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                </button>
              )}
            </UiTooltip>
            <UiTooltip label={saved ? "Saved to CloudLex" : "Save to CloudLex"} shortcut={saved ? undefined : saveShortcut}>
              <button
                type="button"
                onClick={onSave}
                disabled={saved}
                className={[
                  saveButtonClassName,
                  saved
                    ? "cursor-default border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                    : "",
                ].join(" ")}
                aria-label={saved ? "Saved to CloudLex" : `Save to CloudLex (${saveShortcut})`}
              >
                {saved ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Image
                    src="/cloudlex-logo.png"
                    alt=""
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 object-contain"
                    aria-hidden="true"
                  />
                )}
                {saved ? "Saved" : "Save"}
              </button>
            </UiTooltip>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onSendForApproval}
            className={approvalButtonClassName}
            aria-label="Send for expert approval"
          >
            <UserRoundCheck className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
            Send for expert approval
          </button>
        </div>
      </div>
    </div>
  );
}
