export default function Loading() {
  return (
    <div className="flex h-[100dvh] min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--background)] px-8 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div
          className="h-10 w-48 animate-pulse rounded-lg bg-neutral-200"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
