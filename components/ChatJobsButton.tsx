"use client";

import { Briefcase } from "lucide-react";

type ChatJobsButtonProps = {
  activeCount: number;
  onClick: () => void;
  active?: boolean;
};

export function ChatJobsButton({ activeCount, onClick, active = false }: ChatJobsButtonProps) {
  return (
    <span className="relative inline-flex shrink-0 p-0.5">
      <button
        type="button"
        aria-label={`Jobs${activeCount > 0 ? `, ${activeCount} active` : ""}`}
        onClick={onClick}
        className={[
          "inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 ui-t-colors",
          "hover:bg-neutral-200/80 hover:text-neutral-950",
          active ? "bg-neutral-200/80 text-neutral-950" : "",
        ].join(" ")}
      >
        <Briefcase className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </button>
      {activeCount > 0 ? (
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-medium leading-none text-white"
        >
          {activeCount > 9 ? "9+" : activeCount}
        </span>
      ) : null}
    </span>
  );
}
