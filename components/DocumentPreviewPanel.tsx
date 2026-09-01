"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, Download, ExternalLink, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DocumentFormatBadge } from "@/components/DocumentFormatBadge";
import { inferDocumentFormat } from "@/lib/document-format";
import { UI_CARD_INTERACTIVE } from "@/lib/ui-motion";

export type DocumentPreview = {
  title: string;
  subtitle?: string;
  format?: string;
  body: string;
  src?: string;
  editable?: boolean;
  isLexeeGenerated?: boolean;
};

function DocumentPreviewMeta({
  doc,
  className,
}: {
  doc: DocumentPreview;
  className?: string;
}) {
  const format = doc.format ?? inferDocumentFormat(doc.subtitle);

  if (format) {
    return <DocumentFormatBadge format={format} size="sm" className={className} />;
  }

  if (!doc.subtitle) return null;

  return (
    <span className={["font-inter text-[11.5px] leading-4 text-neutral-500", className].join(" ")}>
      {doc.subtitle}
    </span>
  );
}

type DocumentPreviewPanelProps = {
  open: boolean;
  documents: DocumentPreview[];
  activeIndex: number;
  collectionTitle?: string;
  collectionSubtitle?: string;
  initialView?: "list" | "preview";
  onSelect: (index: number) => void;
  onUpdateDocument?: (index: number, next: DocumentPreview) => void;
  onClose: () => void;
};

