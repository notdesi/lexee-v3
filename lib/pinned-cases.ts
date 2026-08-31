export type { PinnedCaseEntry } from "@/lib/case-workspace";
export type { CaseScope } from "@/lib/cases";

/** @deprecated Use CASE_WORKSPACE_EVENT from lib/case-workspace */
export const PINNED_CASES_EVENT = "lexee:pinned-cases-changed";

/** @deprecated Use pinCase / unpinCase from lib/case-workspace */
export function dispatchPinnedCases(
  _cases: import("@/lib/case-workspace").PinnedCaseEntry[],
) {
  // Kept for backward compatibility during migration.
}
