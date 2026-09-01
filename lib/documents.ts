import type { DocumentPreview } from "@/components/DocumentPreviewPanel";
import type { CaseRecord } from "@/lib/cases";
import { createSampleDocumentPreview } from "@/lib/document-preview-names";

export type DocumentStatus = "awaiting-review" | "approved" | "rejected" | "superseded";

export type DocumentRecord = {
  id: string;
  name: string;
  format: string;
  status: DocumentStatus;
  updatedAt: string;
  /** Null for documents that have not been filed under a case yet. */
  caseId: CaseRecord["id"] | null;
};

export type DocumentCaseFilter = "all" | "unassigned" | CaseRecord["id"];

export const DOCUMENTS: DocumentRecord[] = [
  {
    id: "doc-1",
    name: "Summons and Complaint",
    format: "PDF",
    status: "awaiting-review",
    updatedAt: "2026-08-31T10:00:00Z",
    caseId: "matter-1",
  },
  {
    id: "doc-2",
    name: "Medical Summary",
    format: "PDF",
    status: "awaiting-review",
    updatedAt: "2026-08-30T16:30:00Z",
    caseId: "matter-1",
  },
  {
    id: "doc-3",
    name: "Demand Letter — Liability Carrier",
    format: "DOCX",
    status: "awaiting-review",
    updatedAt: "2026-08-29T09:15:00Z",
    caseId: "matter-2",
  },
  {
    id: "doc-4",
    name: "Cervical Spine MRI Report",
    format: "PDF",
    status: "awaiting-review",
    updatedAt: "2026-08-28T14:00:00Z",
    caseId: "intake-1",
  },
  {
    id: "doc-5",
    name: "HIPAA Authorization — Medical Release",
    format: "PDF",
    status: "approved",
    updatedAt: "2026-08-27T11:00:00Z",
    caseId: "matter-1",
  },
  {
    id: "doc-6",
    name: "Hospital Discharge Summary",
    format: "PDF",
    status: "approved",
    updatedAt: "2026-08-26T08:45:00Z",
    caseId: "matter-1",
  },
  {
    id: "doc-7",
    name: "Affidavit of Service",
    format: "PDF",
    status: "approved",
    updatedAt: "2026-08-25T13:20:00Z",
    caseId: "matter-2",
  },
  {
    id: "doc-8",
    name: "Motion to Compel Discovery",
    format: "DOCX",
    status: "rejected",
    updatedAt: "2026-08-24T10:00:00Z",
    caseId: "matter-1",
  },
  {
    id: "doc-9",
    name: "Interrogatories — Set One",
    format: "PDF",
    status: "rejected",
    updatedAt: "2026-08-22T15:30:00Z",
    caseId: "matter-2",
  },
  {
    id: "doc-10",
    name: "Settlement Conference Memorandum",
    format: "DOCX",
    status: "superseded",
    updatedAt: "2026-08-20T09:00:00Z",
    caseId: "matter-2",
  },
  {
    id: "doc-11",
    name: "Demand letter draft",
    format: "DOCX",
    status: "superseded",
    updatedAt: "2026-08-18T12:00:00Z",
    caseId: null,
  },
];

export function countDocumentsByStatus(
  documents: readonly DocumentRecord[],
): Record<DocumentStatus, number> {
  return documents.reduce(
    (counts, document) => {
      counts[document.status] += 1;
      return counts;
    },
    {
      "awaiting-review": 0,
      approved: 0,
      rejected: 0,
      superseded: 0,
    } satisfies Record<DocumentStatus, number>,
  );
}

/**
 * Counts documents per case, plus the `all` and `unassigned` buckets the case
 * filter needs. Pass a status to scope the counts to one status tab.
 */
export function countDocumentsByCase(
  documents: readonly DocumentRecord[],
  status?: DocumentStatus,
): Record<DocumentCaseFilter, number> {
  const scoped = status ? documents.filter((document) => document.status === status) : documents;

  return scoped.reduce<Record<DocumentCaseFilter, number>>(
    (counts, document) => {
      const key = document.caseId ?? "unassigned";
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    },
    { all: scoped.length, unassigned: 0 },
  );
}

export function documentMatchesCaseFilter(
  document: DocumentRecord,
  filter: DocumentCaseFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "unassigned") return document.caseId === null;
  return document.caseId === filter;
}

export function documentRecordToPreview(record: DocumentRecord): DocumentPreview {
  if (record.format === "PDF") {
    return createSampleDocumentPreview({
      title: record.name,
      format: record.format,
      src: "/sampledocument.pdf",
    });
  }

  return createSampleDocumentPreview({
    title: record.name,
    format: record.format,
    src: undefined,
    body: `${record.name}\n\nPrototype document content for review.`,
    editable: true,
    isLexeeGenerated: true,
  });
}

export function formatDocumentActivity(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
