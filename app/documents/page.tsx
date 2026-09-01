"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatedPanel } from "@/components/AnimatedPanel";
import { CaseFilterDropdown } from "@/components/CaseFilterDropdown";
import { DocumentFormatBadge } from "@/components/DocumentFormatBadge";
import { DocumentPreviewPanel, type DocumentPreview } from "@/components/DocumentPreviewPanel";
import { SegmentPillNav } from "@/components/SegmentPillNav";
import { getCaseById } from "@/lib/cases";
import {
  DOCUMENTS,
  countDocumentsByStatus,
  documentMatchesCaseFilter,
  documentRecordToPreview,
  formatDocumentActivity,
  type DocumentCaseFilter,
  type DocumentRecord,
  type DocumentStatus,
} from "@/lib/documents";
import { UI_CARD_INTERACTIVE } from "@/lib/ui-motion";

const STATUS_OPTIONS = [
  { value: "awaiting-review" as const, label: "Awaiting review" },
  { value: "approved" as const, label: "Approved" },
  { value: "rejected" as const, label: "Rejected" },
  { value: "superseded" as const, label: "Superseded" },
];

const EMPTY_STATUS_COPY: Record<DocumentStatus, string> = {
  "awaiting-review": "No documents awaiting review.",
  approved: "No approved documents.",
  rejected: "No rejected documents.",
  superseded: "No superseded documents.",
};

export default function DocumentsPage() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(true);
  const [status, setStatus] = useState<DocumentStatus>("awaiting-review");
  const [caseFilter, setCaseFilter] = useState<DocumentCaseFilter>("all");
  const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
  const [documentCollection, setDocumentCollection] = useState<DocumentPreview[]>([]);
  const [documentActiveIndex, setDocumentActiveIndex] = useState(0);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!documentPreviewOpen) return;
    window.dispatchEvent(new CustomEvent("lexee:right-panel-opened"));
  }, [documentPreviewOpen]);

  const clearSearch = () => {
    setQuery("");
    searchInputRef.current?.focus();
  };

  const statusCounts = useMemo(() => countDocumentsByStatus(DOCUMENTS), []);

  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((option) => ({
        ...option,
        count: statusCounts[option.value],
      })),
    [statusCounts],
  );

  const visibleDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return DOCUMENTS.filter((document) => {
      if (document.status !== status) return false;
      if (!documentMatchesCaseFilter(document, caseFilter)) return false;
      if (!normalized) return true;
      return (
        document.name.toLowerCase().includes(normalized) ||
        document.format.toLowerCase().includes(normalized)
      );
    });
  }, [query, status, caseFilter]);

  const emptyCopy = useMemo(() => {
    const base = EMPTY_STATUS_COPY[status].replace(/\.$/, "");
    if (caseFilter === "all") return `${base}.`;
    if (caseFilter === "unassigned") return `${base} without a case.`;
    return `${base} for ${getCaseById(caseFilter)?.name ?? "this case"}.`;
  }, [caseFilter, status]);

  const openDocument = useCallback((document: DocumentRecord) => {
    setSelectedDocumentId(document.id);
    setDocumentCollection([documentRecordToPreview(document)]);
    setDocumentActiveIndex(0);
    setDocumentPreviewOpen(true);
  }, []);

  const closeDocumentPreview = useCallback(() => {
    setDocumentPreviewOpen(false);
    setSelectedDocumentId(null);
  }, []);

  return (
    <div className="flex h-[100dvh] min-h-0 w-full min-w-0 flex-1 flex-row overflow-hidden bg-[var(--background)]">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto px-8 py-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-tiempos-text text-[32px] leading-none tracking-[-0.015em] text-neutral-950">
              Documents
            </h1>

            <div className="flex shrink-0 items-center gap-1">
              {searchOpen ? (
                <div className="flex h-9 w-[min(100vw-12rem,240px)] items-center gap-1.5 rounded-lg border border-[color:var(--chat-outline)] bg-neutral-50 px-2 shadow-[var(--shadow-subtle)] ui-t-layout">
                  <Search className="h-4 w-4 shrink-0 text-neutral-500" strokeWidth={1.75} />
                  <label htmlFor="documents-search" className="sr-only">
                    Search documents
                  </label>
                  <input
                    id="documents-search"
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape" && query) clearSearch();
                    }}
                    placeholder="Search documents"
                    className="min-w-0 flex-1 bg-transparent text-body-md text-neutral-950 placeholder:text-neutral-500 focus:outline-none"
                  />
                  {query ? (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={clearSearch}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-600 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
                    >
                      <X className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  ) : null}
                </div>
              ) : (
                <button
                  type="button"
                  aria-label="Search documents"
                  onClick={() => setSearchOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 ui-t-colors hover:bg-neutral-200/80 hover:text-neutral-950"
                >
                  <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <SegmentPillNav
              options={statusOptions}
              value={status}
              onChange={setStatus}
              ariaLabel="Document status"
            />
            <CaseFilterDropdown
              value={caseFilter}
              onChange={setCaseFilter}
              status={status}
            />
          </div>

          <div className="mt-8">
            {visibleDocuments.length > 0 ? (
              <ul className="grid grid-cols-2 gap-3">
                {visibleDocuments.map((document) => (
                  <li key={document.id}>
                    <button
                      type="button"
                      onClick={() => openDocument(document)}
                      className={[
                        `flex h-full w-full cursor-pointer flex-col px-4 py-4 text-left ${UI_CARD_INTERACTIVE}`,
                        selectedDocumentId === document.id && documentPreviewOpen
                          ? "border-neutral-300 bg-neutral-100"
                          : "",
                      ].join(" ")}
                    >
                      <DocumentFormatBadge format={document.format} size="sm" />
                      <p className="mt-2 text-body-md font-medium text-neutral-950">{document.name}</p>
                      <p className="mt-3 text-[12px] leading-4 text-neutral-500">
                        {formatDocumentActivity(document.updatedAt)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-12 text-center">
                <p className="text-body-md-secondary">{emptyCopy}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatedPanel open={documentPreviewOpen} className="shrink-0">
        {documentPreviewOpen ? (
          <DocumentPreviewPanel
            open
            documents={documentCollection}
            activeIndex={documentActiveIndex}
            collectionTitle="Document preview"
            initialView="preview"
            onSelect={setDocumentActiveIndex}
            onUpdateDocument={(index, next) =>
              setDocumentCollection((prev) => prev.map((doc, i) => (i === index ? next : doc)))
            }
            onClose={closeDocumentPreview}
          />
        ) : null}
      </AnimatedPanel>
    </div>
  );
}
