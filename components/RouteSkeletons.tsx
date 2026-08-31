function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 ${className}`} aria-hidden="true" />;
}

export function HomeLoadingSkeleton() {
  return (
    <div className="flex min-h-full w-full flex-1 bg-[var(--background)]">
      <div className="flex min-h-full min-w-0 flex-1 flex-col pl-4 pr-6">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center pb-16">
          <div className="flex flex-col items-center gap-[38.4px] px-0">
            <SkeletonBlock className="h-9 w-72 rounded-lg" />

            <div className="w-full max-w-[620px]">
              <div className="flex min-h-[120px] w-full flex-col rounded-[20px] border border-[color:var(--chat-outline)] bg-[var(--chatbox-bg)] px-5 py-4 shadow-[var(--shadow-chatbox)]">
                <SkeletonBlock className="min-h-[48px] flex-1 rounded" />
                <div className="mt-1.5 flex shrink-0 items-center justify-between">
                  <SkeletonBlock className="h-8 w-8 rounded-full" />
                  <SkeletonBlock className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CasesLoadingSkeleton() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] px-8 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <SkeletonBlock className="h-10 w-32 rounded-lg" />
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-9 w-9 rounded-lg" />
            <SkeletonBlock className="h-9 w-28 rounded-lg" />
            <SkeletonBlock className="h-9 w-24 rounded-lg" />
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <SkeletonBlock className="h-9 w-16 rounded-lg" />
          <SkeletonBlock className="h-9 w-16 rounded-lg" />
          <SkeletonBlock className="h-9 w-20 rounded-lg" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function SkillsLoadingSkeleton() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] px-8 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <SkeletonBlock className="h-10 w-36 rounded-lg" />
            <SkeletonBlock className="mt-3 h-5 w-96" />
          </div>
          <SkeletonBlock className="h-10 w-28 rounded-full" />
        </div>

        <SkeletonBlock className="mt-8 h-11 w-full rounded-xl" />

        <div className="mt-10 grid grid-cols-2 gap-3">
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CaseDetailLoadingSkeleton() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] pl-4 pr-6">
      <div className="shrink-0 pt-2">
        <SkeletonBlock className="h-5 w-48 rounded-md" />
      </div>
      <div className="mx-auto w-full max-w-[620px] pt-16 pb-16">
        <SkeletonBlock className="h-4 w-32 rounded-md" />
        <div className="mt-1 flex items-center justify-between gap-6">
          <SkeletonBlock className="h-10 w-72 max-w-full rounded-lg" />
          <div className="flex gap-1">
            <SkeletonBlock className="h-9 w-9 rounded-lg" />
            <SkeletonBlock className="h-9 w-9 rounded-lg" />
          </div>
        </div>
        <div className="mx-auto mt-10 w-full max-w-[620px]">
          <div className="flex min-h-[120px] w-full flex-col rounded-[20px] border border-[color:var(--chat-outline)] bg-[var(--chatbox-bg)] px-5 py-4 shadow-[var(--shadow-chatbox)]">
            <SkeletonBlock className="min-h-[48px] flex-1 rounded" />
            <div className="mt-1.5 flex shrink-0 items-center justify-between">
              <SkeletonBlock className="h-8 w-8 rounded-full" />
              <SkeletonBlock className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <SkeletonBlock className="mt-12 h-4 w-16 rounded-md" />
          <div className="mt-2 flex flex-col divide-y divide-neutral-200">
            <SkeletonBlock className="h-11 w-full rounded-lg" />
            <SkeletonBlock className="h-11 w-full rounded-lg" />
            <SkeletonBlock className="h-11 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArtifactsLoadingSkeleton() {
  return (
    <div className="flex h-[100dvh] min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--background)]">
      <div className="flex w-full shrink-0 justify-end px-4 pt-2 pb-2">
        <SkeletonBlock className="h-10 w-44 rounded-md" />
      </div>
      <div className="mx-auto flex w-full max-w-5xl min-h-0 flex-1 flex-col px-8 pb-8 pt-2">
        <SkeletonBlock className="h-10 w-72 rounded-lg" />
        <SkeletonBlock className="mt-3 h-5 w-96" />

        <div className="mt-8 rounded-xl border border-neutral-200 bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-card)]">
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <div className="mt-3 flex flex-wrap gap-2">
            <SkeletonBlock className="h-8 w-32 rounded-full" />
            <SkeletonBlock className="h-8 w-24 rounded-full" />
            <SkeletonBlock className="h-8 w-24 rounded-full" />
            <SkeletonBlock className="h-8 w-28 rounded-full" />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <SkeletonBlock className="h-5 w-48" />
        </div>
      </div>
    </div>
  );
}

export function FeedbackLoadingSkeleton() {
  return (
    <div className="flex h-[100dvh] min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--background)]">
      <div className="flex w-full shrink-0 px-4 pt-2 pb-2">
        <SkeletonBlock className="h-8 w-48 rounded-md" />
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 pb-16">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center">
            <SkeletonBlock className="h-12 w-12 rounded-full" />
            <SkeletonBlock className="mt-4 h-8 w-72 rounded-lg" />
            <SkeletonBlock className="mt-3 h-5 w-full max-w-lg rounded" />
            <SkeletonBlock className="mt-2 h-5 w-[90%] max-w-md rounded" />
          </div>

          <div className="w-full max-w-2xl">
            <div className="rounded-2xl border border-[color:var(--chat-outline)] bg-[var(--chatbox-bg)] px-3 py-2.5 shadow-[var(--shadow-chatbox)]">
              <SkeletonBlock className="h-6 w-64" />
              <div className="mt-2 flex items-center justify-end">
                <SkeletonBlock className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkillsCategoryLoadingSkeleton() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] px-8 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <SkeletonBlock className="h-6 w-20 rounded" />
        <SkeletonBlock className="mt-3 h-7 w-56 rounded" />

        <div className="mt-10 grid grid-cols-2 gap-3">
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
          <SkeletonBlock className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
