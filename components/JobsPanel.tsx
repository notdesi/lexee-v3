"use client";

import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { SegmentPillNav } from "@/components/SegmentPillNav";
import { CASES } from "@/lib/cases";
import {
  JOB_SCOPE_LABELS,
  JOB_STATUS_OPTIONS,
  formatJobTime,
  isCaseFilterActive,
  type Job,
  type JobActivityStep,
  type JobCaseFilterState,
  type JobStatusFilter,
} from "@/lib/jobs";
import { JobsCaseFilter } from "@/components/JobsCaseFilter";

type JobsPanelProps = {
  open: boolean;
  jobs: Job[];
  statusFilter: JobStatusFilter;
  expandedJobId: string | null;
  onStatusFilterChange: (value: JobStatusFilter) => void;
  onExpandedJobIdChange: (id: string | null) => void;
  onClose: () => void;
  showCaseFilter?: boolean;
  caseFilter?: JobCaseFilterState;
  onCaseFilterChange?: (value: JobCaseFilterState) => void;
};

const EMPTY_FILTER_COPY: Record<JobStatusFilter, string> = {
  queued: "No queued jobs.",
  running: "No running jobs.",
  complete: "No completed jobs.",
  failed: "No failed jobs.",
  cancelled: "No cancelled jobs.",
};

function ActivityStepRow({ step }: { step: JobActivityStep }) {
  return (
    <li className="flex items-start gap-2.5 py-1.5">
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
        {step.status === "done" ? (
          <Check className="h-3.5 w-3.5 text-teal-700" strokeWidth={2.25} />
        ) : step.status === "active" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" strokeWidth={2} />
        ) : step.status === "failed" ? (
          <X className="h-3.5 w-3.5 text-red-600" strokeWidth={2.25} />
        ) : (
          <span className="h-2 w-2 rounded-full border border-neutral-300 bg-transparent" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={[
            "block text-[13px] leading-5",
            step.status === "active"
              ? "font-medium text-neutral-950"
              : step.status === "pending"
                ? "text-neutral-500"
                : step.status === "failed"
                  ? "text-red-700"
                  : "text-neutral-700",
          ].join(" ")}
        >
          {step.label}
        </span>
        {step.detail ? (
          <span className="mt-0.5 block text-[11.5px] leading-4 text-neutral-500">{step.detail}</span>
        ) : null}
      </span>
    </li>
  );
}

function JobAccordionItem({
  job,
  expanded,
  onToggle,
}: {
  job: Job;
  expanded: boolean;
  onToggle: () => void;
}) {
  const timeLabel = job.completedAt
    ? `Finished ${formatJobTime(job.completedAt)}`
    : `Started ${formatJobTime(job.startedAt)}`;

  return (
    <li className="overflow-hidden rounded-xl border border-[color:var(--chat-outline)] bg-neutral-50 shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full flex-col gap-2 px-4 py-3 text-left ui-t-colors hover:bg-neutral-100"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-body-md font-medium text-neutral-950">{job.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {job.case ? (
                <>
                  <span className="text-caption text-neutral-600">{job.case.name}</span>
                  <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium leading-4 text-neutral-700">
                    {JOB_SCOPE_LABELS[job.case.scope]}
                  </span>
                </>
              ) : (
                <span className="text-caption text-neutral-500">No case</span>
              )}
            </div>
          </div>
          <ChevronDown
            className={[
              "mt-0.5 h-4 w-4 shrink-0 text-neutral-500 ui-t-transform",
              expanded ? "rotate-180" : "",
            ].join(" ")}
            strokeWidth={1.75}
          />
        </div>
        <p className="text-[12px] leading-4 text-neutral-500">{timeLabel}</p>
      </button>

      {expanded ? (
        <div className="border-t border-neutral-200 bg-[var(--background)] px-4 py-3">
          {job.activities.length > 0 ? (
            <>
              {job.status === "queued" ? (
                <p className="mb-2 text-[12px] leading-4 text-neutral-500">Waiting to start…</p>
              ) : null}
              <ul>
                {job.activities.map((step) => (
                  <ActivityStepRow key={step.id} step={step} />
                ))}
              </ul>
            </>
          ) : job.status === "queued" ? (
            <p className="text-body-md-secondary">Waiting to start…</p>
          ) : (
            <p className="text-body-md-secondary">No activity yet.</p>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function JobsPanel({
  open,
  jobs,
  statusFilter,
  expandedJobId,
  onStatusFilterChange,
  onExpandedJobIdChange,
  onClose,
  showCaseFilter = false,
  caseFilter,
  onCaseFilterChange,
}: JobsPanelProps) {
  const emptyMessage = useMemo(() => {
    if (showCaseFilter && caseFilter && isCaseFilterActive(caseFilter)) {
      const selectedNames = caseFilter.caseIds
        .map((id) => CASES.find((record) => record.id === id)?.name)
        .filter((name): name is string => Boolean(name));
      const hasUnassigned = caseFilter.includeUnassigned;

      if (hasUnassigned && selectedNames.length === 0) {
        return `No ${statusFilter} jobs without a case.`;
      }
      if (!hasUnassigned && selectedNames.length === 1) {
        return `No ${statusFilter} jobs for ${selectedNames[0]}.`;
      }
      return `No ${statusFilter} jobs matching the selected case filters.`;
    }
    return EMPTY_FILTER_COPY[statusFilter];
  }, [showCaseFilter, caseFilter, statusFilter]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <aside
      className={[
        "z-30 flex h-[100dvh] min-h-0 shrink-0 flex-col overflow-hidden border-l border-neutral-200 bg-[var(--background)]",
        "w-[clamp(487px,45.24vw,661px)]",
      ].join(" ")}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 px-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-inter text-[14px] font-medium leading-5 text-neutral-950">Jobs</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
          aria-label="Close jobs panel"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </button>
      </div>

      <div className="shrink-0 border-b border-neutral-200 px-3 py-3">
        <SegmentPillNav
          options={JOB_STATUS_OPTIONS}
          value={statusFilter}
          onChange={onStatusFilterChange}
          ariaLabel="Job status"
        />
        {showCaseFilter && onCaseFilterChange && caseFilter ? (
          <div className="mt-2.5">
            <JobsCaseFilter value={caseFilter} onChange={onCaseFilterChange} />
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-100 px-3 py-3">
        {jobs.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {jobs.map((job) => (
              <JobAccordionItem
                key={job.id}
                job={job}
                expanded={expandedJobId === job.id}
                onToggle={() =>
                  onExpandedJobIdChange(expandedJobId === job.id ? null : job.id)
                }
              />
            ))}
          </ul>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 px-6 py-10 text-center">
            <p className="text-body-md-secondary">{emptyMessage}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
