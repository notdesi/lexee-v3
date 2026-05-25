function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 ${className}`} aria-hidden="true" />;
}

export function HomeLoadingSkeleton() {
  return (
    <div className="flex min-h-full w-full flex-1 bg-[var(--background)]">
      <div className="flex min-h-full min-w-0 flex-1 flex-col pl-4 pr-6">
        <div className="sticky top-0 z-20 flex w-full shrink-0 justify-start pb-8 pt-2">
          <SkeletonBlock className="h-8 w-44 rounded-lg" />
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center pb-16 pt-10">
          <div className="flex flex-col items-center gap-12 px-0">
            <SkeletonBlock className="h-10 w-72 rounded-lg" />

            <div className="w-full max-w-2xl">
              <div className="rounded-xl border border-[color:var(--chat-outline)] bg-[var(--chatbox-bg)] px-3 py-2.5 shadow-[var(--shadow-chatbox)]">
                <SkeletonBlock className="h-6 w-80" />
                <div className="mt-2 flex items-center justify-between">
                  <SkeletonBlock className="h-8 w-8 rounded-md" />
                  <SkeletonBlock className="h-8 w-8 rounded-full" />
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-[color:var(--chat-outline-accent)] bg-violet-50/70 p-3 shadow-[var(--shadow-card)]">
                <SkeletonBlock className="h-4 w-full rounded" />
                <SkeletonBlock className="mt-3 h-9 w-full rounded-lg" />
              </div>
            </div>
          </div>
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