export function DocumentPreviewPanel({
  open,
  documents,
  activeIndex,
  collectionTitle,
  collectionSubtitle,
  initialView,
  onSelect,
  onUpdateDocument,
  onClose,
}: DocumentPreviewPanelProps) {
  const documentSetKey = documents.map((d) => d.title).join("\u0000");
  const syncKey = `${open}:${documentSetKey}:${documents.length}`;
  const derivedViewDefault =
    initialView ?? (documents.length > 1 ? "list" : "preview");
  const [view, setView] = useState<"list" | "preview">(derivedViewDefault);
  const [lastSyncKey, setLastSyncKey] = useState(syncKey);

  if (syncKey !== lastSyncKey) {
    setLastSyncKey(syncKey);
    setView(derivedViewDefault);
  }

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const hasMultiple = documents.length > 1;
  const active = documents[activeIndex] ?? documents[0] ?? null;
  const showPreview = view === "preview";

  const widthClass = "w-[clamp(487px,45.24vw,661px)]";
  const canDownloadFromSrc = Boolean(active?.src);
  const canUploadToCloud = Boolean(active?.isLexeeGenerated);

  const eyebrowLabel = !showPreview
    ? collectionTitle ?? "Documents"
    : collectionTitle ?? "Document preview";
  const showEyebrow = collectionTitle !== "Sources";

  const handleDownloadTextDocument = () => {
    if (!active) return;
    const blob = new Blob([active.body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const fileNameBase = active.title.trim().replace(/\s+/g, "-").toLowerCase() || "document";
    anchor.href = url;
    anchor.download = `${fileNameBase}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <aside
      className={[
        "z-30 flex h-[100dvh] min-h-0 shrink-0 flex-col overflow-hidden border-l border-neutral-200 bg-[var(--background)]",
        widthClass,
      ].join(" ")}
    >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 bg-[var(--background)] px-3">
          {hasMultiple && showPreview ? (
            <button
              type="button"
              onClick={() => setView("list")}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
              aria-label="Back to document list"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
          ) : null}
          <div className="min-w-0 flex-1">
            {showEyebrow ? (
              <p className="truncate font-inter text-[11px] font-medium leading-4 text-neutral-500">
                {eyebrowLabel}
              </p>
            ) : null}
            <p className="truncate font-inter text-[14px] font-medium leading-5 text-neutral-950">
              {!showPreview ? "Select a document" : active?.title ?? "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
            aria-label="Close document preview"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-neutral-100">
          {!showPreview ? (
            <div className="h-full overflow-y-auto px-3 py-3">
              <ul className="space-y-1">
                {documents.map((doc, index) => (
                  <li key={`${doc.title}-${index}`}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(index);
                        setView("preview");
                      }}
                      className={`flex w-full flex-col px-3 py-2.5 text-left ${UI_CARD_INTERACTIVE}`}
                    >
                      {doc.subtitle || doc.format ? (
                        <DocumentPreviewMeta doc={doc} />
                      ) : null}
                      <span
                        className={[
                          "font-inter text-[13px] font-medium leading-5 text-neutral-950",
                          doc.subtitle || doc.format ? "mt-1.5" : "",
                        ].join(" ")}
                      >
                        {doc.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : active ? (
            active.src ? (
              <iframe
                key={`${active.src}-${activeIndex}`}
                src={`${active.src}#toolbar=0&navpanes=0&view=FitH`}
                title={active.title}
                className="h-full w-full border-0 bg-neutral-100"
              />
            ) : (
              <div className="h-full overflow-y-auto px-4 py-4">
                <article className="mx-auto w-full max-w-[640px] rounded-md border border-neutral-200 bg-[var(--surface-elevated)] px-8 py-8 shadow-[var(--shadow-card)]">
                  <header className="mb-5 border-b border-neutral-200 pb-4">
                    {active.subtitle || active.format ? (
                      <DocumentPreviewMeta doc={active} />
                    ) : null}
                    <h2
                      className={[
                        "font-inter text-[15px] font-semibold leading-5 tracking-[-0.01em] text-neutral-950",
                        active.subtitle || active.format ? "mt-2" : "",
                      ].join(" ")}
                    >
                      {active.title}
                    </h2>
                    {collectionSubtitle && !active.subtitle && !active.format ? (
                      <p className="mt-1 font-inter text-[11.5px] leading-4 text-neutral-500">
                        {collectionSubtitle}
                      </p>
                    ) : null}
                  </header>

                  {active.editable ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onInput={(event) =>
                        onUpdateDocument?.(activeIndex, {
                          ...active,
                          body: event.currentTarget.textContent ?? "",
                        })
                      }
                      className="min-h-[420px] w-full whitespace-pre-wrap font-inter text-[12.5px] leading-[1.65] text-neutral-900 focus:outline-none"
                      aria-label="Editable document content"
                    >
                      {active.body}
                    </div>
                  ) : (
                    <div className="space-y-3 font-inter text-[12.5px] leading-[1.65] text-neutral-900">
                      {active.body
                        .split("\n")
                        .filter((line) => line.length > 0)
                        .map((line, idx) => (
                          <p key={idx} className="whitespace-pre-wrap">
                            {line}
                          </p>
                        ))}
                    </div>
                  )}
                </article>
              </div>
            )
          ) : (
            <p className="px-4 py-4 font-inter text-[12.5px] leading-5 text-neutral-600">
              Select a citation to preview the supporting document.
            </p>
          )}
        </div>

        {showPreview && active ? (
          <div className="flex shrink-0 items-center justify-between border-t border-neutral-200 bg-[var(--background)] px-3 py-2">
            <div className="flex items-center gap-1">
              {canDownloadFromSrc ? (
                <a
                  href={active.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950"
                  aria-label="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                </a>
              ) : null}
              {canDownloadFromSrc ? (
                <a
                  href={active.src}
                  download
                  className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[12px] font-medium text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950"
                  aria-label="Download document"
                >
                  <Download className="h-4 w-4" strokeWidth={1.75} />
                  Download
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleDownloadTextDocument}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[12px] font-medium text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950"
                  aria-label="Download document"
                >
                  <Download className="h-4 w-4" strokeWidth={1.75} />
                  Download
                </button>
              )}
              {canUploadToCloud ? (
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[12px] font-medium text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950"
                  aria-label="Upload document to cloud"
                  title="Upload to cloud"
                >
                  <Upload className="h-4 w-4" strokeWidth={1.75} />
                  Upload to cloud
                </button>
              ) : null}
            </div>
            {hasMultiple ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelect(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous document"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <p className="font-inter text-[11.5px] leading-4 text-neutral-600">
                  {activeIndex + 1} / {documents.length}
                </p>
                <button
                  type="button"
                  onClick={() => onSelect(Math.min(documents.length - 1, activeIndex + 1))}
                  disabled={activeIndex === documents.length - 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next document"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
    </aside>
  );
}
