"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export type DocumentPreview = {
  title: string;
  subtitle?: string;
  body: string;
};

type DocumentPreviewPanelProps = {
  open: boolean;
  documents: DocumentPreview[];
  activeIndex: number;
  collectionTitle?: string;
  collectionSubtitle?: string;
  onSelect: (index: number) => void;
  onClose: () => void;
};

export function DocumentPreviewPanel({
  open,
  documents,
  activeIndex,
  collectionTitle,
  collectionSubtitle,
  onSelect,
  onClose,
}: DocumentPreviewPanelProps) {
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

  const widthClass = "w-[clamp(406px,37.7vw,551px)]";

  return (
    <div className={["relative shrink-0 self-start", widthClass].join(" ")} aria-hidden={!open}>
      <aside
        className={[
          "fixed right-0 top-0 z-30 flex h-[100dvh] flex-col overflow-hidden border-l border-neutral-200",
          open ? "bg-neutral-50" : "bg-[var(--background)]",
          widthClass,
        ].join(" ")}
      >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-4">
        <div className="min-w-0">
          <p className="truncate font-inter text-[12px] font-medium leading-4 text-neutral-600">
            {collectionTitle ?? "Document preview"}
          </p>
          {hasMultiple ? (
            <p className="truncate font-inter text-[11px] leading-4 text-neutral-500">
              {documents.length} documents
            </p>
          ) : (
            <p className="truncate font-inter text-[14px] font-medium leading-5 text-neutral-950">
              {active?.title ?? "—"}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
          aria-label="Close document preview"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
        {collectionSubtitle ? (
          <p className="mb-3 font-inter text-[12px] leading-4 text-neutral-600">{collectionSubtitle}</p>
        ) : null}

        {hasMultiple ? (
          <div className="mb-3 max-h-40 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2">
            <ul className="space-y-1">
              {documents.map((doc, index) => (
                <li key={`${doc.title}-${index}`}>
                  <button
                    type="button"
                    onClick={() => onSelect(index)}
                    className={[
                      "flex w-full items-start justify-between rounded-md px-2 py-1.5 text-left",
                      "hover:bg-neutral-100",
                      index === activeIndex ? "bg-neutral-100" : "",
                    ].join(" ")}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-inter text-[12px] font-medium leading-4 text-neutral-900">
                        {doc.title}
                      </span>
                      {doc.subtitle ? (
                        <span className="mt-0.5 block truncate font-inter text-[11px] leading-4 text-neutral-500">
                          {doc.subtitle}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {active ? (
            <pre className="whitespace-pre-wrap rounded-xl border border-neutral-200 bg-white p-4 font-inter text-[12.5px] leading-5 text-neutral-900">
              {active.body}
            </pre>
          ) : (
            <p className="font-inter text-[12.5px] leading-5 text-neutral-600">
              Select a citation to preview the supporting document.
            </p>
          )}
        </div>
      </div>
      </aside>
    </div>
  );
}

