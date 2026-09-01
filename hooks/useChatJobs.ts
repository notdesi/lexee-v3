"use client";

import { useCallback, useMemo, useState } from "react";
import type { GenerationProgress } from "@/lib/generation-phases";
import {
  activitiesFromGenerationProgress,
  activeJobCount,
  createPlannedActivities,
  failActivities,
  finalizeActivities,
  jobMatchesCaseFilter,
  type Job,
  type JobCaseFilterState,
  type JobCaseRef,
  type JobStatus,
  type JobStatusFilter,
  EMPTY_CASE_FILTER,
  createDemoQueuedJob,
} from "@/lib/jobs";

type UseChatJobsOptions = {
  includeDemoJob?: boolean;
};

const initialJobs = (includeDemoJob: boolean): Job[] =>
  includeDemoJob ? [createDemoQueuedJob()] : [];

type StartJobInput = {
  title: string;
  caseRef?: JobCaseRef;
  queued?: boolean;
};

export function useChatJobs({ includeDemoJob = false }: UseChatJobsOptions = {}) {
  const [jobs, setJobs] = useState<Job[]>(() => initialJobs(includeDemoJob));
  const [jobsPanelOpen, setJobsPanelOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>("running");
  const [caseFilter, setCaseFilter] = useState<JobCaseFilterState>(EMPTY_CASE_FILTER);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const visibleJobs = useMemo(
    () =>
      jobs.filter(
        (job) => job.status === statusFilter && jobMatchesCaseFilter(job, caseFilter),
      ),
    [jobs, statusFilter, caseFilter],
  );

  const runningCount = useMemo(() => activeJobCount(jobs), [jobs]);

  const openJobsPanel = useCallback(() => {
    setJobsPanelOpen(true);
  }, []);

  const closeJobsPanel = useCallback(() => {
    setJobsPanelOpen(false);
  }, []);

  const resetJobs = useCallback(() => {
    setJobs(initialJobs(includeDemoJob));
    setJobsPanelOpen(false);
    setExpandedJobId(null);
    setStatusFilter("running");
    setCaseFilter(EMPTY_CASE_FILTER);
  }, [includeDemoJob]);

  const startJob = useCallback(({ title, caseRef = null, queued = false }: StartJobInput) => {
    const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const job: Job = {
      id,
      title,
      status: queued ? "queued" : "running",
      case: caseRef,
      startedAt: now,
      activities: queued
        ? createPlannedActivities()
        : activitiesFromGenerationProgress({
            headline: createPlannedActivities()[0]?.label ?? "Lexee is thinking…",
            step: 0,
          }),
    };

    setJobs((prev) => [job, ...prev]);
    setExpandedJobId(id);
    if (!queued) {
      setStatusFilter("running");
    }
    return id;
  }, []);

  const promoteJob = useCallback((jobId: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId && job.status === "queued"
          ? {
              ...job,
              status: "running" as const,
              activities: activitiesFromGenerationProgress({
                headline: job.activities[0]?.label ?? "Lexee is thinking…",
                step: 0,
              }),
            }
          : job,
      ),
    );
  }, []);

  const syncJobProgress = useCallback((jobId: string, progress: GenerationProgress) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "running" as const,
              activities: activitiesFromGenerationProgress(progress),
            }
          : job,
      ),
    );
  }, []);

  const setJobStatus = useCallback(
    (jobId: string, status: JobStatus) => {
      const now = new Date().toISOString();
      setJobs((prev) =>
        prev.map((job) => {
          if (job.id !== jobId) return job;
          if (status === "complete") {
            return {
              ...job,
              status,
              completedAt: now,
              activities: finalizeActivities(job.activities),
            };
          }
          if (status === "failed") {
            return {
              ...job,
              status,
              completedAt: now,
              activities: failActivities(job.activities),
            };
          }
          if (status === "cancelled") {
            return {
              ...job,
              status,
              completedAt: now,
              activities: job.activities.map((step) =>
                step.status === "active"
                  ? { ...step, status: "failed" as const, detail: "Cancelled" }
                  : step,
              ),
            };
          }
          return { ...job, status };
        }),
      );
    },
    [],
  );

  const completeJob = useCallback(
    (jobId: string) => setJobStatus(jobId, "complete"),
    [setJobStatus],
  );

  const failJob = useCallback((jobId: string) => setJobStatus(jobId, "failed"), [setJobStatus]);

  const cancelJob = useCallback(
    (jobId: string) => setJobStatus(jobId, "cancelled"),
    [setJobStatus],
  );

  const bindGenerationProgress = useCallback(
    (jobId: string, onProgress?: (progress: GenerationProgress) => void) => {
      return (progress: GenerationProgress) => {
        syncJobProgress(jobId, progress);
        onProgress?.(progress);
      };
    },
    [syncJobProgress],
  );

  return {
    jobs,
    visibleJobs,
    jobsPanelOpen,
    setJobsPanelOpen,
    statusFilter,
    setStatusFilter,
    caseFilter,
    setCaseFilter,
    expandedJobId,
    setExpandedJobId,
    runningCount,
    openJobsPanel,
    closeJobsPanel,
    resetJobs,
    startJob,
    promoteJob,
    syncJobProgress,
    completeJob,
    failJob,
    cancelJob,
    bindGenerationProgress,
  };
}
