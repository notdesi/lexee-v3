"use client";

import { Check, Cloud } from "lucide-react";
import { TaskCard, type TaskCardData } from "@/components/TaskCard";

type ChatTaskDemoCardProps = {
  task: TaskCardData;
  synced?: boolean;
  onSync?: () => void;
};

export function ChatTaskDemoCard({ task, synced = false, onSync }: ChatTaskDemoCardProps) {
  return (
    <div className="mt-3 w-full max-w-md">
      <TaskCard task={task} className="rounded-xl" />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          disabled={synced}
          onClick={onSync}
          className={[
            "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-body-md-secondary ui-t-colors",
            synced
              ? "cursor-default bg-teal-50 text-teal-700"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950",
          ].join(" ")}
        >
          {synced ? (
            <Check className="h-4 w-4 shrink-0" strokeWidth={2} />
          ) : (
            <Cloud className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          )}
          {synced ? "Synced to CloudLex" : "Sync with CloudLex"}
        </button>
      </div>
    </div>
  );
}
