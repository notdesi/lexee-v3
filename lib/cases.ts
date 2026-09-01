export type CaseScope = "lead" | "intake" | "matter";

export type CaseType = "Admiralty" | "Arbitration" | "Auto Accident";

export type CaseRecord = {
  id: string;
  name: string;
  caseNumber: string;
  scope: CaseScope;
  type: CaseType;
  updatedAt: string;
  createdAt: string;
};

export const CASES: CaseRecord[] = [
  {
    id: "lead-1",
    name: "Metro Health incident inquiry",
    caseNumber: "LEAD-2026-0142",
    scope: "lead",
    type: "Auto Accident",
    updatedAt: "2026-08-31T10:00:00Z",
    createdAt: "2026-08-31T09:30:00Z",
  },
  {
    id: "lead-2",
    name: "Acme Insurance referral",
    caseNumber: "LEAD-2026-0098",
    scope: "lead",
    type: "Arbitration",
    updatedAt: "2026-08-29T14:00:00Z",
    createdAt: "2026-08-29T12:00:00Z",
  },
  {
    id: "intake-1",
    name: "Client interview notes — Murdock v. Metro Health",
    caseNumber: "INT-2026-0031",
    scope: "intake",
    type: "Auto Accident",
    updatedAt: "2026-08-30T16:00:00Z",
    createdAt: "2026-08-28T11:00:00Z",
  },
  {
    id: "matter-1",
    name: "Murdock v. Metro Health",
    caseNumber: "2024-CV-01842",
    scope: "matter",
    type: "Auto Accident",
    updatedAt: "2026-08-31T08:00:00Z",
    createdAt: "2024-03-12T09:00:00Z",
  },
  {
    id: "matter-2",
    name: "Geramita vs Ayal",
    caseNumber: "2025-CV-00671",
    scope: "matter",
    type: "Admiralty",
    updatedAt: "2026-08-27T13:00:00Z",
    createdAt: "2025-01-08T10:00:00Z",
  },
];

export function countCasesByScope(cases: readonly CaseRecord[]): Record<CaseScope, number> {
  return cases.reduce(
    (counts, record) => {
      counts[record.scope] += 1;
      return counts;
    },
    { lead: 0, intake: 0, matter: 0 } satisfies Record<CaseScope, number>,
  );
}

export function getCaseById(id: string): CaseRecord | undefined {
  return CASES.find((record) => record.id === id);
}

export function formatLastActivity(isoDate: string): string {
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

export function formatRelativeActivity(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
