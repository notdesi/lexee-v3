"use client";

import Image from "next/image";
import {
  CheckCircle2,
  Download,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from "react";
import type { DocumentPreview } from "@/components/DocumentPreviewPanel";
import { SaveToCloudLexModal } from "@/components/SaveToCloudLexModal";
import { formatModShortcut, UiTooltip } from "@/components/UiTooltip";
import { getDocumentFormatStyle } from "@/lib/document-format";
import { UI_CARD_BASE, UI_T_COLORS } from "@/lib/ui-motion";

export type ChatGeneratedDocumentCardProps = {
  document: DocumentPreview;
  fileName?: string;
  showIntro?: boolean;
  onView?: () => void;
  onDownload?: () => void;
  onSave?: (payload?: {
    category: string;
    name: string;
    sendForExpertApproval: boolean;
  }) => void;
  onRegenerate?: () => void;
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

function DocumentFormatThumb() {
  return (
    <span
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2v6h6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 13h8M8 17h8M9 9h4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function ChatGeneratedDocumentCard({
  document,
  fileName,
  showIntro = true,
  onView,
  onDownload,
  onSave,
  onRegenerate,
  saved = false,
}: ChatGeneratedDocumentCardProps) {
  const format = document.format ?? "DOCX";
  const { label: formatLabel } = getDocumentFormatStyle(format);
  const displayFileName = fileName ?? document.title;
  const downloadHref = document.src;
  const cardRef = useRef<HTMLDivElement>(null);
  const [saveShortcut, setSaveShortcut] = useState("⌘S");
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  useEffect(() => {
    setSaveShortcut(formatModShortcut("S"));
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      const root = cardRef.current;
      if (!root || !root.contains(globalThis.document.activeElement)) return;
      if (saved) return;
      event.preventDefault();
      setSaveModalOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saved]);

  const stopCardActivation = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const handleCardKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!onView) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onView();
    }
  };

  return (
    <div className="mt-3 w-full">
      {showIntro ? (
        <p className="text-response-md text-neutral-950">
          Drafted <span className="font-medium">{document.title}.</span>
        </p>
      ) : null}

      <div
        ref={cardRef}
        role={onView ? "button" : undefined}
        tabIndex={onView ? 0 : undefined}
        onClick={onView}
        onKeyDown={handleCardKeyDown}
        className={[
          `p-3.5 text-left ${showIntro ? "mt-3" : ""} ${UI_CARD_BASE}`,
          onView
            ? `cursor-pointer ${UI_T_COLORS} hover:border-neutral-300`
            : "",
        ].join(" ")}
        aria-label={onView ? `Open ${displayFileName}` : undefined}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <DocumentFormatThumb />
            <div className="min-w-0">
              <p className="truncate text-body-md font-medium text-neutral-950">
                {displayFileName}
              </p>
              <p className="mt-0.5 text-[12px] leading-4 text-neutral-500">
                {formatLabel}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5" onClick={stopCardActivation}>
            <UiTooltip label="Regenerate">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRegenerate?.();
                }}
                className={iconButtonClassName}
                aria-label="Regenerate document"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
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
                  onClick={(event) => {
                    event.stopPropagation();
                    onDownload?.();
                  }}
                  className={iconButtonClassName}
                  aria-label="Download document"
                >
                  <Download className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                </button>
              )}
            </UiTooltip>
            <UiTooltip label={saved ? "Saved to CloudLex" : "Save and Expert Review"} shortcut={saved ? undefined : saveShortcut}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (!saved) setSaveModalOpen(true);
                }}
                disabled={saved}
                className={[
                  saveButtonClassName,
                  saved
                    ? "cursor-default border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                    : "",
                ].join(" ")}
                aria-label={saved ? "Saved to CloudLex" : `Save and Expert Review (${saveShortcut})`}
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
                {saved ? "Saved" : "Save and Expert Review"}
              </button>
            </UiTooltip>
          </div>
        </div>
      </div>

      <SaveToCloudLexModal
        open={saveModalOpen}
        documentName={displayFileName}
        onClose={() => setSaveModalOpen(false)}
        onSave={(payload) => {
          onSave?.(payload);
          setSaveModalOpen(false);
        }}
      />
    </div>
  );
}
