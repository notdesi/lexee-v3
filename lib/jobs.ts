import type { CaseScope } from "@/lib/cases";
import { CASES } from "@/lib/cases";
import { GENERATION_PHASES } from "@/lib/generation-phases";
import type { GenerationProgress } from "@/lib/generation-phases";

export type JobStatus = "queued" | "running" | "complete" | "failed" | "cancelled";

export type JobCaseRef = {
  id?: string;
  name: string;
  caseNumber?: string;
  scope: CaseScope;
} | null;

export type JobCaseFilterState = {
  caseIds: string[];
  includeUnassigned: boolean;
};

export const EMPTY_CASE_FILTER: JobCaseFilterState = {
  caseIds: [],
  includeUnassigned: false,
};
export type JobActivityStatus = "pending" | "active" | "done" | "failed";

export type JobActivityStep = {
  id: string;
  label: string;
  status: JobActivityStatus;
  detail?: string;
};

export type Job = {
  id: string;
  title: string;
  status: JobStatus;
  case: JobCaseRef;
  startedAt: string;
  completedAt?: string;
  activities: JobActivityStep[];
};

export type JobStatusFilter = JobStatus;

export const JOB_STATUS_OPTIONS: { value: JobStatusFilter; label: string }[] = [
  { value: "queued", label: "Queued" },
  { value: "running", label: "Running" },
  { value: "complete", label: "Complete" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export const JOB_SCOPE_LABELS: Record<CaseScope, string> = {
  lead: "Lead",
  intake: "Intake",
  matter: "Matter",
};

export function createPlannedActivities(): JobActivityStep[] {
  return GENERATION_PHASES.map((phase, index) => ({
    id: `step-${index}`,
    label: phase.label,
    status: "pending" as const,
  }));
}

export function activitiesFromGenerationProgress(progress: GenerationProgress): JobActivityStep[] {
  const steps = createPlannedActivities();
  const activeIndex = Math.min(progress.step, steps.length - 1);

  return steps.map((step, index) => {
    if (index < activeIndex) {
      return { ...step, status: "done" as const };
    }
    if (index === activeIndex) {
      return { ...step, label: progress.headline, status: "active" as const };
    }
    return step;
  });
}

export function finalizeActivities(activities: JobActivityStep[]): JobActivityStep[] {
  return activities.map((step) =>
    step.status === "active" || step.status === "pending"
      ? { ...step, status: "done" as const }
      : step,
  );
}

export function failActivities(activities: JobActivityStep[]): JobActivityStep[] {
  let failedMarked = false;
  return activities.map((step) => {
    if (step.status === "done") return step;
    if (!failedMarked && (step.status === "active" || step.status === "pending")) {
      failedMarked = true;
      return { ...step, status: "failed" as const };
    }
    return step;
  });
}

export function jobTitleFromPrompt(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) return "Process request";
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 45)}…`;
}

export function formatJobTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function activeJobCount(jobs: Job[]): number {
  return jobs.filter((job) => job.status === "queued" || job.status === "running").length;
}

export function isCaseFilterActive(filter: JobCaseFilterState): boolean {
  return filter.caseIds.length > 0 || filter.includeUnassigned;
}

export function jobMatchesCaseFilter(job: Job, filter: JobCaseFilterState): boolean {
  if (!isCaseFilterActive(filter)) return true;
  if (filter.includeUnassigned && job.case === null) return true;
  if (!job.case) return false;
  if (job.case.id && filter.caseIds.includes(job.case.id)) return true;
  return filter.caseIds.some((id) => {
    const record = CASES.find((entry) => entry.id === id);
    return record !== undefined && job.case?.name === record.name;
  });
}

export function caseRefFromMatterName(matterName: string | null): JobCaseRef {
  if (!matterName) return null;
  const record = CASES.find((entry) => entry.name === matterName);
  if (!record) {
    return { name: matterName, scope: "matter" as CaseScope };
  }
  return {
    id: record.id,
    name: record.name,
    caseNumber: record.caseNumber,
    scope: record.scope,
  };
}

export function caseRefFromCaseRecord(caseRecord: {
  id: string;
  name: string;
  caseNumber: string;
  scope: CaseScope;
}): JobCaseRef {
  return {
    id: caseRecord.id,
    name: caseRecord.name,
    caseNumber: caseRecord.caseNumber,
    scope: caseRecord.scope,
  };
}

export const DEMO_QUEUED_JOB_ID = "demo-queued-job";

export function createDemoQueuedActivities(): JobActivityStep[] {
  return [
    {
      id: "step-0",
      label: "Review medical records",
      status: "pending",
      detail: "Scan uploaded charts, imaging, and treatment notes",
    },
    {
      id: "step-1",
      label: "Extract key findings",
      status: "pending",
      detail: "Identify diagnoses, procedures, and care timelines",
    },
    {
      id: "step-2",
      label: "Draft summary document",
      status: "pending",
      detail: "Structure a narrative summary for attorney review",
    },
    {
      id: "step-3",
      label: "Cross-reference citations",
      status: "pending",
      detail: "Link each finding back to source records",
    },
  ];
}

export function createDemoQueuedJob(): Job {
  const matter = CASES.find((entry) => entry.id === "matter-1");
  return {
    id: DEMO_QUEUED_JOB_ID,
    title: "Draft medical summary",
    status: "queued",
    case: matter
      ? {
          id: matter.id,
          name: matter.name,
          caseNumber: matter.caseNumber,
          scope: matter.scope,
        }
      : null,
    startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    activities: createDemoQueuedActivities(),
  };
}
